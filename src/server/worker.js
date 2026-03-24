import { getSocket, sendWhatsAppMessage } from './baileys.js';

const JITTER_MIN = 10 * 1000;
const JITTER_MAX = 15 * 1000;
const activeWorkers = new Set();

function randomDelay() {
  return Math.floor(Math.random() * (JITTER_MAX - JITTER_MIN + 1)) + JITTER_MIN;
}

function formatJid(number) {
  const cleaned = String(number).replace(/\D/g, '');
  if (cleaned.endsWith('@s.whatsapp.net')) return cleaned;
  return cleaned + '@s.whatsapp.net';
}

export async function startWorker(db, sessionId = 'main') {
  if (activeWorkers.has(sessionId)) return;
  activeWorkers.add(sessionId);

  const sock = getSocket(sessionId);
  if (!sock) {
    console.warn(`Worker [${sessionId}]: Baileys belum siap, perubahan outbox akan diproses setelah koneksi.`);
  }


  const changeHandler = async (change) => {
    if (change.deleted) return;
    try {
      const doc = await db.get(change.id);
      if (doc.type !== 'outbox' || doc.status !== 'pending') return;

      const sessionId = doc.sessionId || 'main';
      const jid = formatJid(doc.phone);
      const text = doc.message || '';

      await new Promise((r) => setTimeout(r, randomDelay()));

      await sendWhatsAppMessage(jid, text, sessionId);
      await db.put({
        ...doc,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Worker send error:', err);

      try {
        const doc = await db.get(change.id);
        if (doc.type === 'outbox' && doc.status === 'pending') {
          await db.put({
            ...doc,
            status: 'failed',
            error: err.message || String(err),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Worker failed to update doc:', e);
      }
    }
  };

  db.changes({
    live: true,
    since: 'now',
    filter: (doc) => doc.type === 'outbox' && doc.status === 'pending',
  })
    .on('change', (change) => changeHandler(change))
    .on('error', (err) => console.error('Worker changes error:', err));

  console.log(`Worker [${sessionId}]: mendengarkan outbox (type=outbox, status=pending)`);
}

