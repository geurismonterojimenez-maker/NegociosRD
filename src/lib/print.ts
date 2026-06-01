const printableBaseCss = `
  @page {
    margin: 1.45cm;
    size: letter portrait;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111827;
    font-family: Inter, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
  }

  body {
    padding: 0;
  }

  .print-shell {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    background: #ffffff;
  }

  .print-shell,
  .print-shell * {
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important;
  }

  .print-shell button,
  .print-shell select,
  .print-shell input,
  .print-shell textarea,
  .print-shell .print\\:hidden {
    display: none !important;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
    break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  tr,
  .print-avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  a {
    color: #111827;
    text-decoration: none;
  }
`;

export function printElementById(elementId: string, title = 'Tu Negocio RD - Documento') {
  if (typeof window === 'undefined') return false;
  const source = document.getElementById(elementId);
  if (!source) return false;

  const printWindow = window.open('', '_blank', 'width=980,height=1200');
  if (!printWindow) {
    window.print();
    return false;
  }

  const cloned = source.cloneNode(true) as HTMLElement;
  cloned.querySelectorAll('style').forEach((styleEl) => styleEl.remove());
  cloned.querySelectorAll('button, select, input, textarea, .print\\:hidden').forEach((el) => el.remove());
  cloned.removeAttribute('id');
  cloned.className = '';
  cloned.style.cssText = '';

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="es-DO">
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '&lt;')}</title>
    <style>${printableBaseCss}</style>
  </head>
  <body>
    <main class="print-shell">${cloned.outerHTML}</main>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          window.focus();
          window.print();
          setTimeout(function () { window.close(); }, 400);
        }, 120);
      });
    </script>
  </body>
</html>`);
  printWindow.document.close();
  return true;
}
