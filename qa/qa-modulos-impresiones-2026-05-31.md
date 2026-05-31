# QA completo de modulos e impresiones - NegocioRD

Fecha: 2026-05-31  
Rama revisada: `codex/admin-console-private`  
Alcance: modulos publicos, PRO, administracion, APIs, calculadoras, persistencia local, exportaciones e impresiones de documentos.

## Resumen ejecutivo

El proyecto compila correctamente y las pruebas automaticas de calculos pasan. No encontre errores bloqueantes de TypeScript ni de build. La mayor oportunidad esta en la calidad de impresion/exportacion: el sistema ya tiene varios documentos imprimibles, pero la regla global de impresion usa `position: fixed`, `max-height: 100%` y `page-break-inside: avoid`, lo que puede cortar contratos, tablas largas y reportes multipagina.

Resultado de verificacion automatica:

- `npm.cmd run lint`: OK.
- `npm.cmd run test:calculations`: OK.
- `npm.cmd run build`: OK.
- Aviso no bloqueante: chunk principal `index` mayor de 500 kB.

## Hallazgos prioritarios

### P0 - Ninguno bloqueante

No hay fallo critico que impida construir la app o ejecutar las pruebas de calculo.

### P1 - Impresiones largas pueden quedar cortadas

Archivo: `src/index.css`  
Impacto: contratos, hojas timbradas, tablas de amortizacion, documentos corporativos, volantes y resultados de calculadoras.

La regla global de impresion oculta todo el `body` y luego fuerza los bloques imprimibles con `position: fixed`, `max-height: 100%` y `page-break-inside: avoid`. En documentos cortos se ve bien, pero en contenido largo el navegador puede imprimir solo la primera pagina o cortar contenido al final.

Mejora recomendada:

- Cambiar los contenedores imprimibles a `position: static` o `absolute` solo cuando sea necesario.
- Quitar `max-height: 100%` en impresion.
- Evitar `page-break-inside: avoid` en el contenedor principal.
- Aplicar `break-inside: avoid` solo a bloques pequenos como tarjetas de totales o firmas.
- Usar `thead { display: table-header-group; }` y `tfoot { display: table-footer-group; }` para tablas largas.

### P1 - Exportaciones dicen Excel, pero generan CSV basico

Archivos: `src/components/ProfessionalPortal.tsx`, `src/components/EmpresarialesCalculators.tsx`, `src/components/LaboralCalculators.tsx`, `src/components/CentroFinanciero.tsx`

El usuario ve "Excel" en varios botones, pero tecnicamente se descarga CSV. Esto puede abrir en Excel, pero no es un `.xlsx` real, no trae estilos, hojas multiples, formulas, logos, validaciones ni formato contable.

Mejora recomendada:

- Renombrar botones a "Exportar CSV" si se mantiene el formato actual.
- Para PRO, agregar exportacion real `.xlsx` con hoja de resumen, detalle, metadata, tasas usadas y fecha de emision.
- Agregar BOM UTF-8 (`\uFEFF`) para evitar caracteres rotos en Excel.
- Ofrecer separador `;` para equipos configurados en espanol/Republica Dominicana.

### P1 - Algunas vistas tienen mojibake en textos

Archivo observado: `src/components/ProfessionalPortal.tsx` y otras salidas renderizadas.

Se ven textos como `Ã©`, `Ã³`, `ðŸ’¼`, `Â¡`. Esto afecta percepcion profesional y tambien puede salir mal en documentos impresos o CSV.

Mejora recomendada:

- Normalizar el encoding de archivos a UTF-8.
- Revisar textos con busqueda de patrones `Ã`, `Â`, `ðŸ`.
- Corregir copy visible y plantillas legales.
- Agregar una prueba simple de contenido para detectar mojibake en `src/**/*.tsx`.

### P2 - Bundle principal todavia pesado

El build pasa, pero Vite avisa que el chunk principal supera 500 kB despues de minificacion. Ya hay lazy loading para modulos grandes, pero todavia conviene separar calculadoras por familia.

Mejora recomendada:

- Lazy-load de calculadoras avanzadas: laboral, finanzas y empresariales.
- Separar `data.ts` si las guias y calculadoras estan inflando la primera carga.
- Mantener Firebase fuera del primer render cuando el usuario no abre login/admin.

## QA por modulo

### 1. App, navegacion y SEO

Estado: OK con mejoras menores.

Cobertura revisada:

- Home.
- Herramientas por slug.
- Guia por slug.
- Nosotros.
- Contacto, Privacidad, Terminos, Reembolsos.
- Noticias.
- Centro laboral.
- Centro financiero.
- Precios.
- Admin privado.
- 404.

Fortalezas:

- Rutas principales estan declaradas y actualizan meta tags.
- `/admin` se marca como `noindex, nofollow`.
- El servidor genera sitemap, robots y HTML prerenderizado.

Riesgos/mejoras:

- Validar en navegador real que cada ruta directa refrescada (`/contacto`, `/precios`, `/admin`, `/herramientas/...`) no dependa solo de navegacion SPA.
- Revisar textos del footer: "Terminos" deberia ser "Terminos" o "Terminos y condiciones" de forma consistente.

### 2. Login, cuenta y compra PRO

Estado: funcional localmente con proveedor demo; pendiente pago real.

Fortalezas:

- Estado de suscripcion separado mediante `subscriptionState`.
- Endpoint backend `/api/checkout/config`.
- Endpoint backend `/api/checkout/session`.
- Modo demo permite completar el flujo PRO local.

Riesgos/mejoras:

- Para produccion, integrar proveedor real de pago y webhook.
- El estado PRO local no debe ser fuente final de verdad en produccion.
- Agregar pantalla de "pago pendiente", "pago fallido", "renovacion", "cancelado" y "expirado".
- Registrar `checkoutReference` en Firestore o backend para auditoria.

### 3. Calculadoras publicas

Estado: OK en compilacion y pruebas base.

Inventario:

- 50 herramientas en `src/data.ts`.
- 6 de impuestos.
- 20 laborales.
- 13 financieras.
- 11 de negocios.

Fortalezas:

- Pruebas de calculos pasan.
- Hay fuentes y metadata de tasas en `TAX_RATES_REGISTRY`.
- Hay rutas SEO por herramienta.

Riesgos/mejoras:

- Ampliar pruebas por cada calculadora, no solo casos centrales.
- Agregar pruebas de limites: cero, negativos, tasas altas, fechas invalidas, meses extremos.
- Mostrar "vigencia de tasas" dentro del resultado imprimible, no solo en home.

### 4. Calculadoras laborales

Estado: OK, con buen potencial de impresion.

Impresion:

- Usa `#laboral-calculator-print-preview`.
- Tiene copiar, guardar historial, exportar CSV e imprimir.

Mejoras:

- Agregar encabezado formal con nombre del negocio/empleado, fecha, tasa usada y version de calculo.
- Convertir el resultado a una "hoja de calculo laboral" con firma y disclaimer legal.
- Agregar desglose de topes TSS e ISR en la impresion.
- Evitar que botones o controles se impriman.

### 5. Centro laboral

Estado: funcional como mini RRHH local.

Impresion:

- Volante de pago con `#payslip-print-block`.
- Boton de impresion general.

Fortalezas:

- Persistencia local de empleados y asistencia.
- Calculo de volante y costo patronal.

Mejoras de impresion:

- Agregar periodo de nomina, fecha de pago, cedula/codigo del empleado, RNC de empresa y metodo de pago.
- Agregar campo de firma del empleado y firma de RRHH.
- Agregar numero unico de volante.
- Preparar plantilla carta/legal sin depender del viewport.
- Exportar volante a PDF nominal con nombre de empleado.

### 6. Calculadoras financieras

Estado: OK.

Impresion:

- Usa `#finanzas-calculator-print-preview`.

Fortalezas:

- Historial local.
- Copia de reporte.
- Resultados claros para ahorro, interes, prestamos, comparadores y refinanciamiento.

Riesgos/mejoras:

- El mensaje de refinanciamiento tiene un typo: "gatos de cierre" debe ser "gastos de cierre".
- Agregar tabla de supuestos financieros en la impresion.
- Para amortizaciones largas, repetir encabezado de tabla en cada pagina.
- Agregar grafico simple de capital/interes en reporte PRO.

### 7. Centro financiero

Estado: funcional para gestion de deudas.

Exportacion:

- `mis_deudas_negociord.csv`.

Fortalezas:

- Persistencia local de deudas.
- Simulacion de consolidacion y pagos extra.

Mejoras:

- Agregar reporte imprimible/PDF del diagnostico financiero.
- Exportar consolidacion, no solo deudas crudas.
- Agregar resumen: DTI, balance total, tasa promedio, cuota total, ahorro estimado.
- Agregar escenario "antes vs despues" en una hoja imprimible.

### 8. Calculadoras empresariales y documentos corporativos

Estado: funcional.

Impresiones:

- Documentos corporativos con `#print-sheet-segment`.
- Resultados operativos con `#empresariales-math-print-preview`.

Documentos:

- Cotizacion profesional.
- Recibo de ingresos.
- Factura proforma.
- Orden de compra.
- Presupuesto comercial.

Fortalezas:

- Tienen encabezado, cliente, fecha, tabla de items y totales.
- Permiten imprimir, exportar CSV y copiar estructura.

Mejoras:

- Agregar logo cargable.
- Agregar condiciones de pago, validez de cotizacion, banco/cuenta y notas.
- Agregar numeracion configurable por tipo de documento.
- Exportar PDF con nombre profesional: `cotizacion-CLIENTE-FECHA.pdf`.
- Agregar area de firma, sello y aceptacion del cliente.
- Validar RNC/cedula y NCF cuando aplique.

### 9. Portal Profesional PRO

Estado: muy completo, pero es el modulo con mayor necesidad de pulido documental.

Tabs revisados:

- ITBIS/NCF.
- Contratos de trabajo.
- Exportacion de reportes y hojas timbradas.
- Retenciones y recargos DGII.

Fortalezas:

- Tiene persistencia local por modulo.
- Tiene contratos redactados y opciones de clausulas.
- Tiene impresion carta/legal.
- Tiene hojas timbradas de prestaciones, amortizacion e IT-1.
- Tiene CSV de reportes.

Riesgos/mejoras:

- Contratos descargan `.txt`, no `.docx` ni PDF real.
- La tabla de amortizacion esta dentro de `max-h-[220px] overflow-y-auto`; al imprimir puede salir incompleta.
- Los textos legales necesitan revision de encoding y redaccion final por abogado/contador.
- La impresion depende de `window.print()`, sin control de nombre de archivo ni confirmacion de paginas.

Mejoras de impresion/documento:

- Generar `.docx` para contratos con portada, clausulas, firma, notario y campos editables.
- Generar PDF server-side o client-side con paginacion controlada.
- Agregar pie de pagina: pagina X de Y, fecha, usuario, referencia del documento.
- Agregar marca "Borrador" en modo FREE/demo.
- Repetir encabezado/timbre en cada pagina.
- Para amortizacion, quitar scroll interno en impresion y partir tabla por paginas.

### 10. Noticias y guias

Estado: OK.

Fortalezas:

- Hay fallback local para noticias.
- Hay endpoint de refresh con Gemini si existe API key.
- Guias programaticas conectan con calculadoras.

Mejoras:

- Mostrar fecha de actualizacion y fuente visible en cada noticia.
- Evitar publicar contenido fiscal/laboral sin fuente oficial.
- Agregar validacion contra URLs oficiales cuando se refrescan noticias.

### 11. Admin privado

Estado: separado y protegido por email admin.

Fortalezas:

- No se indexa.
- Carga usuarios, usage logs y subscription logs desde Firestore.
- Permite togglear rol y escribir estado de suscripcion.

Riesgos/mejoras:

- El control real de admin depende de reglas de Firestore; el frontend no debe ser unica barrera.
- Agregar auditoria obligatoria para cambios de suscripcion.
- Agregar confirmacion antes de cambiar rol.
- Agregar filtro y busqueda de usuarios.

### 12. Anuncios

Estado: OK para FREE/PRO.

Fortalezas:

- El PRO puede ocultar anuncios.
- En desarrollo se puede visualizar codigo.

Mejoras:

- Evitar que anuncios o placeholders aparezcan en impresion.
- Reservar espacio estable para evitar saltos de layout.

### 13. APIs y servidor

Estado: OK.

Endpoints revisados:

- `/api/news`.
- `/api/news/refresh`.
- `/api/rates`.
- `/api/rates/refresh`.
- `/api/checkout/config`.
- `/api/checkout/session`.
- `/sitemap.xml`.
- `/robots.txt`.
- SSR/prerender SPA fallback.

Mejoras:

- Rate limit para endpoints de refresh y checkout.
- Validacion mas estricta del body de checkout.
- Logs estructurados.
- Pruebas de contrato para respuestas JSON.

## QA de impresiones y exportaciones

| Documento o salida | Archivo/modulo | Estado actual | Riesgo principal | Mejora recomendada |
| --- | --- | --- | --- | --- |
| Contratos legales | `ProfessionalPortal.tsx` | Imprime y descarga `.txt` | Corte multipagina y formato limitado | `.docx` + PDF real, paginacion, firmas, pie de pagina |
| Hoja timbrada prestaciones | `ProfessionalPortal.tsx` | Imprime y CSV | Falta trazabilidad/version | Encabezado repetido, fuente legal, pagina X/Y |
| Hoja timbrada amortizacion | `ProfessionalPortal.tsx` | Imprime y CSV | Tabla en contenedor con scroll | Quitar scroll en print, repetir `thead`, paginas multiples |
| Hoja timbrada IT-1 | `ProfessionalPortal.tsx` | Imprime y CSV | No es formulario oficial | Disclaimer visible, periodo fiscal, fuentes DGII |
| Anexo/CSV reportes PRO | `ProfessionalPortal.tsx` | CSV | No es XLSX real | BOM UTF-8, separador regional, XLSX PRO |
| Volante de pago | `CentroLaboral.tsx` | Imprime | Falta numero/periodo/firma | Folio, periodo, firma empleado/RRHH |
| Reporte laboral calculadora | `LaboralCalculators.tsx` | Imprime y CSV | Falta metadata de tasas | Version, vigencia, topes, disclaimer |
| Reporte financiero calculadora | `FinanzasCalculators.tsx` | Imprime | Falta tabla de supuestos | Supuestos, tasa efectiva, escenario base |
| Documentos corporativos | `EmpresarialesCalculators.tsx` | Imprime y CSV | Falta logo/condiciones/NCF | Logo, condiciones, firma, numeracion |
| Matriz operativa | `EmpresarialesCalculators.tsx` | Imprime | Puede ser demasiado generica | Resumen ejecutivo y tabla de inputs |
| Centro financiero | `CentroFinanciero.tsx` | Exporta CSV | No tiene impresion/PDF | Reporte de diagnostico financiero imprimible |

## Como mejorar las impresiones de documentos

### 1. Crear una capa unica de impresion

Crear un componente `PrintableDocument` reusable con:

- `title`.
- `documentType`.
- `paperSize`.
- `orientation`.
- `referenceNumber`.
- `issuedAt`.
- `footer`.
- `children`.

Asi todos los documentos comparten encabezado, pie, margenes, firmas y paginacion.

### 2. Reemplazar la regla global de print

La regla actual debe convertirse en una clase como `.print-document`, evitando que cualquier ID nuevo tenga que tocar `index.css`.

Propuesta:

```css
@media print {
  body * {
    visibility: hidden !important;
  }

  .print-document,
  .print-document * {
    visibility: visible !important;
  }

  .print-document {
    position: static !important;
    width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important;
    border: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  table {
    page-break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }
}
```

### 3. Mejorar calidad visual

- Usar tamano base 10.5-11 pt para documentos legales.
- Evitar sombras, fondos oscuros y contenedores con scroll al imprimir.
- Usar bordes finos, encabezados sobrios y jerarquia clara.
- Repetir timbre/empresa en cada pagina.
- Incluir fecha de emision, usuario, referencia y version de calculo.

### 4. Mejorar exportacion

- FREE: CSV limpio y compatible con Excel.
- PRO: PDF y XLSX reales.
- Legal PRO: DOCX editable.
- Nombre de archivo profesional por tipo, cliente y fecha.
- Incluir hoja o bloque de metadata con tasas usadas.

### 5. Mejorar trazabilidad legal/fiscal

- Mostrar fuente de tasas usadas: DGII/TSS/SIPEN u otra.
- Mostrar fecha de vigencia.
- Mostrar disclaimer: calculo informativo, no sustituye asesor profesional.
- Guardar historial local o remoto de documentos emitidos.

## Roadmap recomendado

1. Corregir CSS de impresion global para permitir multiples paginas.
2. Corregir mojibake/encoding en textos visibles y plantillas.
3. Agregar `PrintableDocument` y migrar primero contratos + hojas timbradas.
4. Agregar exportacion `.docx` para contratos.
5. Agregar exportacion `.xlsx` para reportes PRO y documentos corporativos.
6. Agregar reporte imprimible al Centro Financiero.
7. Agregar pruebas visuales/Playwright para impresiones clave.
8. Agregar pruebas de extremos por cada familia de calculadoras.

## Conclusion

NegocioRD ya tiene una base funcional amplia: 50 herramientas, portal PRO, documentos, reportes, cuenta, checkout demo, admin privado y servidor con SEO. Para que se sienta "100% profesional", la prioridad no es agregar mas pantallas, sino subir la calidad documental: paginacion real, PDF/DOCX/XLSX reales, encoding limpio, encabezados repetibles, firmas, folios y metadata de tasas.
