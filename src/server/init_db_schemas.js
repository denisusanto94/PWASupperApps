import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import path from 'path';
import { fileURLToPath } from 'url';

PouchDB.plugin(PouchDBFind);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_NAMES = ['wa_database', 'chat_messages', 'chat_users', 'getlynkid_data', 'getlynkid_users', 'wedding_invitation', 'wedding_users'];

export async function initDbMigrations(dbPath) {
  console.log('--- Memulai Inisialisasi Database (NoSQL Migration) ---');

  for (const name of DB_NAMES) {
    // Prefix path sesuai folder database server
    const db = new PouchDB(path.join(dbPath, name));
    
    try {
      // 1. BUAT INDEX DASAR
      await db.createIndex({
        index: { fields: ['type'] }
      });

      // 2. INDEX KHUSUS TIAP MENU
      if (name === 'wa_database') {
        await db.createIndex({ index: { fields: ['status', 'createdAt'] } });
      }

      if (name === 'chat_messages') {
        await db.createIndex({ index: { fields: ['from', 'to', 'timestamp'] } });
      }

      if (name === 'getlynkid_data' || name === 'wedding_invitation') {
        await db.createIndex({ index: { fields: ['slug'] } });
      }

      // 3. SEEDING AWAL (Optional)
      const info = await db.info();
      if (info.doc_count === 0 && name === 'wa_database') {
        await db.put({
          _id: 'settings_config',
          type: 'config',
          app_name: 'PWASupperApps',
          delay_min: 10,
          delay_max: 15
        });
      }

      console.log(`- DB ${name}: OK.`);
    } catch (err) {
      console.warn(`Peringatan DB ${name}:`, err.message);
    }
  }

  console.log('--- Inisialisasi Selesai! ---');
}
