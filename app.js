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

function listen(app) {
  const portValue = process.env.PORT || '3000';
  const numericPort = Number(portValue);
  const listenTarget = Number.isNaN(numericPort) ? portValue : numericPort;
  const onListening = () => {
    console.log(`[Hostinger bootstrap] Diagnostic fallback listening on ${portValue}`);
  };

  if (typeof listenTarget === 'number') {
    return app.listen(listenTarget, '0.0.0.0', onListening);
  }

  return app.listen(listenTarget, onListening);
}

async function main() {
  if (!fs.existsSync(compiledServer)) {
    runProductionBuild();
  }

  if (!fs.existsSync(compiledServer)) {
    throw new Error('Production build did not create dist/server.cjs.');
  }

  await startCompiledServer();
}

main().catch((error) => {
  console.error('[Hostinger bootstrap] Failed to start production server:', error);

  const app = express();

  app.get(/.*/, (_req, res) => {
    res.status(503).send([
      'Tu Negocio RD deployment did not finish correctly.',
      'Check Hostinger build logs and make sure npm install && npm run build completed.',
      error instanceof Error ? error.message : String(error),
    ].join('\n'));
  });

  listen(app);
});
