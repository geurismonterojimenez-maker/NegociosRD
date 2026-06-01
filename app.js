import express from 'express';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const compiledServer = path.join(process.cwd(), 'dist', 'server.cjs');

async function startCompiledServer() {
  await import('./dist/server.cjs');
}

function runProductionBuild() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  console.log('[Hostinger bootstrap] dist/server.cjs not found. Running npm run build...');
  execFileSync(npmCommand, ['run', 'build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
    },
  });
}

try {
  if (!fs.existsSync(compiledServer)) {
    runProductionBuild();
  }

  if (!fs.existsSync(compiledServer)) {
    throw new Error('Production build did not create dist/server.cjs.');
  }

  await startCompiledServer();
} catch (error) {
  console.error('[Hostinger bootstrap] Failed to start production server:', error);

  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.get(/.*/, (_req, res) => {
    res.status(503).send([
      'Tu Negocio RD deployment did not finish correctly.',
      'Check Hostinger build logs and make sure npm install && npm run build completed.',
      error instanceof Error ? error.message : String(error),
    ].join('\n'));
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Hostinger bootstrap] Diagnostic fallback listening on port ${port}`);
  });
}
