import express from 'express';
import fs from 'fs';
import path from 'path';

const compiledServer = path.join(process.cwd(), 'dist', 'server.cjs');

if (fs.existsSync(compiledServer)) {
  await import('./dist/server.cjs');
} else {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.get('*', (_req, res) => {
    res.status(503).send('Tu Negocio RD is installed. Run npm run build before starting production.');
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Hostinger bootstrap] Waiting for production build on port ${port}`);
  });
}
