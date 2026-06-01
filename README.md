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

## Hostinger Deploy

Recommended settings if Hostinger does not auto-detect the repository:

- Framework: `Other`
- Node.js: `22.x`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Entry file: `app.js`
- Start command: `npm start`

The app is not static-only. It needs the Node.js server for `/api/news`, `/api/rates`, checkout, sitemap, robots and SEO rendering.

## Firebase Auth Domains

For production login to work, add these domains in Firebase Console:

Authentication > Settings > Authorized domains

- `tunegociord.com`
- `www.tunegociord.com`
- `localhost` for local testing
