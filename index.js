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
      SELECT s.id as sessionId, u.id, u.email, u.full_name, r.name as role, s.expires_at, s.last_activity
      FROM sessions_id s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users_has_roles uhr ON u.id = uhr.user_id
      LEFT JOIN roles r ON uhr.role_id = r.id
      WHERE s.id = ?
    `, [sessionId]);

    if (rows.length === 0) {
      if (req.path.includes('/api/modules/timestamp_camera')) {
          req.user = { isGuest: true, id: null, role: 'guest' };
          return next();
      }
      console.log(`🔍 [Auth] Session not found: ${sessionId.slice(0, 8)}...`);
      return res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan login kembali.' });
    }

    const session = rows[0];
    
    // Debug logging
    const [timeDebug] = await mysqlPool.query(`SELECT NOW() as dbnow, s.expires_at, s.last_activity FROM sessions_id s WHERE s.id = ?`, [sessionId]);
    if (timeDebug.length > 0) {
      console.log(`🔍 [Auth Debug] DB Now: ${timeDebug[0].dbnow}, Exp: ${timeDebug[0].expires_at}, Last: ${timeDebug[0].last_activity}`);
    }

    // 1. Check absolute expiration
    const [expiredCheck] = await mysqlPool.query(
      `SELECT id FROM sessions_id WHERE id = ? AND expires_at > NOW()`, 
      [sessionId]
    );
    if (expiredCheck.length === 0) {
      console.log(`🔍 [Auth] Session expired: ${sessionId.slice(0, 8)}...`);
      await mysqlPool.query(`DELETE FROM sessions_id WHERE id = ?`, [sessionId]);
      return res.status(401).json({ error: 'Sesi kedaluwarsa. Silakan login kembali.' });
    }

    // 2. Check idle timeout (30 minutes)
    const [idleCheck] = await mysqlPool.query(
      `SELECT id FROM sessions_id WHERE id = ? AND TIMESTAMPDIFF(MINUTE, last_activity, NOW()) < 30`, 
      [sessionId]
    );
    if (idleCheck.length === 0) {
      console.log(`🔍 [Auth] Session idle > 30m: ${sessionId.slice(0, 8)}...`);
      await mysqlPool.query(`DELETE FROM sessions_id WHERE id = ?`, [sessionId]);
      return res.status(401).json({ error: 'Sesi berakhir karena idle selama 30 menit.' });
    }

    // Update last_activity to now
    await mysqlPool.query(`UPDATE sessions_id SET last_activity = CURRENT_TIMESTAMP WHERE id = ?`, [sessionId]);

    req.user = session;
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

    // --- MULTI-DEVICE SUPPORT ENABLED FOR ALL USERS ---
    // (Previously regular users were restricted to one active session)
    
    const sessionId = crypto.randomUUID();
    
    await mysqlPool.query(
      `INSERT INTO sessions_id (id, user_id, expires_at, last_activity) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), CURRENT_TIMESTAMP)`, 
      [sessionId, user.id]
    );
    console.log(`🚀 [Session] Created session: ${sessionId.slice(0, 8)}... for user: ${user.email}`);
    
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

function generateVconferenceRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 10; i++) {
    s += chars[crypto.randomInt(0, chars.length)];
  }
  return s;
}

/** datetime-local / ISO string → MySQL DATETIME (komponen lokal browser) */
function dateInputToMysqlLocal(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

async function insertMeetingInviteNotification(pool, { recipientUserId, vconferenceId, roomCode, title, creatorLabel }) {
  const t = title ? String(title).trim().slice(0, 120) : 'Meeting';
  const body = `Anda diundang ke "${t}" oleh ${creatorLabel}. Kode room: ${roomCode}`;
  const dataJson = JSON.stringify({
    vconference_id: vconferenceId,
    room_code: String(roomCode).toUpperCase(),
    type: 'meeting_invite'
  });
  await pool.query(
    `INSERT INTO user_notifications (user_id, type, title, body, data_json) VALUES (?, 'meeting_invite', ?, ?, ?)`,
    [recipientUserId, 'Undangan Meeting Online', body, dataJson]
  );
}

app.get('/api/notifications', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  try {
    if (String(req.query.summary || '') === '1') {
      const [countRows] = await mysqlPool.query(
        `SELECT COUNT(*) AS c FROM user_notifications WHERE user_id = ? AND read_at IS NULL`,
        [req.user.id]
      );
      return res.json({ unread_count: Number(countRows[0]?.c ?? 0) });
    }
    const [countRows] = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM user_notifications WHERE user_id = ? AND read_at IS NULL`,
      [req.user.id]
    );
    const unread = Number(countRows[0]?.c ?? 0);
    const [items] = await mysqlPool.query(
      `SELECT id, type, title, body, data_json, read_at, created_at
       FROM user_notifications WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 80`,
      [req.user.id]
    );
    const normalized = items.map((row) => {
      let data = row.data_json;
      if (Buffer.isBuffer && Buffer.isBuffer(data)) {
        try {
          data = JSON.parse(data.toString('utf8'));
        } catch {
          data = null;
        }
      } else if (data != null && typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          data = null;
        }
      }
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        data,
        read_at: row.read_at,
        created_at: row.created_at
      };
    });
    res.json({ unread_count: unread, items: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/read-all', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  try {
    await mysqlPool.query(`UPDATE user_notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL`, [
      req.user.id
    ]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/mark-meeting-read', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const code = String(req.body?.room_code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'room_code wajib.' });
  try {
    await mysqlPool.query(
      `UPDATE user_notifications SET read_at = NOW()
       WHERE user_id = ? AND type = 'meeting_invite' AND read_at IS NULL
         AND JSON_UNQUOTE(JSON_EXTRACT(data_json, '$.room_code')) = ?`,
      [req.user.id, code]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  try {
    const [r] = await mysqlPool.query(
      `UPDATE user_notifications SET read_at = NOW() WHERE id = ? AND user_id = ? AND read_at IS NULL`,
      [id, req.user.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tidak ditemukan.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Daftar user untuk undangan meeting (semua kecuali diri sendiri) */
app.get('/api/vconference/invite-candidates', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const [rows] = await mysqlPool.query(
      `SELECT id, email, full_name FROM users WHERE id != ? ORDER BY full_name ASC, email ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vconference', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const [rows] = await mysqlPool.query(
      `SELECT DISTINCT v.id, v.user_id, v.room_code, v.title, v.scheduled_start, v.scheduled_end,
              v.link_gdrive, v.created_at, v.updated_at,
              uc.full_name AS creator_name, uc.email AS creator_email,
              CASE WHEN v.user_id = ? THEN 1 ELSE 0 END AS is_creator,
              (SELECT COUNT(*) FROM vconference_participants pc WHERE pc.vconference_id = v.id) AS participant_count
       FROM vconference v
       JOIN users uc ON uc.id = v.user_id
       LEFT JOIN vconference_participants p ON p.vconference_id = v.id AND p.user_id = ?
       WHERE v.user_id = ? OR p.user_id IS NOT NULL
       ORDER BY v.scheduled_start DESC`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vconference/by-code/:code', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const code = String(req.params.code || '').trim().toUpperCase();
  if (code.length < 4) return res.status(400).json({ error: 'Kode room tidak valid.' });
  try {
    const [confRows] = await mysqlPool.query(
      `SELECT v.*, uc.full_name AS creator_name, uc.email AS creator_email
       FROM vconference v
       JOIN users uc ON uc.id = v.user_id
       WHERE v.room_code = ?`,
      [code]
    );
    if (confRows.length === 0) return res.status(404).json({ error: 'Meeting tidak ditemukan.' });
    const v = confRows[0];
    const [partRows] = await mysqlPool.query(
      `SELECT p.user_id, p.invited_at, p.joined_at, u.full_name, u.email
       FROM vconference_participants p
       JOIN users u ON u.id = p.user_id
       WHERE p.vconference_id = ?
       ORDER BY p.invited_at ASC`,
      [v.id]
    );
    const access =
      v.user_id === req.user.id ||
      partRows.some((p) => p.user_id === req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Anda tidak diundang ke meeting ini. Minta link atau undangan dari pembuat.' });
    }
    res.json({
      ...v,
      participants: partRows,
      jitsi_room_name: `PWASupperApps-${v.room_code}`,
      share_path: `/vconference/room/${v.room_code}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vconference', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const { title, scheduled_start, scheduled_end, link_gdrive, invite_user_ids } = req.body || {};
  const startStr = dateInputToMysqlLocal(scheduled_start);
  const endStr = dateInputToMysqlLocal(scheduled_end);
  if (!startStr || !endStr) {
    return res.status(400).json({ error: 'Jadwal mulai dan selesai wajib diisi (format valid).' });
  }
  if (new Date(scheduled_end) <= new Date(scheduled_start)) {
    return res.status(400).json({ error: 'Waktu selesai harus setelah waktu mulai.' });
  }
  const invites = Array.isArray(invite_user_ids)
    ? [...new Set(invite_user_ids.map((x) => parseInt(String(x), 10)).filter((n) => Number.isFinite(n) && n !== req.user.id))]
    : [];
  let roomCode = '';
  try {
    for (let attempt = 0; attempt < 8; attempt++) {
      roomCode = generateVconferenceRoomCode();
      try {
        const [ins] = await mysqlPool.query(
          `INSERT INTO vconference (user_id, room_code, title, scheduled_start, scheduled_end, link_gdrive)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            roomCode,
            title ? String(title).trim().slice(0, 255) || null : null,
            startStr,
            endStr,
            link_gdrive ? String(link_gdrive).trim().slice(0, 2000) || null : null
          ]
        );
        const vid = ins.insertId;
        const creatorLabel = req.user.full_name || req.user.email || 'Pengguna';
        const meetTitle = title ? String(title).trim().slice(0, 255) || null : null;
        for (const uid of invites) {
          const [r] = await mysqlPool.query(
            `INSERT IGNORE INTO vconference_participants (vconference_id, user_id, invited_at, joined_at)
             VALUES (?, ?, NOW(), NULL)`,
            [vid, uid]
          );
          if (r.affectedRows === 1) {
            try {
              await insertMeetingInviteNotification(mysqlPool, {
                recipientUserId: uid,
                vconferenceId: vid,
                roomCode,
                title: meetTitle,
                creatorLabel
              });
            } catch (ne) {
              console.warn('Meeting invite notification:', ne.message);
            }
          }
        }
        return res.json({
          ok: true,
          id: vid,
          room_code: roomCode,
          jitsi_room_name: `PWASupperApps-${roomCode}`,
          share_path: `/vconference/room/${roomCode}`
        });
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        throw e;
      }
    }
    return res.status(500).json({ error: 'Gagal membuat kode room unik.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vconference/join', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const code = String(req.body?.room_code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'room_code wajib.' });
  try {
    const [confRows] = await mysqlPool.query(`SELECT id, user_id FROM vconference WHERE room_code = ?`, [code]);
    if (confRows.length === 0) return res.status(404).json({ error: 'Meeting tidak ditemukan.' });
    const { id: vid, user_id: creatorId } = confRows[0];
    await mysqlPool.query(
      `INSERT INTO vconference_participants (vconference_id, user_id, invited_at, joined_at)
       VALUES (?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE joined_at = NOW()`,
      [vid, req.user.id]
    );
    res.json({ ok: true, vconference_id: vid, is_creator: creatorId === req.user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/vconference/:id', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  const { title, scheduled_start, scheduled_end, link_gdrive, invite_user_ids } = req.body || {};
  try {
    const [own] = await mysqlPool.query(`SELECT * FROM vconference WHERE id = ? AND user_id = ?`, [id, req.user.id]);
    if (own.length === 0) return res.status(403).json({ error: 'Hanya pembuat meeting yang dapat mengubah.' });
    const cur = own[0];
    let start =
      cur.scheduled_start instanceof Date
        ? dateInputToMysqlLocal(cur.scheduled_start)
        : String(cur.scheduled_start).replace('T', ' ').slice(0, 19);
    let end =
      cur.scheduled_end instanceof Date
        ? dateInputToMysqlLocal(cur.scheduled_end)
        : String(cur.scheduled_end).replace('T', ' ').slice(0, 19);
    if (scheduled_start != null && scheduled_start !== '') {
      const s = dateInputToMysqlLocal(scheduled_start);
      if (!s) return res.status(400).json({ error: 'scheduled_start tidak valid.' });
      start = s;
    }
    if (scheduled_end != null && scheduled_end !== '') {
      const e = dateInputToMysqlLocal(scheduled_end);
      if (!e) return res.status(400).json({ error: 'scheduled_end tidak valid.' });
      end = e;
    }
    if (new Date(String(end).replace(' ', 'T')) <= new Date(String(start).replace(' ', 'T'))) {
      return res.status(400).json({ error: 'Waktu selesai harus setelah waktu mulai.' });
    }
    const setParts = [
      'title = COALESCE(?, title)',
      'scheduled_start = ?',
      'scheduled_end = ?'
    ];
    const setVals = [
      title !== undefined ? (String(title).trim().slice(0, 255) || null) : null,
      start,
      end
    ];
    if (link_gdrive !== undefined) {
      setParts.push('link_gdrive = ?');
      setVals.push(String(link_gdrive).trim().slice(0, 2000) || null);
    }
    setVals.push(id);
    await mysqlPool.query(
      `UPDATE vconference SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      setVals
    );
    if (Array.isArray(invite_user_ids)) {
      const invites = [...new Set(invite_user_ids.map((x) => parseInt(String(x), 10)).filter((n) => Number.isFinite(n) && n !== req.user.id))];
      const creatorLabel = req.user.full_name || req.user.email || 'Pengguna';
      const meetTitle = cur.title;
      const rc = cur.room_code;
      for (const uid of invites) {
        const [r] = await mysqlPool.query(
          `INSERT IGNORE INTO vconference_participants (vconference_id, user_id, invited_at, joined_at)
           VALUES (?, ?, NOW(), NULL)`,
          [id, uid]
        );
        if (r.affectedRows === 1) {
          try {
            await insertMeetingInviteNotification(mysqlPool, {
              recipientUserId: uid,
              vconferenceId: id,
              roomCode: rc,
              title: meetTitle,
              creatorLabel
            });
          } catch (ne) {
            console.warn('Meeting invite notification:', ne.message);
          }
        }
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vconference/:id', authenticate, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  try {
    const [r] = await mysqlPool.query(`DELETE FROM vconference WHERE id = ? AND user_id = ?`, [id, req.user.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tidak ditemukan atau bukan pemilik.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

app.get('/api/admin/maps-shareit', authenticate, isAdmin, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 200, 1), 500);
  const offset = Math.max(parseInt(String(req.query.offset), 10) || 0, 0);
  try {
    const [countRows] = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM maps_shareit WHERE data IS NOT NULL AND TRIM(data) != ''`
    );
    const [rows] = await mysqlPool.query(
      `SELECT m.id, m.user_id, m.data, m.updated_at, u.full_name AS contributor_name, u.email AS contributor_email
       FROM maps_shareit m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.data IS NOT NULL AND TRIM(m.data) != ''
       ORDER BY m.updated_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const items = rows.map((r) => {
      let d = {};
      try {
        d = JSON.parse(r.data || '{}');
      } catch {
        /* ignore */
      }
      return {
        id: r.id,
        user_id: r.user_id,
        updated_at: r.updated_at,
        contributor_name: r.contributor_name || '—',
        contributor_email: r.contributor_email || '—',
        latitude: d.latitude != null ? Number(d.latitude) : null,
        longitude: d.longitude != null ? Number(d.longitude) : null,
        kategori: d.kategori || '',
        komentar: d.komentar || '',
        addressLabel: d.addressLabel || '',
        verified: d.verified === true
      };
    });
    res.json({ items, total: countRows[0]?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/maps-shareit/:id', authenticate, isAdmin, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID tidak valid' });
  if (typeof req.body?.verified !== 'boolean') {
    return res.status(400).json({ error: 'Field verified (boolean) wajib.' });
  }
  const verified = req.body.verified;
  try {
    const [rows] = await mysqlPool.query(`SELECT data FROM maps_shareit WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Entri tidak ditemukan' });
    let d = {};
    try {
      d = JSON.parse(rows[0].data || '{}');
    } catch {
      /* ignore */
    }
    if (verified) d.verified = true;
    else delete d.verified;
    const dataStr = JSON.stringify(d);
    await mysqlPool.query(`UPDATE maps_shareit SET data = ? WHERE id = ?`, [dataStr, id]);
    res.json({ ok: true, verified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/maps-shareit/:id', authenticate, isAdmin, async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID tidak valid' });
  try {
    const [r] = await mysqlPool.query(`DELETE FROM maps_shareit WHERE id = ?`, [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Entri tidak ditemukan' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MODULE ROUTES ---
const MODNAME_TO_TABLE = {
  'wa_blaster': 'wa_blaster',
  'getlynk_id': 'getlynk_id',
  'instant_chat': 'instant_chat',
  'wedding_invitation': 'wedding_invitation',
  'timestamp_camera': 'timestamp_camera',
  'maps_shareit': 'maps_shareit'
};

// --- Maps ShareIt (publik: daftar lokasi & geocode; kontribusi via POST modul + login) ---
app.get('/api/maps-shareit/places', async (req, res) => {
  if (!mysqlPool) return res.status(503).json({ error: 'Database unavailable' });
  const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 50, 1), 200);
  const offset = Math.max(parseInt(String(req.query.offset), 10) || 0, 0);
  try {
    const [rows] = await mysqlPool.query(
      `SELECT m.id, m.user_id, m.data, m.updated_at, u.full_name AS contributor_name
       FROM maps_shareit m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.data IS NOT NULL AND TRIM(m.data) != ''
         AND JSON_EXTRACT(m.data, '$.latitude') IS NOT NULL
         AND JSON_EXTRACT(m.data, '$.longitude') IS NOT NULL
       ORDER BY m.updated_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const items = rows.map((r) => {
      let d = {};
      try {
        d = JSON.parse(r.data || '{}');
      } catch {
        /* ignore */
      }
      return {
        id: r.id,
        contributor_name: r.contributor_name || 'Kontributor',
        updated_at: r.updated_at,
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        komentar: d.komentar || '',
        kategori: d.kategori || '',
        addressLabel: d.addressLabel || '',
        verified: d.verified === true
      };
    });
    res.json({ items, limit, offset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/maps-shareit/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'Masukkan minimal 2 karakter.' });
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '10');
    const r = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PWASupperApps/1.0 (maps-shareit geocode)'
      }
    });
    if (!r.ok) return res.status(502).json({ error: 'Layanan pencarian alamat tidak tersedia.' });
    const raw = await r.json();
    const results = (Array.isArray(raw) ? raw : []).map((x) => ({
      lat: parseFloat(x.lat),
      lon: parseFloat(x.lon),
      display_name: x.display_name
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/maps-shareit/reverse', async (req, res) => {
  const lat = parseFloat(String(req.query.lat ?? ''));
  const lon = parseFloat(String(req.query.lon ?? ''));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: 'Koordinat tidak valid.' });
  }
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');
    const r = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PWASupperApps/1.0 (maps-shareit reverse)'
      }
    });
    if (!r.ok) return res.status(502).json({ error: 'Layanan alamat tidak tersedia.' });
    const data = await r.json();
    res.json({ display_name: data.display_name || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Rute OSRM (mesin arah seperti di openstreetmap.org) — proxy untuk hindari CORS. from/to = lat,lon */
app.get('/api/maps-shareit/route', async (req, res) => {
  const from = String(req.query.from || '').trim();
  const to = String(req.query.to || '').trim();
  let profile = String(req.query.profile || 'driving');
  const profiles = { driving: 'driving', walking: 'walking', cycling: 'cycling' };
  if (!profiles[profile]) profile = 'driving';

  const parseLatLon = (s) => {
    const parts = s.split(',').map((x) => parseFloat(String(x).trim()));
    if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
    const [lat, lon] = parts;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat, lon };
  };

  const A = parseLatLon(from);
  const B = parseLatLon(to);
  if (!A || !B) {
    return res.status(400).json({ error: 'Parameter from dan to wajib berformat lat,lon (desimal).' });
  }

  const coordPath = `${A.lon},${A.lat};${B.lon},${B.lat}`;
  const url = `https://router.project-osrm.org/route/v1/${profiles[profile]}/${coordPath}?overview=full&geometries=geojson&steps=true&alternatives=false`;

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'PWASupperApps/1.0 (maps-shareit route; contact: app owner)' }
    });
    const json = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: 'Layanan rute OSRM tidak tersedia.' });
    }
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    if (req.params.module === 'maps_shareit') {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Login diperlukan untuk berbagi lokasi.' });
      }
      const d = finalData || data || {};
      const lat = Number(d.latitude);
      const lng = Number(d.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: 'Koordinat lokasi tidak valid.' });
      }
      if (!String(d.komentar || '').trim()) {
        return res.status(400).json({ error: 'Komentar wajib diisi.' });
      }
      const allowedKat = new Set(['Tempat Makan', 'Cafe', 'Hiburan']);
      const katRaw = String(d.kategori || '').trim();
      if (!allowedKat.has(katRaw)) {
        return res.status(400).json({ error: 'Pilih kategori: Tempat Makan, Cafe, atau Hiburan.' });
      }
      let keepVerified = false;
      if (id) {
        const [exRows] = await mysqlPool.query(
          `SELECT data FROM maps_shareit WHERE id = ? AND (user_id = ? OR is_guest = 1)`,
          [id, req.user.id]
        );
        if (exRows.length) {
          try {
            const ex = JSON.parse(exRows[0].data || '{}');
            if (ex.verified === true) keepVerified = true;
          } catch {
            /* ignore */
          }
        }
      }
      finalData = {
        type: 'place_share',
        latitude: lat,
        longitude: lng,
        kategori: katRaw,
        komentar: String(d.komentar).trim(),
        addressLabel: d.addressLabel ? String(d.addressLabel).trim().slice(0, 500) : undefined,
        createdAt: d.createdAt || new Date().toISOString(),
        ...(keepVerified ? { verified: true } : {})
      };
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
    let query, params;
    if (tableName === 'instant_chat') {
      // Allow deletion if requester is sender OR recipient
      query = `DELETE FROM ${tableName} WHERE id = ? AND (user_id = ? OR JSON_UNQUOTE(JSON_EXTRACT(data, '$.to')) = ?)`;
      params = [req.params.id, req.user.id, req.user.email];
    } else {
      query = `DELETE FROM ${tableName} WHERE id = ? AND (user_id = ? OR is_guest = 1)`;
      params = [req.params.id, req.user.id];
    }
    await mysqlPool.query(query, params);
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

  // 3.5. Periodic cleanup of idle sessions (30 minutes)
  setInterval(async () => {
    try {
      const [res] = await mysqlPool.query(`DELETE FROM sessions_id WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 MINUTE)`);
      if (res.affectedRows > 0) {
        console.log(`🧹 Periodic cleanup: Removed ${res.affectedRows} idle sessions.`);
      }
    } catch (err) {
      console.error('Cleanup Error:', err);
    }
  }, 5 * 60 * 1000);

  // 4. Start Server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('💥 Critical startup failure:', err);
  process.exit(1);
});
