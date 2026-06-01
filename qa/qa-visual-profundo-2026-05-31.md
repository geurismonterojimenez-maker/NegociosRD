# QA visual profundo - NegocioRD

Fecha: 2026-05-31  
Servidor verificado: `http://127.0.0.1:3000`  
Modo: desarrollo local con `npm run dev` despues de `npm run build`

## Cambios aplicados antes del QA

- Se corrigio el overflow horizontal global con contenedores `min-w-0`, `overflow-x-hidden` y ajustes responsive.
- Se movieron los anuncios de home y herramientas debajo del contenido util inicial.
- Se reservaron anuncios laterales solo para pantallas `2xl` y se ocultaron en precios y superficies PRO.
- Se simplifico el header desktop: `Herramientas`, `Centro PRO`, `Guias`, `Noticias`, `Precios`.
- Se limpiaron placeholders visibles de AdSense en produccion.
- Se ajustaron precios en movil para evitar etiquetas y cards cortados.
- Se ajusto el panel de resultados ITBIS para que los montos no desborden.
- Se reemplazaron claims visuales de "exacto" por lenguaje de estimacion/fuentes documentadas.

## Evidencia de capturas

Capturas guardadas:

- `qa/visual-cdp-home-desktop.png`
- `qa/visual-cdp-home-mobile.png`
- `qa/visual-cdp-itbis-mobile.png`
- `qa/visual-cdp-precios-mobile.png`
- `qa/visual-cdp-news-desktop.png`
- `qa/visual-cdp-laboral-desktop.png`

Mediciones CDP:

- Home movil: `scrollWidth=390`, `clientWidth=390`.
- ITBIS movil: `scrollWidth=390`, `clientWidth=390`.
- Precios movil: `scrollWidth=390`, `clientWidth=390`.
- Home desktop: `scrollWidth=1425`, `clientWidth=1425`.
- Noticias desktop: `scrollWidth=1425`, `clientWidth=1425`.
- Centro Laboral desktop: `scrollWidth=1425`, `clientWidth=1425`.

## Resultado visual

### P0/P1 corregidos

- El overflow horizontal movil ya no se reproduce en las rutas auditadas.
- La herramienta ITBIS ya no muestra publicidad antes del titulo, descripcion y formulario.
- La home ya no presenta un anuncio inmediatamente despues del hero.
- Los laterales de anuncios ya no dominan el primer pantallazo en 1440px.
- Las paginas de precios y Centro PRO ya no quedan rodeadas por anuncios laterales.
- Los textos internos tipo `ca-pub-xxxx`, "Ver codigo" y etiquetas tecnicas de AdSense ya no aparecen en la UI normal.
- El header desktop se ve menos cargado y respira mejor.
- Los montos grandes del resultado ITBIS en movil bajan de forma vertical y no se cortan horizontalmente.

### Estado actual por pantalla

Home desktop:

- Se ve mas profesional y enfocada en herramientas.
- La seccion de tasas oficiales gana protagonismo.
- El directorio entra limpio sin anuncios laterales agresivos.

Home movil:

- Sin corte horizontal.
- Hero, buscador, tasas y filtros se leen bien.
- La primera experiencia se siente mas util y menos monetizada.

Herramienta ITBIS movil:

- La primera pantalla ya prioriza titulo, descripcion, compartir y parametros.
- El resultado no desborda horizontalmente.
- La publicidad queda despues de la experiencia principal.

Precios movil:

- Ya no se cortan cards ni etiquetas.
- El selector mensual/anual entra completo.
- La jerarquia del plan PRO queda clara.

Noticias desktop:

- Se ve estable y editorial.
- El buscador tiene mejor espacio respecto a los filtros.
- No hay overflow horizontal.

Centro PRO desktop:

- La pagina se siente mas privada y enfocada sin laterales publicitarios.
- El paywall queda centrado y limpio.

## Riesgos restantes

- Corregido en seguimiento: el build ya no muestra advertencia de chunk grande. El bundle principal bajo a `325.67 kB` y `CalculatorForm` quedo separado en su propio chunk.
- Corregido en seguimiento: Centro PRO ahora muestra una secuencia de valor en 3 pasos debajo del CTA para reducir el vacio visual sin exponer una demo publica.
- Corregido en seguimiento: textos largos de PRO y de la pagina Nosotros fueron simplificados para un tono mas claro y profesional.

## Verificaciones ejecutadas

- `npm.cmd run lint`: OK.
- `npm.cmd run build`: OK.
- Capturas con Chrome DevTools Protocol: OK.
- Medicion de overflow horizontal en rutas clave: OK.
- Seguimiento posterior: `npm.cmd run lint`: OK.
- Seguimiento posterior: `npm.cmd run build`: OK, sin warning de chunk grande.

## Recomendacion siguiente

El siguiente bloque de mejora deberia ser producto:

- Revisar conversion de precios con una seccion corta de confianza/testimonios o garantia.
- Afinar la experiencia PRO para mostrar una previsualizacion real sin convertirla en demo publica.
