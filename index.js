import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import 'dotenv/config'; 
import mysql from 'mysql2/promise';
import crypto from 'crypto';

import { startBaileys, restartConnection, getSocket } from './src/server/baileys.js';
import { startWorker } from './src/server/worker.js';
import { initMysql } from './src/server/init_mysql.js';

// Setup __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Configs
const mysqlHost = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1');

let mysqlPool = null;

async function setupMysql() {
  if (!process.env.MYSQL_HOST) {
    console.error('❌ MYSQL_HOST is not defined in .env');
    return;
  }
  
  try {
    mysqlPool = mysql.createPool({
      host: mysqlHost,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS || '',
      database: process.env.MYSQL_DB,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      multipleStatements: true
    });
    // Test connection
    await mysqlPool.query('SELECT 1');
    console.log('✅ MySQL Pool Connected.');
  } catch (err) {
    console.error('❌ MySQL Pool Error:', err.message);
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- AUTH MIDDLEWARE ---
const authenticate = async (req, res, next) => {
  const sessionId = req.headers['authorization'];
  
  if (!sessionId) {
    // Guest access check for Timestamp Camera
    if (req.path.includes('/api/modules/timestamp_camera')) {
        req.user = { isGuest: true, id: null, role: 'guest' };
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await mysqlPool.query(`
      SELECT s.id as sessionId, u.id, u.email, u.full_name, r.name as role
      FROM sessions_id s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users_has_roles uhr ON u.id = uhr.user_id
      LEFT JOIN roles r ON uhr.role_id = r.id
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
    `, [sessionId]);

    if (rows.length === 0) {
      if (req.path.includes('/api/modules/timestamp_camera')) {
          req.user = { isGuest: true, id: null, role: 'guest' };
          return next();
      }
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Authentication internal error' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, Password, dan Nama Lengkap wajib diisi.' });
  }

  try {
    // 1. Check if user already exists
    const [existing] = await mysqlPool.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    // 2. Insert new user
    const [result] = await mysqlPool.query(
      `INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)`,
      [email, password, full_name]
    );
    const userId = result.insertId;

    // 3. Get 'user' role ID
    const [roles] = await mysqlPool.query(`SELECT id FROM roles WHERE name = 'user'`);
    if (roles.length > 0) {
      const roleId = roles[0].id;
      // 4. Assign 'user' role
      await mysqlPool.query(`INSERT INTO users_has_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
    }

    res.json({ ok: true, message: 'Registrasi berhasil. Silakan login.' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat registrasi.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await mysqlPool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Email tidak ditemukan' });
    
    const user = users[0];
    if (user.password !== password) return res.status(401).json({ error: 'Password salah' });
    
    // Get user roles
    const [roles] = await mysqlPool.query(`
      SELECT r.name FROM roles r 
      JOIN users_has_roles uhr ON r.id = uhr.role_id 
      WHERE uhr.user_id = ?
    `, [user.id]);
    const userRole = roles.length > 0 ? roles[0].name : 'user';

    // Check if user already has an active session (skip for admin/superadmin)
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      const [activeSessions] = await mysqlPool.query(
        `SELECT id FROM sessions_id WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP`,
        [user.id]
      );
      if (activeSessions.length > 0) {
        return res.status(403).json({ error: 'User sudah login. Tutup sesi di perangkat/browser lain terlebih dahulu.' });
      }
    }
    
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await mysqlPool.query(`INSERT INTO sessions_id (id, user_id, expires_at) VALUES (?, ?, ?)`, [sessionId, user.id, expiresAt]);
    
    res.json({ 
      sessionId, 
      user: { 
        id: user.id, 
        email: user.email, 
        full_name: user.full_name, 
        role: userRole 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    await mysqlPool.query(`DELETE FROM sessions_id WHERE id = ?`, [req.user.sessionId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// --- CHAT ONLINE STATUS ---
app.post('/api/chat/ping', authenticate, async (req, res) => {
  try {
    await mysqlPool.query(
      `INSERT INTO is_online_chat (user_id, last_seen) VALUES (?, CURRENT_TIMESTAMP) 
       ON DUPLICATE KEY UPDATE last_seen = CURRENT_TIMESTAMP`,
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/chat/online', authenticate, async (req, res) => {
  try {
    // Users active in last 35 seconds
    const [rows] = await mysqlPool.query(`
      SELECT u.email, u.id 
      FROM is_online_chat o
      JOIN users u ON o.user_id = u.id
      WHERE o.last_seen > DATE_SUB(NOW(), INTERVAL 35 SECOND)
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', authenticate, async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT u.id, u.email, u.full_name 
      FROM users u
      LEFT JOIN users_has_roles uhr ON u.id = uhr.user_id
      LEFT JOIN roles r ON uhr.role_id = r.id
      WHERE (r.name IS NULL OR (r.name != 'admin' AND r.name != 'superadmin'))
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.created_at, 
        r.name as role,
        (SELECT COUNT(*) FROM sessions_id WHERE user_id = u.id AND expires_at > CURRENT_TIMESTAMP) as active_sessions
      FROM users u
      LEFT JOIN users_has_roles uhr ON u.id = uhr.user_id
      LEFT JOIN roles r ON uhr.role_id = r.id
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    const [result] = await mysqlPool.query(`INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)`, [email, password, full_name]);
    const userId = result.insertId;
    
    if (role) {
      const [roleRows] = await mysqlPool.query(`SELECT id FROM roles WHERE name = ?`, [role]);
      if (roleRows.length > 0) {
        await mysqlPool.query(`INSERT INTO users_has_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleRows[0].id]);
      }
    }
    res.json({ ok: true, id: userId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await mysqlPool.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/sessions/:userId', authenticate, isAdmin, async (req, res) => {
  try {
    await mysqlPool.query(`DELETE FROM sessions_id WHERE user_id = ?`, [req.params.userId]);
    res.json({ ok: true, message: 'Sessions cleared' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- MODULE ROUTES ---
const MODNAME_TO_TABLE = {
  'wa_blaster': 'wa_blaster',
  'getlynk_id': 'getlynk_id',
  'instant_chat': 'instant_chat',
  'wedding_invitation': 'wedding_invitation',
  'timestamp_camera': 'timestamp_camera'
};

app.get('/api/modules/:module', authenticate, async (req, res) => {
  const tableName = MODNAME_TO_TABLE[req.params.module];
  if (!tableName) return res.status(404).json({ error: 'Module not found' });
  
  try {
    let query, params;
    if (tableName === 'timestamp_camera' && req.user.isGuest) {
      query = `SELECT * FROM ${tableName} WHERE is_guest = 1 ORDER BY updated_at DESC LIMIT 50`;
      params = [];
    } else if (tableName === 'instant_chat') {
      // For chat, we need messages where current user is SENDER or RECIPIENT
      // Use ->> for unquoted JSON value comparison
      query = `
        SELECT * FROM ${tableName} 
        WHERE user_id = ? 
        OR JSON_UNQUOTE(JSON_EXTRACT(data, '$.to')) = ? 
        ORDER BY updated_at DESC LIMIT 200
      `;
      params = [req.user.id, req.user.email];
    } else {
      query = `SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY updated_at DESC`;
      params = [req.user.id];
    }
    
    const [rows] = await mysqlPool.query(query, params);
    // Parse data field if it's JSON
    const results = rows.map(r => {
      let parsedData = {};
      try {
        parsedData = JSON.parse(r.data || '{}');
      } catch (e) {
        console.warn('Malformed JSON in DB for module:', req.params.module, r.id);
      }
      return {
        id: r.id,
        user_id: r.user_id,
        is_guest: r.is_guest,
        updated_at: r.updated_at,
        data: parsedData
      };
    });
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/modules/:module', authenticate, async (req, res) => {
  const tableName = MODNAME_TO_TABLE[req.params.module];
  if (!tableName) return res.status(404).json({ error: 'Module not found' });
  const { data, id } = req.body;
  
  try {
    let finalData = data;
    
    // Support for physical file storage for Timestamp Camera
    if (req.params.module === 'timestamp_camera' && data && data.image && data.image.startsWith('data:image')) {
       try {
         const publicDir = path.join(__dirname, 'public', 'timestamp-camera');
         if (!fs.existsSync(publicDir)) {
           fs.mkdirSync(publicDir, { recursive: true });
         }
         
         const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
         const fileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
         const filePath = path.join(publicDir, fileName);
         
         fs.writeFileSync(filePath, base64Data, 'base64');
         
         // Replace base64 with relative URL
         finalData = { ...data, image: `/timestamp-camera/${fileName}` };
       } catch (err) {
         console.error('File Save Error:', err.message);
       }
    }

    const dataStr = JSON.stringify(finalData || {});

    if (id) {
       await mysqlPool.query(`UPDATE ${tableName} SET data = ? WHERE id = ? AND (user_id = ? OR is_guest = 1)`, [dataStr, id, req.user.id]);
       res.json({ ok: true, id });
    } else {
       const isGuest = req.user.isGuest ? 1 : 0;
       const [result] = await mysqlPool.query(`INSERT INTO ${tableName} (user_id, data, is_guest) VALUES (?, ?, ?)`, [req.user.id, dataStr, isGuest]);
       res.json({ ok: true, id: result.insertId });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/modules/:module/:id', authenticate, async (req, res) => {
  const tableName = MODNAME_TO_TABLE[req.params.module];
  if (!tableName) return res.status(404).json({ error: 'Module not found' });
  try {
    const [result] = await mysqlPool.query(`DELETE FROM ${tableName} WHERE id = ? AND (user_id = ? OR is_guest = 1)`, [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- WHATSAPP API ---
app.get('/api/whatsapp/status', authenticate, async (req, res) => {
  try {
    const sessionId = req.query.session || 'main'; // This is the client-provided session identifier
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ error: 'User context required for WhatsApp' });
    }

    // Attempt to start baileys if not already running for this session
    await startBaileys(mysqlPool, userId, sessionId);

    // Get status from MySQL (updated by baileys service)
    const [rows] = await mysqlPool.query(
        "SELECT data FROM wa_blaster WHERE user_id = ? AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) = 'connection' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.sessionId')) = ?",
        [userId, sessionId]
    );

    if (rows.length > 0) {
        res.json(rows[0].data);
    } else {
        res.json({ status: 'connecting' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/restart', authenticate, async (req, res) => {
  try {
    const sessionId = req.body.session || 'main';
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'User context required' });
    
    await restartConnection(mysqlPool, userId, sessionId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXTERNAL APIS CACHE ---
const apiCache = {
  news: { data: null, expiry: 0 },
  weather: {} // key: adm4
};
const CACHE_TTL = 15 * 60 * 1000; // 15 mins

// --- EXTERNAL APIS ---
app.get('/api/weather-official', async (req, res) => {
  const { adm4 } = req.query;
  if (!adm4) return res.status(400).json({ error: 'Missing adm4 parameter' });
  
  const now = Date.now();
  if (apiCache.weather[adm4] && apiCache.weather[adm4].expiry > now) {
    return res.json(apiCache.weather[adm4].data);
  }

  try {
    const response = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`);
    const data = await response.json();
    apiCache.weather[adm4] = { data, expiry: now + CACHE_TTL };
    res.json(data);
  } catch (err) { 
    if (apiCache.weather[adm4]) return res.json(apiCache.weather[adm4].data); // Fallback to stale
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/news', async (_req, res) => {
  const now = Date.now();
  if (apiCache.news.data && apiCache.news.expiry > now) {
    res.set('Content-Type', 'text/html');
    return res.send(apiCache.news.data);
  }

  try {
    const response = await fetch('https://news.google.com/home?hl=id&gl=ID&ceid=ID:id');
    const html = await response.text();
    apiCache.news = { data: html, expiry: now + CACHE_TTL };
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) { 
    if (apiCache.news.data) {
        res.set('Content-Type', 'text/html');
        return res.send(apiCache.news.data);
    }
    res.status(500).json({ error: err.message }); 
  }
});

// --- STATIC FILES ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- MAIN STARTUP ---
async function main() {
  console.log('🏛️ Starting Centralized System...');
  
  // 1. Initialize MySQL Schema
  await initMysql({
    host: mysqlHost,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB,
    dropAll: process.env.MYSQL_DROP_ON_START === 'true' // Destructive only if explicit
  });

  // 2. Setup MySQL Pool
  await setupMysql();

  if (!mysqlPool) {
    console.error('❌ Failed to initialize MySQL Pool. Exiting.');
    process.exit(1);
  }

  // 3. Start Global Background Worker
  await startWorker(mysqlPool);

  // 4. Start Server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('💥 Critical startup failure:', err);
  process.exit(1);
});
