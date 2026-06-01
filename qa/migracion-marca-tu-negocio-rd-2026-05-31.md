# Migracion de marca - Tu Negocio RD

Fecha: 2026-05-31
Proyecto: C:\NegocioRD

## Objetivo ejecutado

Se migro la identidad textual visible desde `NegocioRD` hacia `Tu Negocio RD`, manteniendo colores, estructura visual, rutas, calculos, reglas de negocio, autenticacion, Firestore y llaves tecnicas.

## Alcance actualizado

- Navbar y logo textual principal.
- Footer, copyright, texto institucional y llamada de monitoreo.
- Pagina principal, pagina Sobre Nosotros, Contacto, Privacidad, Terminos y Reembolsos.
- Dashboard, paywall PRO, precios y licencias.
- Centro Laboral RD.
- Centro Financiero RD.
- Portal Profesional Tu Negocio RD Pro.
- Noticias, autores editoriales, boletin y guias.
- Login, registro, cuenta, checkout simulado y recuperacion/errores de autenticacion visibles.
- Panel administrativo privado.
- Titulos SEO, meta descriptions dinamicas, Open Graph, Twitter Cards y Schema.org.
- Favicon SVG y manifest PWA.
- Correos/fallbacks de marca y nombres de exportaciones visibles.

## Archivos modificados por marca

- `index.html`
- `metadata.json`
- `news-cache.json`
- `security_spec.md`
- `server.ts`
- `src/App.tsx`
- `src/components/AdminConsole.tsx`
- `src/components/CalculatorForm.tsx`
- `src/components/CentroFinanciero.tsx`
- `src/components/CentroLaboral.tsx`
- `src/components/EmpresarialesCalculators.tsx`
- `src/components/FinanzasCalculators.tsx`
- `src/components/GuidesView.tsx`
- `src/components/LaboralCalculators.tsx`
- `src/components/NewsSection.tsx`
- `src/components/ProfessionalPortal.tsx`
- `src/components/UserAccountModal.tsx`
- `src/lib/firebase.ts`
- `src/lib/calculations/all_new_calculations.ts`
- `public/favicon.svg`
- `public/site.webmanifest`

## Referencias actualizadas

- `NegocioRD` visible -> `Tu Negocio RD`.
- `NegocioRD Pro` / `NegocioRD PRO` -> `Tu Negocio RD Pro`.
- `Portal Corporativo NegocioRD Pro` -> `Portal Profesional Tu Negocio RD Pro`.
- Autores editoriales, avisos legales, documentos generados e impresiones.
- Meta titles, meta descriptions, Open Graph, Twitter Cards y Schema.org.
- Fallbacks de correo: `soporte@tunegociord.com`, `anonimo@tunegociord.com`, `ejemplo@tunegociord.com`.
- Exportaciones: `mis_deudas_tu_negocio_rd.csv`, `nomina_colaboradores_tu_negocio_rd.csv`, `tu_negocio_rd_*`.

## Referencias preservadas intencionalmente

Estas referencias contienen `negociord` pero no son marca visible y cambiarlas podria romper SEO, sesiones o persistencia:

- Dominio canonico actual: `https://negociord.com`.
- Sitemap y robots generados desde `server.ts`.
- `PUBLIC_SITE_URL` y `ORIGIN_URL`, mientras el dominio de produccion siga siendo `negociord.com`.
- Llaves de `localStorage`: `negociord_subscription_state`, `negociord_user_tier`, `negociord_employees`, `negociord_debts`, `negociord_pro_*`.
- Constantes tecnicas de compatibilidad en `src/config/subscription.ts`.
- Prefijo temporal de screenshots QA en `scripts/cdp-screenshot.ps1`.
- Documentos historicos en `qa/` anteriores a la migracion.

## Slogans propuestos

1. Herramientas que impulsan tu negocio.
2. Calcula, planifica y crece.
3. Tu centro de herramientas empresariales RD.
4. Soluciones inteligentes para Republica Dominicana.
5. Todo lo que tu negocio necesita calcular.
6. Herramientas dominicanas para crecer.

Recomendacion: usar `Herramientas que impulsan tu negocio.` como slogan principal porque conecta con el logo nuevo y mantiene tono profesional.

## Riesgos SEO y redirecciones recomendadas

- Si la marca cambia pero el dominio sigue siendo `negociord.com`, conviene mantener canonicals, sitemap y `og:url` en ese dominio para no perder autoridad.
- Si se migra a `tunegociord.com`, se recomienda:
  - Redireccion 301 de cada URL antigua a su equivalente nueva.
  - Actualizar `ORIGIN_URL`, `PUBLIC_SITE_URL`, canonical, `og:url`, sitemap y robots.
  - Registrar el nuevo dominio en Search Console.
  - Mantener el dominio viejo activo con redirecciones por al menos 12 meses.
  - Revisar enlaces externos, redes sociales, perfiles de empresa y correos transaccionales.

## Verificacion esperada

- No deben existir referencias visibles a `NegocioRD`, `negocioRD` o `NEGOCIORD` en los archivos principales de la aplicacion.
- Las referencias restantes a `negociord` deben ser tecnicas, historicas o de dominio.
- La plataforma debe compilar igual que antes porque no se tocaron calculos, rutas, colecciones, reglas de suscripcion ni reglas de negocio.
