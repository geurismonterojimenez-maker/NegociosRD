# Revision rapida de NegocioRD

Fecha: 2026-05-30  
Ruta local: `C:\NegocioRD`  
Commit revisado: `8e547d7 feat: add recent calculators history and UI updates`  
Servidor revisado: `http://localhost:3000`

## Estado tecnico

- `git status`: rama `main...origin/main`, con `index.html` modificado por Google Tag Manager y carpeta `qa/` sin trackear.
- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm audit --audit-level=moderate`: correcto, 0 vulnerabilidades.
- Advertencia vigente de Vite: bundle principal grande, `1,257.46 kB` minificado y `305.90 kB` gzip.

## Confirmaciones actuales

- `/`: responde 200.
- `/api/rates`: responde 200.
- `/no-existe`: responde 200, sigue siendo un problema SEO porque deberia devolver 404 real.
- GTM se conserva localmente en `index.html`.
- Tasas TSS principales siguen en base `23223`, con cache activo en `/api/rates`.

## Problemas que siguen presentes

1. Rutas inexistentes devuelven 200.
2. Despues de hidratar React, canonical y `og:url` pasan a `http://localhost:3000/...`; deben usar `https://negociord.com`.
3. Inputs sin nombre accesible:
   - Home: 5 inputs, 5 sin nombre.
   - Calculadora ITBIS: 3 inputs, 3 sin nombre.
4. ID duplicado: `adsense-results-inline`.
5. Boton visible de AdSense: `Ver codigo` / `Ver código`, no debe aparecer en produccion.
6. Claims de exactitud siguen apareciendo en textos de `index.html`, `src/data.ts` y componentes.
7. Cache de tasas conserva typo en `src/lib/rates/official-rates-cache.json`: `"lastChecked: "` en `infotep`.
8. `server.ts` sigue usando `const PORT = 3000`; falta `process.env.PORT || 3000`.
9. `package.json` sigue con `"start": "node dist/server.cjs"` sin forzar `NODE_ENV=production`.

## Prioridad recomendada

1. Corregir 404 real y canonical fijo de produccion.
2. Arreglar accesibilidad de inputs y el ID duplicado de AdSense.
3. Ocultar controles internos de anuncios en produccion.
4. Suavizar claims de "exactitud" y mostrar fuente/fecha de verificacion.
5. Corregir typo del cache y endurecer refresh de tasas.
6. Reducir bundle con lazy loading/code splitting.
7. Agregar tests de calculos criticos y rutas SEO.
