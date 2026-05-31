# QA completo de NegocioRD

Fecha: 2026-05-30  
Ruta local: `C:\NegocioRD`  
Commit auditado: `8e547d7 feat: add recent calculators history and UI updates`  
Servidor auditado: `http://localhost:3000`  
Modo: build de produccion servido con `NODE_ENV=production node dist/server.cjs`

## Resumen ejecutivo

La web esta en buen estado tecnico base: compila, no tiene vulnerabilidades npm moderadas o superiores, responde endpoints principales y ya tiene SEO especifico en rutas de herramientas y guias. El ultimo commit agrego historial/UX y Firebase, y la plataforma se siente mas completa.

Los problemas importantes estan en confianza, accesibilidad, monetizacion, exactitud verificable y preparacion para produccion. La pagina aun muestra anuncios demasiado arriba, conserva claims de "exactitud" muy fuertes, tiene inputs sin nombre accesible, un ID duplicado, algunos metadatos inconsistentes y un bundle JavaScript grande.

## Checks ejecutados

- `npm install`: correcto.
- `npm run build`: correcto.
- `npm run lint`: correcto.
- `npm audit --audit-level=moderate`: correcto, `0 vulnerabilities`.
- Navegacion en browser: home, herramientas principales, guia ITBIS y noticias.
- Endpoints:
  - `/`: 200.
  - `/herramientas/calculadora-itbis`: 200.
  - `/herramientas/calculadora-salario-neto`: 200.
  - `/herramientas/calculadora-prestaciones-laborales`: 200.
  - `/herramientas/calculadora-prestamo-hipotecario`: 200.
  - `/herramientas/calculadora-precio-venta-margen`: 200.
  - `/guia/como-calcular-itbis`: 200.
  - `/noticias`: 200.
  - `/api/news`: 200.
  - `/api/rates`: 200.
  - `/robots.txt`: 200.
  - `/sitemap.xml`: 200.
  - `/no-existe`: 200, esto es problema.

No ejecute `POST /api/news/refresh` para no consumir creditos Gemini. Tampoco ejecute `POST /api/rates/refresh` en este QA final para no mutar el cache de tasas durante la auditoria.

## Hallazgos criticos

### P0 - Las rutas inexistentes devuelven 200

`/no-existe` responde `200 text/html`.

Impacto:

- Google puede indexar basura o rutas rotas como paginas validas.
- Afecta SEO tecnico.
- Dificulta detectar errores reales de navegacion.

Recomendacion:

- En `server.ts`, validar rutas conocidas antes de devolver `index.html`.
- Para rutas desconocidas, devolver 404 real con pagina de error.
- Mantener 200 solo para `/`, `/herramientas/:slug`, `/guia/:slug`, `/noticias`, `/nosotros`, `/precios`, etc.

### P0 - Claims de exactitud demasiado fuertes

Se encontraron textos como:

- `Cálculos exactos...`
- `calculadoras exactas`
- `Calcula de forma exacta...`
- `coeficientes exactos declarados...`

Archivos relevantes:

- `index.html`
- `src/data.ts`
- `src/components/CalculatorForm.tsx`
- `src/components/CalculatorsList.tsx`
- `src/components/GuidesView.tsx`
- `src/components/NewsSection.tsx`

Impacto:

- Riesgo reputacional/legal si una tasa cambia o hay casos especiales.
- Contradice la necesidad de explicar que son estimaciones basadas en fuentes oficiales.

Recomendacion:

- Cambiar a "estimacion basada en fuentes oficiales documentadas".
- Mostrar fecha de ultima verificacion.
- Incluir disclaimer visible en resultados.

## Hallazgos altos

### P1 - Accesibilidad: inputs sin nombre accesible

Auditoria DOM:

- Home: 5 inputs, 5 sin nombre accesible.
- ITBIS: 3 inputs, 3 sin nombre accesible.
- Salario neto: 3 inputs, 3 sin nombre accesible.
- Prestaciones: 5 inputs, 5 sin nombre accesible.
- Hipotecario: 3 inputs, 3 sin nombre accesible.
- Margen: 3 inputs, 3 sin nombre accesible.
- Guia ITBIS: 2 inputs, 2 sin nombre accesible.
- Noticias: 4 inputs, 4 sin nombre accesible.

Los botones icon-only ya mejoraron: `buttonsNoName = 0`.

Recomendacion:

- Agregar `label htmlFor` + `id` o `aria-label` a todos los inputs.
- Revisar selects y campos generados en calculadoras avanzadas.

### P1 - ID duplicado en anuncios

Se detecta `duplicateIds: ["adsense-results-inline"]` en home y herramientas.

Archivo:

- `src/components/AdSenseBlock.tsx`

Impacto:

- DOM invalido.
- Puede romper CSS, medicion, accesibilidad y scripts de anuncios.

Recomendacion:

- Recibir un `idSuffix` por instancia o generar ID unico.
- O eliminar el `id` si no es necesario.

### P1 - Anuncios aparecen demasiado arriba

En herramientas el body empieza asi:

- breadcrumb
- publicidad relacionada
- bloque AdSense
- luego contenido de herramienta

En home, el anuncio aparece inmediatamente despues del hero inicial y antes de exploracion completa.

Impacto:

- La plataforma se siente monetizada antes de ser util.
- Reduce confianza, especialmente para temas fiscales/laborales.

Recomendacion:

- No mostrar anuncios antes del formulario/resultados.
- Permitir anuncios despues de contenido educativo, sidebar desktop y footer.
- Ocultar "Ver codigo" en produccion.

### P1 - Canonical cambia a localhost despues de hidratacion

HTML inicial de produccion trae canonical correcto:

- `https://negociord.com/herramientas/...`

Pero despues de hidratar en navegador, React actualiza canonical a:

- `http://localhost:3000/...`

En produccion real posiblemente sera correcto si corre en `negociord.com`, pero es fragil.

Archivo:

- `src/App.tsx`

Recomendacion:

- Usar una constante `PUBLIC_SITE_URL=https://negociord.com`.
- No derivar canonicals SEO desde `window.location.origin`.

### P1 - Home sin canonical ni JSON-LD en HTML inicial

HTTP:

- `/` responde con `canonical=` vacio.
- `/` responde con `jsonld=0`.

Luego React agrega JSON-LD/canonical en cliente, pero para SEO fuerte conviene que este en HTML inicial.

Recomendacion:

- Inyectar canonical y schema de Organization/WebSite/Breadcrumb para `/` desde servidor.

### P1 - Conteo de categorias inconsistente

Catalogo real:

- Total: 50 herramientas.
- Impuestos: 6.
- Laboral: 20.
- Finanzas: 13.
- Negocios: 11.

Pero los labels dicen:

- Impuestos: `8 calculadoras DGII`.
- Laboral: `10 cálculos de prestaciones y TSS`.
- Finanzas: `3 simuladores de préstamos`.

Recomendacion:

- Generar esos textos desde el conteo real.
- O separar "principales" vs "total".

### P1 - Refresh de noticias puede consumir creditos y fallar por cuota

`/api/news` funciona con cache local. No se ejecuto `/api/news/refresh` para no consumir creditos Gemini.

Riesgo:

- Si el usuario toca "refresh" repetidamente, puede gastar cuota.
- En runs anteriores hubo 429 de Gemini.

Recomendacion:

- Rate limit local.
- Confirmacion antes de refrescar con IA.
- Cache TTL.
- Mostrar costo/riesgo o "ultima actualizacion".

## Hallazgos medios

### P2 - Bundle JS muy grande

Build:

- JS principal: `1,257.46 kB` minificado.
- gzip: `305.90 kB`.
- Vite advierte chunk mayor de 500 kB.

Causa probable:

- Firebase.
- portal profesional.
- noticias.
- calculadoras avanzadas.
- lucide/motion.

Recomendacion:

- `React.lazy` para:
  - `ProfessionalPortal`
  - `CentroLaboral`
  - `CentroFinanciero`
  - `NewsSection`
  - calculadoras avanzadas.
- Separar Firebase auth en chunk bajo demanda.
- Manual chunks en Vite para `firebase`, `react`, `lucide`.

### P2 - `npm start` no fuerza produccion

`package.json`:

- `"start": "node dist/server.cjs"`

El servidor depende de `process.env.NODE_ENV`. Si se corre sin `NODE_ENV=production`, entra en rama dev.

Recomendacion:

- Agregar script Windows-compatible:
  - `"start:prod": "cross-env NODE_ENV=production node dist/server.cjs"`
- O dentro del bundle de `dist` asumir produccion.

### P2 - `PORT` hardcodeado

`server.ts` usa:

- `const PORT = 3000;`

Recomendacion:

- `const PORT = Number(process.env.PORT || 3000);`

### P2 - Cache de tasas tiene typo

Archivo:

- `src/lib/rates/official-rates-cache.json`

Problema:

- `infotep` tiene `"lastChecked: "` en vez de `"lastChecked"`.

Recomendacion:

- Corregir clave.
- Validar cache con schema antes de servir.

### P2 - Automatizacion de tasas sigue siendo fragil

`rate-sources.ts` parsea HTML con busquedas simples de texto. Esto puede fallar si el sitio cambia, bloquea scraping o publica PDF.

Recomendacion:

- Guardar fuente oficial exacta por tasa.
- Usar cache versionado.
- Marcar `needs_review` sin cambiar tasas si no hay verificacion robusta.
- No actualizar valores automaticamente si la fuente no coincide.

### P2 - Firebase aumenta superficie de QA

Hay Firebase Auth/Firestore integrado:

- `firebase-applet-config.json`
- `src/lib/firebase.ts`
- `firestore.rules`
- `UserAccountModal`

La config pública de Firebase no es secreto por si sola, pero:

- reglas deben probarse con emulador.
- flujos de login/pago/perfil deben QA aparte.
- `security_spec.md` dice cosas que las reglas no aplican exactamente, por ejemplo verificacion estricta de email y timestamps con `request.time`.

Recomendacion:

- Crear tests de reglas Firestore con emulator.
- Alinear `security_spec.md` con reglas reales.

### P2 - Falta suite de pruebas automatizadas

No hay archivos `test`, `spec`, `vitest`, `jest` o Playwright.

Riesgo:

- Cambios en tasas/calculos pueden romper resultados sin alerta.

Recomendacion:

- Agregar Vitest.
- Tests para ITBIS, ISR, AFP/SFS con topes, prestaciones, recargos, prestamos y margen.

## Hallazgos bajos

### P3 - Sitemap tiene rutas que deben confirmarse

`/sitemap.xml` existe y lista muchas rutas, incluyendo `/precios`.

Recomendacion:

- Confirmar que todas las rutas del sitemap renderizan contenido especifico y no una vista fallback.

### P3 - `robots.txt` existe

Estado bueno, pero conviene revisar su contenido final antes de publicar.

### P3 - No hay mojibake visible

En navegador no se detecto `Ã`, `Â` o `â` en texto visible de rutas auditadas. Bien.

## Modulos auditados

### Impuestos

Pruebas:

- ITBIS excluido RD$10,000 al 18% => RD$1,800, total RD$11,800.
- ITBIS incluido RD$11,800 => base RD$10,000, ITBIS RD$1,800.
- Recargos RD$5,000 por 3 meses => recargo RD$900, interes RD$165, total RD$6,065.

Estado: funcional.  
Mejorar: reducir claims "exacto", documentar retenciones con fuente normativa por caso.

### Laboral

Pruebas:

- Salario neto RD$50,000 => neto RD$45,191.
- AFP/SFS aplican topes 2026.
- Prestaciones RD$30,000 por 2 anos => total RD$113,249.28.

Estado: funcional.  
Mejorar: pruebas automatizadas, labels accesibles, disclaimer de estimacion, validacion de casos especiales.

### Finanzas

Pruebas:

- Prestamo RD$500,000, 12%, 36 meses => cuota RD$16,607.15.
- Hipotecario RD$5,000,000, 10%, 240 meses => cuota total RD$53,251.08.

Estado: funcional.  
Mejorar: explicar seguros/tasas como supuestos, mostrar tasa nominal vs efectiva, fuentes de formulas.

### Negocios

Pruebas:

- Costo RD$150, margen 30% => precio sugerido RD$214.29.

Estado: funcional.  
Mejorar: validar RNC/NCF en generadores, no hardcodear ITBIS en componentes, separar generadores de calculadoras.

### Guias

Estado: renderizan y tienen title/canonical en HTML inicial.  
Mejorar: Article schema completo, enlazado interno, canonical estable sin depender del origin cliente.

### Noticias

Estado: `/noticias` y `/api/news` responden.  
Mejorar: evitar gastar creditos sin confirmacion, rate limit, workflow editorial antes de publicar contenido generado.

### Ads / Monetizacion

Estado: placeholders presentes.  
Mejorar: mover anuncios debajo de secciones utiles, ocultar "Ver codigo" en produccion, IDs unicos.

### SEO

Estado: herramientas y guias principales tienen metadata inicial.  
Mejorar: 404 real, home schema/canonical inicial, evitar duplicacion servidor/cliente, sitemap validado.

### Seguridad

Estado: npm audit limpio.  
Mejorar: tests de reglas Firestore, revisar claims de `security_spec.md`, proteger endpoints mutables.

## Prioridad recomendada

1. Devolver 404 real para rutas inexistentes.
2. Corregir accesibilidad de inputs y el ID duplicado.
3. Mover anuncios fuera del primer bloque util y ocultar "Ver codigo".
4. Eliminar claims absolutos de exactitud.
5. Corregir canonical/schema de home en HTML inicial.
6. Agregar tests de calculos fiscales/laborales.
7. Corregir cache de tasas y hardening del actualizador.
8. Reducir bundle con lazy loading.
9. Hacer QA especifico de Firebase/Auth/Firestore con emulador.

## Estado final

La web puede mostrarse localmente y esta mucho mas cerca de una plataforma profesional. Para publicarla con fuerza SEO/AdSense y confianza nacional, todavia faltan correcciones de accesibilidad, SEO tecnico, copy legal y rendimiento.
