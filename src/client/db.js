import PouchDB from 'pouchdb-browser';
import { reactive } from 'vue';

export const syncStatus = reactive({
  activeCount: 0,
  lastSync: localStorage.getItem('pwa_last_sync') || null,
  error: null
});

const updateSyncStatus = (delta) => {
  syncStatus.activeCount = Math.max(0, syncStatus.activeCount + delta);
  if (delta < 0 && syncStatus.activeCount === 0) {
    syncStatus.lastSync = new Date().toISOString();
    localStorage.setItem('pwa_last_sync', syncStatus.lastSync);
  }
};

const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session') || 'main';
const DB_NAME = sessionId === 'main' 
  ? (import.meta.env.VITE_DB_NAME || 'wa_database')
  : `wa_database_${sessionId}`;

export const CHAT_DB_NAME = 'chat_messages';
export const CHAT_USERS_DB_NAME = 'chat_users';
export const ONLINE_CHAT_DB_NAME = 'is_online_chat';
export const ONLINE_GENERAL_DB_NAME = 'is_online_general';
export const VERSION_DB_NAME = 'pwa_version';
export const GETLYNK_DB_NAME = 'getlynkid_data';
export const GETLYNK_USERS_DB_NAME = 'getlynkid_users';
export const WEDDING_DB_NAME = 'wedding_invitation';
export const WEDDING_USERS_DB_NAME = 'wedding_users';
export const TIMESTAMP_DB_NAME = 'timestamp_camera';

export const db = new PouchDB(DB_NAME);

const REMOTE = `/db/${DB_NAME}`;
console.log(`PouchDB [${sessionId}] Sync Target:`, REMOTE);


let syncHandler = null;

/**
 * Sinkronisasi dengan server PouchDB.
 * Data disimpan di IndexedDB (browser) dan sync ke server.
 */
export function startSync() {
  if (syncHandler) return syncHandler;
  syncHandler = db.sync(REMOTE, { live: true, retry: true });
  syncHandler.on('active', () => updateSyncStatus(1))
            .on('paused', () => updateSyncStatus(-1))
            .on('error', (err) => { syncStatus.error = err.message; updateSyncStatus(-1); });
  return syncHandler;
}

/**
 * Generic sync helper for any DB name
 */
export function syncModule(dbInstance, dbName) {
  const remote = new PouchDB(`${location.origin}/db/${dbName}`);
  const handler = dbInstance.sync(remote, { live: true, retry: true });
  handler.on('active', () => updateSyncStatus(1))
         .on('paused', () => updateSyncStatus(-1))
         .on('error', (err) => { syncStatus.error = err.message; updateSyncStatus(-1); });
  return handler;
}

/**
 * Tambah dokumen outbox (akan diproses worker dengan jeda 10–15 detik).
 */
export async function addOutbox(phone, message) {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session') || 'main'; // Use URL session or default to main
  
  const doc = {
    _id: `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: 'outbox',
    status: 'pending',
    phone: String(phone).replace(/\D/g, ''),
    message: String(message),
    sessionId,
    createdAt: new Date().toISOString(),
  };
  const result = await db.put(doc);
  return { ...doc, _rev: result.rev };
}


/**
 * Hapus dokumen outbox (riwayat).
 */
export async function removeOutbox(doc) {
  if (!doc._id || !doc._rev) throw new Error('Doc needs _id and _rev');
  await db.remove(doc);
}

/**
 * Ambil semua dokumen outbox untuk riwayat.
 */
export async function getOutboxDocs() {
  const res = await db.allDocs({
    include_docs: true,
    startkey: 'outbox_',
    endkey: 'outbox_\uffff',
  });
  return res.rows
    .map((r) => r.doc)
    .filter((d) => d && d.type === 'outbox')
    .sort((a, b) => (b.createdAt || b._id).localeCompare(a.createdAt || a._id));
}

/**
 * Subscribe perubahan real-time (untuk tabel riwayat).
 */
export function onDbChange(callback) {
  return db
    .changes({
      live: true,
      since: 'now',
      include_docs: true,
      filter: (doc) => doc.type === 'outbox',
    })
    .on('change', callback)
    .on('error', (err) => console.error('db.changes error:', err));
}

/**
 * Ambil dokumen status koneksi WhatsApp (synced dari server).
 */
export async function getConnectionDoc() {
  try {
    return await db.get('connection');
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

const CONTACTS_DOC_ID = 'contacts';

/**
 * Ambil daftar kontak (untuk Kirim Bulk).
 */
export async function getContacts() {
  try {
    const doc = await db.get(CONTACTS_DOC_ID);
    return Array.isArray(doc?.list) ? doc.list : [];
  } catch (e) {
    if (e.status === 404) return [];
    throw e;
  }
}

/**
 * Simpan daftar kontak (array of { id, name, phone }).
 */
export async function saveContacts(list) {
  let doc;
  try {
    doc = await db.get(CONTACTS_DOC_ID);
  } catch (e) {
    if (e.status !== 404) throw e;
    doc = { _id: CONTACTS_DOC_ID };
  }
  doc.type = 'contacts';
  doc.list = list;
  doc.updatedAt = new Date().toISOString();
  await db.put(doc);
}

/**
 * Subscribe perubahan doc 'connection' untuk QR/status.
 */
export function onConnectionChange(callback) {
  return db
    .changes({
      live: true,
      include_docs: true,
      filter: (doc) => doc._id === 'connection',
    })
    .on('change', (ch) => callback(ch.doc))
    .on('error', (err) => console.error('connection changes error:', err));
}

/**
 * Simpan hasil foto Timestamp Camera ke database.
 * @param {Object} data 
 */
export async function saveTimestampCapture(data) {
  const localDb = new PouchDB(TIMESTAMP_DB_NAME);
  const doc = {
    _id: `ts_${Date.now()}`,
    type: 'timestamp_capture',
    ...data,
    createdAt: new Date().toISOString()
  };
  
  // Sync as well
  syncModule(localDb, TIMESTAMP_DB_NAME);
  
  return await localDb.put(doc);
}

export async function getTimestampCaptures() {
  const localDb = new PouchDB(TIMESTAMP_DB_NAME);
  try {
    const res = await localDb.allDocs({
      include_docs: true,
      startkey: 'ts_',
      endkey: 'ts_\uffff',
    });
    return res.rows
      .map(r => r.doc)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (e) {
    return [];
  }
}


