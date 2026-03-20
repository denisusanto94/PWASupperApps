import PouchDB from 'pouchdb-browser';

const DB_NAME = import.meta.env.VITE_DB_NAME || 'wa_database';
export const CHAT_DB_NAME = 'chat_messages';
export const CHAT_USERS_DB_NAME = 'chat_users';
export const GETLYNK_DB_NAME = 'getlynkid_data';
export const GETLYNK_USERS_DB_NAME = 'getlynkid_users';
export const WEDDING_DB_NAME = 'wedding_invitation';
export const WEDDING_USERS_DB_NAME = 'wedding_users';

const REMOTE = `/db/${DB_NAME}`;
console.log('PouchDB Sync Target:', REMOTE);

export const db = new PouchDB(DB_NAME);

let syncHandler = null;

/**
 * Sinkronisasi dengan server PouchDB.
 * Data disimpan di IndexedDB (browser) dan sync ke server.
 */
export function startSync() {
  if (syncHandler) return syncHandler;
  syncHandler = db.sync(REMOTE, {
    live: true,
    retry: true,
  });
  return syncHandler;
}

/**
 * Generic sync helper for any DB name
 */
export function syncModule(dbInstance, dbName) {
  const remote = new PouchDB(`${location.origin}/db/${dbName}`);
  return dbInstance.sync(remote, {
    live: true,
    retry: true,
  });
}

/**
 * Tambah dokumen outbox (akan diproses worker dengan jeda 10–15 detik).
 */
export async function addOutbox(phone, message) {
  const doc = {
    _id: `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: 'outbox',
    status: 'pending',
    phone: String(phone).replace(/\D/g, ''),
    message: String(message),
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
      since: 'now',
      include_docs: true,
      filter: (doc) => doc._id === 'connection',
    })
    .on('change', (ch) => callback(ch.doc))
    .on('error', (err) => console.error('connection changes error:', err));
}
