import { reactive } from 'vue';

// --- AUTH STATE ---
export const authState = reactive({
  user: JSON.parse(localStorage.getItem('pwa_user')) || null,
  sessionId: localStorage.getItem('pwa_session_id') || null,
  isGuest: localStorage.getItem('pwa_is_guest') === 'true' || false,
});

export const setAuth = (user, sessionId, isGuest = false) => {
  authState.user = user;
  authState.sessionId = sessionId;
  authState.isGuest = isGuest;
  
  if (user) {
    localStorage.setItem('pwa_user', JSON.stringify(user));
    localStorage.setItem('pwa_last_activity', Date.now().toString());
  } else {
    localStorage.clear(); // Clear all localStorage as requested
  }
  
  if (sessionId) localStorage.setItem('pwa_session_id', sessionId);
  else localStorage.removeItem('pwa_session_id');
  
  localStorage.setItem('pwa_is_guest', String(isGuest));
};

// --- SYNC STATUS (MOCKED FOR COMPATIBILITY) ---
export const syncStatus = reactive({
  activeCount: 0,
  lastSync: new Date().toISOString(),
  error: null
});

// --- API WRAPPER ---
export const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authState.sessionId ? { 'Authorization': authState.sessionId } : {}),
    ...(options.headers || {})
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      // Don't redirect if we are already on login or guest-friendly pages
      const p = window.location.pathname;
      if (!p.includes('/login') && !p.includes('/timestamp-camera') && !p.includes('/maps-shareit')) {
        setAuth(null, null);
        window.location.href = '/login';
      }
    }
    return response;
  } catch (err) {
    console.error('API Fetch Error:', err);
    throw err;
  }
};

// --- MODULE HELPERS ---
export async function getModuleData(moduleName) {
  const res = await apiFetch(`/api/modules/${moduleName}`);
  return await res.json();
}

export async function saveModuleData(moduleName, data, id = null) {
  const res = await apiFetch(`/api/modules/${moduleName}`, {
    method: 'POST',
    body: JSON.stringify({ data, id })
  });
  return await res.json();
}

// --- Instant Chat: read cursor (local) + unread count ---
const CHAT_READ_STORAGE = (userId) => `pwa_instant_chat_read:${userId}`;
const CHAT_READ_MIGRATED = (userId) => `pwa_instant_chat_read_mig:${userId}`;

function readChatReadMap(userId) {
  if (!userId) return {};
  try {
    return JSON.parse(localStorage.getItem(CHAT_READ_STORAGE(userId)) || '{}');
  } catch {
    return {};
  }
}

function writeChatReadMap(userId, map) {
  if (!userId) return;
  localStorage.setItem(CHAT_READ_STORAGE(userId), JSON.stringify(map));
}

/** Sekali per user: anggap semua DM yang sudah ada sampai pesan terakhir = sudah dibaca (unread mulai dari pesan baru setelah deploy). */
export function migrateInstantChatReadMapOnce(rows, myEmail, userId) {
  if (!userId || !myEmail || !Array.isArray(rows)) return;
  if (localStorage.getItem(CHAT_READ_MIGRATED(userId)) === '1') return;
  const m = readChatReadMap(userId);
  const perPeer = {};
  for (const r of rows) {
    const d = r?.data;
    if (!d || d.type !== 'chat_msg') continue;
    const other = d.from === myEmail ? d.to : d.from;
    if (!other) continue;
    const t = Number(d.timestamp) || 0;
    if (!perPeer[other] || t > perPeer[other]) perPeer[other] = t;
  }
  for (const [peer, t] of Object.entries(perPeer)) {
    const cur = m[peer];
    m[peer] = cur == null ? t : Math.max(Number(cur) || 0, t);
  }
  writeChatReadMap(userId, m);
  localStorage.setItem(CHAT_READ_MIGRATED(userId), '1');
}

/**
 * Jumlah pesan chat_msg masuk (from lain → ke email saya) dengan timestamp > cursor baca per lawan bicara.
 */
export function countInstantChatUnread(rows, myEmail, userId) {
  if (!myEmail || !userId || !Array.isArray(rows)) return 0;
  migrateInstantChatReadMapOnce(rows, myEmail, userId);
  const m = readChatReadMap(userId);
  let n = 0;
  for (const r of rows) {
    const d = r?.data;
    if (!d || d.type !== 'chat_msg') continue;
    if (d.isCallLog) continue;
    if (d.to !== myEmail || d.from === myEmail) continue;
    const peer = d.from;
    const t = Number(d.timestamp) || 0;
    const last = Number(m[peer]) || 0;
    if (t > last) n++;
  }
  return n;
}

/** Tandai percakapan dengan peer sampai timestamp ts (ms) sudah dibaca. */
export function setChatReadCursor(userId, peerEmail, timestamp) {
  if (!userId || !peerEmail) return;
  const ts = Number(timestamp) || 0;
  if (!ts) return;
  const m = readChatReadMap(userId);
  const prev = Number(m[peerEmail]) || 0;
  if (ts >= prev) {
    m[peerEmail] = ts;
    writeChatReadMap(userId, m);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pwa-instant-chat-read-updated'));
    }
  }
}

// --- WHATSAPP HELPERS (RE-IMPLEMENTED) ---
export async function getConnectionDoc() {
  try {
    const res = await apiFetch('/api/whatsapp/status');
    const data = await res.json();
    return data;
  } catch (e) { return null; }
}

// Polling interval for status updates
export function onConnectionChange(callback) {
    const interval = setInterval(async () => {
        const doc = await getConnectionDoc();
        if (doc) callback(doc);
    }, 5000);
    return () => clearInterval(interval);
}

// --- MODULE SPECIFIC HELPERS ---

// 1. Timestamp Camera
export async function saveTimestampCapture(data) {
  return await saveModuleData('timestamp_camera', data);
}

export async function getTimestampCaptures() {
  const result = await getModuleData('timestamp_camera');
  return result.map(r => ({ _id: r.id, ...r.data, timestamp: r.data.timestamp || r.updated_at }));
}

// 2. WA Blaster (Outbox & Contacts)
export async function addOutbox(phone, message) {
    const data = { type: 'outbox', phone, message, status: 'pending', createdAt: new Date().toISOString() };
    return await saveModuleData('wa_blaster', data);
}

export async function getOutboxDocs() {
    const result = await getModuleData('wa_blaster');
    return result.filter(r => r.data.type === 'outbox').map(r => ({ _id: r.id, ...r.data }));
}

export async function removeOutbox(id) {
    if (!id) return;
    return await apiFetch(`/api/modules/wa_blaster/${id}`, { method: 'DELETE' });
}

export async function getContacts() {
    const result = await getModuleData('wa_blaster');
    const contactDoc = result.find(r => r.data.type === 'contacts');
    return contactDoc ? contactDoc.data.list : [];
}

export async function saveContacts(list) {
    // Find existing contacts doc id
    const result = await getModuleData('wa_blaster');
    const contactDoc = result.find(r => r.data.type === 'contacts');
    return await saveModuleData('wa_blaster', { type: 'contacts', list }, contactDoc?.id);
}

// Mocking some PouchDB functions for compatibility during transition
export const db = {
  get: async (id) => {
    console.warn(`Direct db.get('${id}') called. Please migrate to getModuleData.`);
    return null;
  },
  put: async (doc) => {
    console.warn(`Direct db.put() called. Please migrate to saveModuleData.`);
    return { ok: true };
  }
};

export function onDbChange(callback) {
    // Simple mock: trigger once
    setTimeout(callback, 500);
    return () => {};
}

// --- LEGACY COMPATIBILITY EXPORTS ---
export const CHAT_DB_NAME = 'instant_chat';
export const INSTANT_CHAT_DB_NAME = 'instant_chat';
export const GETLYNK_DB_NAME = 'getlynk_id';
export const WEDDING_DB_NAME = 'wedding_invitation';
export const TIMESTAMP_DB_NAME = 'timestamp_camera';
export const DB_NAME_VAL = 'wa_blaster';

export function syncModule() { /* No-op */ }
export function startSync() { /* No-op */ }




