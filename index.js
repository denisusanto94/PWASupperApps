import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import expressPouchDB from 'express-pouchdb';
import PouchDB from 'pouchdb';
import { startBaileys, restartConnection } from './src/server/baileys.js';
import { startWorker } from './src/server/worker.js';
import { initDbMigrations } from './src/server/init_db_schemas.js';
import 'dotenv/config'; // Load .env
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME || 'wa_database';
const dbPath = path.resolve(__dirname, process.env.DATABASE_DIR || './database');
const PouchDBStore = PouchDB.defaults({ prefix: dbPath + path.sep });

// MySQL Bridge Configuration
const mysqlHost = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1');

async function startMysqlBridge() {
  if (!process.env.MYSQL_HOST) return;
  const connection = await mysql.createConnection({
    host: mysqlHost,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB
  });

  const dbsToSync = [
    process.env.DB_NAME || 'wa_database',
    'chat_messages',
    'chat_users',
    'getlynkid_data',
    'getlynkid_users',
    'wedding_invitation',
    'wedding_users'
  ];

  console.log(`🚀 MySQL Bridge Aktif: Mensinkronkan [${dbsToSync.join(', ')}] ke MySQL...`);

  dbsToSync.forEach(dbName => {
    const dbInstance = new PouchDBStore(dbName);
    dbInstance.changes({ since: 'now', live: true, include_docs: true })
      .on('change', async (change) => {
        if (change.doc && !change.id.startsWith('_design/')) {
          const doc = change.doc;
          await connection.query(
            `INSERT INTO pwa_data (id, source_db, type, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, type = ?`,
            [doc._id, dbName, doc.type || 'unknown', JSON.stringify(doc), JSON.stringify(doc), doc.type || 'unknown']
          );
        }
      })
      .on('error', err => console.error(`Bridge error on ${dbName}:`, err));
  });
}

const app = express();

// PouchDB at /db untuk sinkronisasi
app.use('/db', expressPouchDB(PouchDBStore));

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

const db = new PouchDBStore(DB_NAME);

async function main() {
  // Jalankan migrasi DB (Index & Seed) otomatis pada startup
  await initDbMigrations(dbPath);
  
  await startBaileys(db);
  await startWorker(db);
  await startMysqlBridge(); // Aktifkan sinkronisasi ke MySQL untuk semua modul
  app.listen(PORT, () => {
    console.log(`PWASupperApps berjalan di http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
