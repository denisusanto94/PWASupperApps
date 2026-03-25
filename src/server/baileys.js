import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.resolve(__dirname, '..', '..', process.env.SESSIONS_DIR || './sessions');

const sessions = new Map();
const CONNECTION_DOC_ID = 'connection';

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function getSessionPath(userId, sessionId = 'main') {
  return path.join(SESSIONS_DIR, `user_${userId}`, sessionId);
}

function getSessionKey(userId, sessionId = 'main') {
  return `u${userId}_s${sessionId}`;
}

/**
 * Refactored status updater using MySQL.
 * We'll use the 'wa_blaster' table, filtering by user_id and session_id in data.
 */
async function updateConnectionDoc(mysqlPool, userId, sessionId, update) {
    if (!mysqlPool) {
        console.warn(`[${sessionId}] updateConnectionDoc: mysqlPool is NULL`);
        return;
    }
    console.log(`[${sessionId}] Updating status for user ${userId} to ${update.status}`);
    try {
        // Find existing connection doc
        const [rows] = await mysqlPool.query(
            "SELECT id, data FROM wa_blaster WHERE user_id = ? AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) = 'connection' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.sessionId')) = ?",
            [userId, sessionId]
        );

        let doc = rows.length > 0 ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) : { type: 'connection', sessionId, status: 'disconnected' };
        
        // --- Hierarchy check ---
        const rank = { 'connected': 3, 'qr': 2, 'connecting': 1, 'disconnected': 0 };
        const currentRank = rank[doc.status || 'disconnected'] || 0;
        const updateRank = rank[update.status] || 0;
        
        if (update.status === 'connecting' && currentRank >= 2) {
           return;
        }

        const nextDoc = { ...doc, ...update };
        nextDoc.updatedAt = new Date().toISOString();

        if (update.status === 'connecting') {
          nextDoc.qr = undefined;
          nextDoc.qrAttemptsEnded = undefined;
          nextDoc.reason = undefined;
        } else if (update.status === 'qr') {
          nextDoc.qrAttemptsEnded = undefined;
          nextDoc.reason = undefined;
        } else if (update.status === 'connected') {
          nextDoc.qr = undefined;
          nextDoc.qrAttemptsEnded = undefined;
          nextDoc.reason = undefined;
        } else if (update.status === 'disconnected') {
          nextDoc.qr = undefined;
        }

        const jsonData = JSON.stringify(nextDoc);
        if (rows.length > 0) {
            await mysqlPool.query("UPDATE wa_blaster SET data = ? WHERE id = ?", [jsonData, rows[0].id]);
        } else {
            await mysqlPool.query("INSERT INTO wa_blaster (user_id, data) VALUES (?, ?)", [userId, jsonData]);
        }
    } catch (err) {
        console.error(`❌ [${sessionId}] updateConnectionDoc error:`, err);
    }
}

export async function startBaileys(mysqlPool, userId, sessionId = 'main') {
  const sessionKey = getSessionKey(userId, sessionId);
  if (sessions.has(sessionKey)) {
    return sessions.get(sessionKey);
  }

  ensureSessionsDir();
  const sessionPath = getSessionPath(userId, sessionId);
  console.log(`[${sessionId}] Session path: ${sessionPath}`);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }
  console.log(`[${sessionId}] Starting fresh WhatsApp handshake...`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  
  let version = [2, 3000, 1015901307];
  try {
     const v = await fetchLatestBaileysVersion();
     version = v.version;
     console.log(`[${sessionId}] Current WA Version: ${version.join('.')}`);
  } catch(e) {
     console.warn(`[${sessionId}] Using fallback version due to fetch error.`);
  }

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, undefined),
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0, 
    keepAliveIntervalMs: 10000,
    version,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (ev) => {
    try {
      if (ev.qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(ev.qr, { width: 280, margin: 1 });
          await updateConnectionDoc(mysqlPool, userId, sessionId, { status: 'qr', qr: qrDataUrl });
        } catch (e) {
          await updateConnectionDoc(mysqlPool, userId, sessionId, { status: 'qr', qr: ev.qr });
        }
      }
      if (ev.connection === 'open') {
        await updateConnectionDoc(mysqlPool, userId, sessionId, { status: 'connected', qr: undefined });
      }
      if (ev.connection === 'close') {
        const reason = ev.lastDisconnect?.error?.message || 'closed';
        const qrAttemptsEnded = /QR refs attempts ended|QR refs? attempts? ended/i.test(reason);
        await updateConnectionDoc(mysqlPool, userId, sessionId, {
          status: 'disconnected',
          qr: undefined,
          reason,
          qrAttemptsEnded: qrAttemptsEnded || undefined,
        });
      }
    } catch (err) {
      console.error(`⚠️ Connection update error [${sessionId}]:`, err.message);
    }
  });

  sessions.set(sessionKey, sock);
  if (sessionId === 'main') global.waSocket = sock;
  
  await updateConnectionDoc(mysqlPool, userId, sessionId, { status: 'connecting', qr: undefined });
  return sock;
}

export function getSocket(userId, sessionId = 'main') {
  const sessionKey = getSessionKey(userId, sessionId);
  return sessions.get(sessionKey) || (sessionId === 'main' ? global.waSocket : null);
}

export async function restartConnection(mysqlPool, userId, sessionId = 'main') {
  const sessionKey = getSessionKey(userId, sessionId);
  const old = sessions.get(sessionKey);
  if (old?.ws?.close) {
    try {
      await old.ws.close();
    } catch (e) {}
  }
  sessions.delete(sessionKey);
  if (sessionId === 'main') global.waSocket = null;
  return startBaileys(mysqlPool, userId, sessionId);
}

export async function sendWhatsAppMessage(jid, text, userId, sessionId = 'main') {
  const sock = getSocket(userId, sessionId);
  if (!sock) throw new Error(`WhatsApp [${sessionId}] belum terhubung untuk user ${userId}`);
  await sock.sendMessage(jid, { text });
}


