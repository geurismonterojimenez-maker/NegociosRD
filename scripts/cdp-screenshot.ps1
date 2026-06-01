param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Out,
  [int]$Width = 390,
  [int]$Height = 1200,
  [switch]$Mobile
)

$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$port = Get-Random -Minimum 9300 -Maximum 9500
$userDir = Join-Path $env:TEMP ("negociord-cdp-qa-" + [Guid]::NewGuid().ToString('N'))

$chromeProcess = Start-Process -FilePath $chrome -ArgumentList @(
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  "--remote-debugging-port=$port",
  "--user-data-dir=$userDir",
  "--window-size=$Width,$Height",
  'about:blank'
) -WindowStyle Hidden -PassThru

try {
  $deadline = (Get-Date).AddSeconds(10)
  do {
    Start-Sleep -Milliseconds 250
    try {
      $null = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/version" -TimeoutSec 1
      break
    } catch {
      if ((Get-Date) -gt $deadline) { throw }
    }
  } while ($true)

  $target = Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:$port/json/new?$Url"
  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $ws.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
  $script:id = 0

  function Send-CDP {
    param([string]$Method, [hashtable]$Params)
    $script:id++
    $obj = @{ id = $script:id; method = $Method }
    if ($Params) { $obj.params = $Params }
    $json = $obj | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $ws.SendAsync([ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).Wait()

    $builder = [Text.StringBuilder]::new()
    while ($true) {
      [void]$builder.Clear()
      do {
        $buffer = New-Object byte[] 1048576
        $recv = $ws.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).Result
        [void]$builder.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $recv.Count))
      } until ($recv.EndOfMessage)

      $msg = $builder.ToString() | ConvertFrom-Json
      if ($msg.id -eq $script:id) { return $msg }
    }
  }

  Send-CDP 'Page.enable' | Out-Null
  Send-CDP 'Runtime.enable' | Out-Null
  Send-CDP 'Emulation.setDeviceMetricsOverride' @{
    width = $Width
    height = $Height
    deviceScaleFactor = 1
    mobile = [bool]$Mobile
  } | Out-Null
  Send-CDP 'Page.navigate' @{ url = $Url } | Out-Null
  Start-Sleep -Seconds 10

  $metrics = Send-CDP 'Runtime.evaluate' @{
    expression = '({text: document.body.innerText.slice(0,160), scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, ready: !!document.querySelector("#root")})'
    returnByValue = $true
  }
  $shot = Send-CDP 'Page.captureScreenshot' @{ format = 'png'; captureBeyondViewport = $false }
  [IO.File]::WriteAllBytes($Out, [Convert]::FromBase64String($shot.result.data))
  $metrics.result.result.value | ConvertTo-Json -Compress
} finally {
  if ($ws) {
    try { $ws.Dispose() } catch {}
  }
  if ($chromeProcess -and -not $chromeProcess.HasExited) {
    taskkill /PID $chromeProcess.Id /T /F | Out-Null
  }
  if (Test-Path $userDir) {
    Remove-Item -LiteralPath $userDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
