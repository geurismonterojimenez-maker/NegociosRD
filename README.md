<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6b4de314-9928-476e-bff8-8204b2740bcc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Produccion

Para publicar en Hostinger con backend Express, compila con:

`npm run build`

Y arranca:

`npm start`

La guia completa de variables, dominio `tunegociord.com`, facturas Gmail, Azul y Google Pay esta en [docs/hostinger-produccion.md](docs/hostinger-produccion.md).
