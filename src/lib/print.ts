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

  .print-shell > * {
    width: 100% !important;
    max-width: 100% !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: #ffffff !important;
    color: #111827 !important;
    padding: 0 !important;
    margin: 0 !important;
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

  th {
    background: #f3f4f6;
    color: #111827;
    font-weight: 700;
  }

  th,
  td {
    border: 1px solid #d1d5db;
    padding: 6pt 7pt;
    vertical-align: top;
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

  [data-print-kind="legal-document"] {
    font-family: Georgia, "Times New Roman", serif !important;
    font-size: 11pt !important;
    line-height: 1.58 !important;
    color: #111827 !important;
    white-space: normal !important;
  }

  [data-print-kind="legal-document"] .legal-document-header {
    display: block !important;
    border-bottom: 2px solid #0f766e;
    margin-bottom: 18pt;
    padding-bottom: 10pt;
    text-align: center;
  }

  [data-print-kind="legal-document"] .legal-document-brand {
    color: #0f766e;
    font-family: Inter, Arial, sans-serif;
    font-size: 9pt;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  [data-print-kind="legal-document"] .legal-document-title {
    margin: 5pt 0 3pt;
    color: #111827;
    font-size: 16pt;
    font-weight: 700;
    line-height: 1.18;
    text-transform: uppercase;
  }

  [data-print-kind="legal-document"] .legal-document-meta {
    color: #4b5563;
    font-family: Inter, Arial, sans-serif;
    font-size: 8.5pt;
  }

  [data-print-kind="legal-document"] .legal-document-body {
    white-space: pre-wrap !important;
    text-align: justify;
    hyphens: auto;
  }

  [data-print-kind="legal-document"] .legal-document-footer {
    display: block !important;
    margin-top: 22pt;
    padding-top: 8pt;
    border-top: 1px solid #d1d5db;
    color: #4b5563;
    font-family: Inter, Arial, sans-serif;
    font-size: 8.5pt;
    line-height: 1.35;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  [data-print-kind="legal-document"] .print\\:hidden,
  [data-print-kind="legal-document"] .absolute {
    display: none !important;
  }

  [data-print-kind="report-document"] {
    font-family: Inter, Arial, sans-serif !important;
    font-size: 10pt !important;
    line-height: 1.45 !important;
  }

  [data-print-kind="report-document"] h1,
  [data-print-kind="report-document"] h2,
  [data-print-kind="report-document"] h3 {
    color: #0f766e !important;
    page-break-after: avoid;
    break-after: avoid;
  }

  [data-print-kind="report-document"] .rounded-2xl,
  [data-print-kind="report-document"] .rounded-xl,
  [data-print-kind="report-document"] .rounded-lg {
    border-radius: 0 !important;
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
