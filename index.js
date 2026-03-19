import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import expressPouchDB from 'express-pouchdb';
import PouchDB from 'pouchdb';
import { startBaileys, restartConnection } from './src/server/baileys.js';
import { startWorker } from './src/server/worker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'database');
const PouchDBWithPath = PouchDB.defaults({ prefix: dbPath + path.sep });

const app = express();

// PouchDB at /db untuk sinkronisasi
app.use('/db', expressPouchDB(PouchDBWithPath));

app.use(express.json());

// Restart WhatsApp connection (dapat QR baru setelah "QR refs attempts ended")
app.post('/api/whatsapp/restart', async (_req, res) => {
  try {
    await restartConnection(db);
    res.json({ ok: true });
  } catch (err) {
    console.error('restartConnection:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// File statis dari build Vue (PWA) — aset ber-hash di-cache lama, index.html tidak
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html') || filePath.endsWith('version.json')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// SPA fallback: index.html tanpa cache agar selalu cek versi terbaru
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

const db = new PouchDBWithPath('wa_database');

async function main() {
  await startBaileys(db);
  await startWorker(db);
  app.listen(PORT, () => {
    console.log(`PWASupperApps berjalan di http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
