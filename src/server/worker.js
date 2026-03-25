import { getSocket, sendWhatsAppMessage } from './baileys.js';

const JITTER_MIN = 2 * 1000;
const JITTER_MAX = 5 * 1000;

function randomDelay() {
  return Math.floor(Math.random() * (JITTER_MAX - JITTER_MIN + 1)) + JITTER_MIN;
}

function formatJid(number) {
  const cleaned = String(number).replace(/\D/g, '');
  if (!cleaned.endsWith('@s.whatsapp.net')) return cleaned + '@s.whatsapp.net';
  return cleaned;
}

/**
 * Optimized worker for MySQL.
 * Polls the wa_blaster table for pending messages.
 */
export async function startWorker(mysqlPool) {
  console.log('🚀 Global WhatsApp Outbox Worker started...');
  
  // Single recursive loop to avoid overlapping pools if processing takes long
  const processNext = async () => {
    try {
      const [rows] = await mysqlPool.query(
        "SELECT id, user_id, data FROM wa_blaster WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) = 'outbox' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.status')) = 'pending' ORDER BY id ASC LIMIT 1"
      );

      if (rows.length > 0) {
        const { id, user_id, data } = rows[0];
        const sessionId = data.sessionId || 'main'; // Should be unique per whatsapp account
        
        // 1. Mark as processing
        const processingData = { ...data, status: 'processing' };
        await mysqlPool.query("UPDATE wa_blaster SET data = ? WHERE id = ?", [JSON.stringify(processingData), id]);

        try {
          const jid = formatJid(data.phone);
          const text = data.message || '';

          // Wait before sending (anti-spam)
          await new Promise(r => setTimeout(r, randomDelay()));

          await sendWhatsAppMessage(jid, text, user_id, sessionId);

          // 2. Mark as sent
          const sentData = { ...data, status: 'sent', sentAt: new Date().toISOString() };
          await mysqlPool.query("UPDATE wa_blaster SET data = ? WHERE id = ?", [JSON.stringify(sentData), id]);
          console.log(`✅ [Worker] Sent to ${data.phone} for user ${user_id}`);
        } catch (err) {
          console.error(`❌ [Worker] Send error for ID ${id}:`, err.message);
          const failedData = { ...data, status: 'failed', error: err.message, updatedAt: new Date().toISOString() };
          await mysqlPool.query("UPDATE wa_blaster SET data = ? WHERE id = ?", [JSON.stringify(failedData), id]);
        }
      }
    } catch (err) {
      console.error('❌ [Worker] Critical loop error:', err);
    }
    
    // Schedule next run
    setTimeout(processNext, 3000);
  };

  processNext();
}


