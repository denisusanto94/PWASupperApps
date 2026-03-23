import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.resolve(__dirname, '..', '..', process.env.SESSIONS_DIR || './sessions');

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

const CONNECTION_DOC_ID = 'connection';

export async function startBaileys(db) {
  ensureSessionsDir();
  const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
  let version;
  try {
    const v = await fetchLatestBaileysVersion();
    version = v.version;
  } catch (err) {
    console.error('⚠️ Gagal mengambil versi Baileys terbaru, menggunakan default:', err.message);
    version = [2, 3000, 1015901307]; // Fallback version
  }

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, undefined),
    },
  });

  async function updateConnectionDoc(update) {
    let success = false;
    let attempts = 0;
    while (!success && attempts < 5) {
      attempts++;
      try {
        let doc;
        try {
          doc = await db.get(CONNECTION_DOC_ID);
        } catch (e) {
          if (e.status !== 404) throw e;
          doc = { _id: CONNECTION_DOC_ID };
        }

        // --- Pencegahan Overwrite Status Lebih Tinggi oleh Status Lebih Rendah (Race Condition) ---
        // Hirarki status: connected > qr > connecting
        const rank = { 'connected': 3, 'qr': 2, 'connecting': 1, 'disconnected': 0 };
        const currentRank = rank[doc.status || 'disconnected'] || 0;
        const updateRank = rank[update.status] || 0;
        
        // Jangan biarkan 'connecting' menimpa status yang sudah 'qr' atau 'connected'
        if (update.status === 'connecting' && currentRank >= 2) {
           success = true; // Anggap saja berhasil, tapi tidak menimpa
           break;
        }

        // --- Properti yang harus dibersihkan per status agar tidak "stale" ---
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

        await db.put(nextDoc);
        success = true;
      } catch (err) {
        if (err.status === 409) continue;
        console.error('updateConnectionDoc error:', err);
        break;
      }
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (ev) => {
    if (ev.qr) {
      try {
        const qrDataUrl = await QRCode.toDataURL(ev.qr, { width: 280, margin: 1 });
        await updateConnectionDoc({ status: 'qr', qr: qrDataUrl });
      } catch (e) {
        await updateConnectionDoc({ status: 'qr', qr: ev.qr });
      }
    }
    if (ev.connection === 'open') {
      await updateConnectionDoc({ status: 'connected', qr: undefined });
    }
    if (ev.connection === 'close') {
      const reason = ev.lastDisconnect?.error?.message || 'closed';
      const qrAttemptsEnded = /QR refs attempts ended|QR refs? attempts? ended/i.test(reason);
      await updateConnectionDoc({
        status: 'disconnected',
        qr: undefined,
        reason,
        qrAttemptsEnded: qrAttemptsEnded || undefined,
      });
    }
  });

  // Simpan referensi socket agar worker bisa pakai
  global.waSocket = sock;
  await updateConnectionDoc({ status: 'connecting', qr: undefined });
  return sock;
}

export function getSocket() {
  return global.waSocket;
}

/**
 * Tutup socket lama dan buat koneksi baru (untuk dapat QR baru setelah "QR refs attempts ended").
 */
export async function restartConnection(db) {
  const old = global.waSocket;
  if (old?.ws?.close) {
    try {
      await old.ws.close();
    } catch (e) {
      console.warn('restartConnection: close old socket', e?.message);
    }
  }
  global.waSocket = null;
  return startBaileys(db);
}

export async function sendWhatsAppMessage(jid, text) {
  const sock = getSocket();
  if (!sock) throw new Error('WhatsApp belum terhubung');
  await sock.sendMessage(jid, { text });
}
