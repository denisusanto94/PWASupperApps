import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import express from 'express';
import expressPouchDB from 'express-pouchdb';
import PouchDB from 'pouchdb';
import { startBaileys, restartConnection, getSocket } from './src/server/baileys.js';

import { startWorker } from './src/server/worker.js';
import { initDbMigrations } from './src/server/init_db_schemas.js';
import { initMysql } from './src/server/init_mysql.js';
import 'dotenv/config'; // Load .env
import mysql from 'mysql2/promise';

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
  // Optional: process.exit(1);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME || 'wa_database';
const dbPath = path.resolve(__dirname, process.env.DATABASE_DIR || './database');
const PouchDBStore = PouchDB.defaults({ prefix: dbPath + path.sep });

const dbCache = new Map();
function getDb(name) {
  if (!dbCache.has(name)) {
    dbCache.set(name, new PouchDBStore(name));
  }
  return dbCache.get(name);
}

// MySQL Bridge Configuration
const mysqlHost = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1');

let mysqlPool = null;

async function startMysqlBridge() {
  if (!process.env.MYSQL_HOST) return;
  
  try {
    mysqlPool = mysql.createPool({
      host: mysqlHost,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS || '',
      database: process.env.MYSQL_DB,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    // Test connection and try to increase max_allowed_packet if possible
    await mysqlPool.query('SELECT 1');
    try {
      await mysqlPool.query('SET GLOBAL max_allowed_packet = 16777216'); // 16MB
      console.log('✅ Set GLOBAL max_allowed_packet to 16MB');
    } catch (e) {
      console.warn('⚠️ Gagal set GLOBAL max_allowed_packet (Permission?). Mencoba SESSION...');
      try {
        await mysqlPool.query('SET SESSION max_allowed_packet = 16777216');
        console.log('✅ Set SESSION max_allowed_packet to 16MB');
      } catch (e2) {
        console.warn('⚠️ Gagal set SESSION max_allowed_packet. Pastikan konfigurasi MySQL manual (my.cnf) sudah cukup besar.');
      }
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat menghubungkan ke MySQL Pool:', err.message);
    console.warn('⚠️ Sinkronisasi ke MySQL dinonaktifkan.');
    return;
  }

  const dbsToSync = [
    process.env.DB_NAME || 'wa_database',
    'chat_messages',
    'chat_users',
    'is_online_chat',
    'is_online_general',
    'pwa_version',
    'getlynkid_data',
    'getlynkid_users',
    'wedding_invitation',
    'wedding_users',
    'timestamp_camera'
  ];

  console.log(`🚀 MySQL Bridge Aktif: Mensinkronkan [${dbsToSync.join(', ')}] ke MySQL...`);

  for (const dbName of dbsToSync) {
    const dbInstance = getDb(dbName);
    
    // Perform Initial Full Sync
    try {
      console.log(`- Melakukan inisialisasi data untuk [${dbName}]...`);
      const allRes = await dbInstance.allDocs({ include_docs: true });
      for (const row of allRes.rows) {
        if (row.doc && !row.id.startsWith('_design/')) {
          await syncDocToMysql(dbName, row.doc);
        }
      }
      console.log(`- Inisialisasi [${dbName}] Selesai.`);
    } catch (err) {
      console.error(`❌ Gagal inisialisasi awal ${dbName}:`, err.message);
    }

    // Start Live Sync
    dbInstance.changes({ since: 'now', live: true, include_docs: true })
      .on('change', async (change) => {
        if (change.doc && !change.id.startsWith('_design/')) {
          await syncDocToMysql(dbName, change.doc);
        }
      })
      .on('error', err => console.error(`Bridge error on ${dbName}:`, err));
  }
}

async function syncDocToMysql(dbName, doc) {
  if (!mysqlPool) return;
  const chatStatus = doc.status || (doc.type === 'chat_msg' ? 'sent' : null);
  
  try {
    const dataJson = JSON.stringify(doc);
    // 1. Unified pwa_data sync
    await mysqlPool.query(
      `INSERT INTO pwa_data (id, source_db, type, data, chat_status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, type = ?, chat_status = ?`,
      [doc._id, dbName, doc.type || 'unknown', dataJson, chatStatus, dataJson, doc.type || 'unknown', chatStatus]
    );

    // 2. Specialized Table Sync
    if (dbName === 'is_online_chat') {
      await mysqlPool.query(`INSERT INTO is_online_chat (username, last_seen) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen = ?`, [doc._id, doc.lastSeen, doc.lastSeen]);
    } else if (dbName === 'is_online_general') {
      await mysqlPool.query(`INSERT INTO is_online_general (client_id, last_seen) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen = ?`, [doc._id, doc.lastSeen, doc.lastSeen]);
    } else if (dbName === 'pwa_version' && doc._id === 'current_version') {
      await mysqlPool.query(`INSERT INTO pwa_version (id, version) VALUES (?, ?) ON DUPLICATE KEY UPDATE version = ?`, [doc._id, doc.version, doc.version]);
    } else if (dbName === 'chat_users') {
      await mysqlPool.query(`INSERT INTO users_chat (username, password, created_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?`, [doc._id, doc.password, doc.createdAt || new Date().toISOString(), doc.password]);
    }
  } catch (e) {
    if (e.message.includes('max_allowed_packet')) {
      console.error(`❌ Gagal sinkron ${dbName}/${doc._id}: Data terlalu besar untuk MySQL. Lewati...`);
    } else {
      console.error(`❌ Bridge sync failed for ${dbName}/${doc._id}:`, e.message);
    }
  }
}


const app = express();
app.use(express.json());

app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const sessionId = req.query.id || 'main';
    const socket = getSocket(sessionId);
    const sessionDb = getDb(sessionId === 'main' ? DB_NAME : `wa_database_${sessionId}`);

    // If session is NOT active in memory, initialize it!
    if (!socket) {
      console.log(`📡 Auto-starting inactive session [${sessionId}] requested by client...`);
      startBaileys(sessionDb, sessionId).catch(err => console.error(`Auto-start Baileys error [${sessionId}]:`, err.message));
      startWorker(sessionDb, sessionId).catch(err => console.error(`Auto-start Worker error [${sessionId}]:`, err.message));
    }

    const doc = await sessionDb.get('connection').catch(err => {
      if (err.status === 404) return { status: 'connecting' };
      throw err;
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    const sessionId = req.body.id || 'main';
    const sessionDb = getDb(sessionId === 'main' ? DB_NAME : `wa_database_${sessionId}`);
    console.log(`🔄 Restarting session [${sessionId}]...`);
    await restartConnection(sessionDb, sessionId);
    startWorker(sessionDb, sessionId).catch(err => console.error(`Worker start error [${sessionId}]:`, err));
    res.json({ ok: true });
  } catch (err) {


    console.error('restartConnection:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/weather-official', async (req, res) => {
  try {
    const { adm4 } = req.query;
    if (!adm4) return res.status(400).json({ error: 'Missing adm4 parameter' });
    const response = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`);
    const data = await response.json();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/news', async (_req, res) => {
  try {
    const response = await fetch('https://news.google.com/home?hl=id&gl=ID&ceid=ID:id');
    const html = await response.text();
    res.send(html);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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

app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

async function main() {
  // MySQL Setup
  if (process.env.MYSQL_HOST) {
    await initMysql({
      host: mysqlHost,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB
    });
  }

  // PouchDB Setup
  await initDbMigrations(dbPath);
  app.use('/db', expressPouchDB(PouchDBStore));
  
  const mainDb = getDb(DB_NAME);
  await startBaileys(mainDb, 'main');
  await startWorker(mainDb);

  // Auto-start other sessions
  try {
    const SESSIONS_DIR = path.resolve(__dirname, process.env.SESSIONS_DIR || './sessions');
    if (fs.existsSync(SESSIONS_DIR)) {
      const folders = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      for (const sessId of folders) {
        if (sessId === 'main') continue; // Avoid starting twice
        console.log(`🚀 Auto-starting WhatsApp session: ${sessId}...`);
        const sessionDb = getDb(`wa_database_${sessId}`);
        startBaileys(sessionDb, sessId).catch(err => console.error(`Error auto-starting ${sessId}:`, err));
        startWorker(sessionDb).catch(err => console.error(`Error starting worker for ${sessId}:`, err));
      }
    }

  } catch (err) {
    console.error('Error scanning sessions for auto-start:', err);
  }


  startMysqlBridge().catch(err => console.error('MySQL Bridge Startup Error:', err)); 
  
  app.listen(PORT, () => {
    console.log(`PWASupperApps berjalan di http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
