import mysql from 'mysql2/promise';
import PouchDB from 'pouchdb';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const host = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1');
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASS || '';
  const database = process.env.MYSQL_DB || 'pwa-super-apps';
  const table = 'pwa_data';

  console.log(`🚀 Memulai Migrasi ke MySQL (Direct Bridge Mode)...`);

  try {
    let connection = await mysql.createConnection({ host, user, password });
    
    // Tingkatkan limit paket data (Penting untuk data JSON besar/gambar base64)
    try {
      await connection.query(`SET GLOBAL max_allowed_packet=67108864`);
      console.log(`✅ MySQL Global limit ditingkatkan ke 64MB.`);
      // Tutup dan buka kembali koneksi agar perubahan global terasa (beberapa versi butuh ini)
      await connection.end();
      connection = await mysql.createConnection({ host, user, password });
    } catch (e) {
      console.warn(`⚠️ Gagal mengubah limit global (kurang izin atau variabel read-only).`);
      console.warn(`Jika data mengandung gambar/file besar, migrasi mungkin gagal. Silakan jalankan 'SET GLOBAL max_allowed_packet=67108864' di console MySQL Anda.`);
    }

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);
    // Kita drop agar schema baru (composite key) diterapkan
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    await connection.query(`CREATE TABLE IF NOT EXISTS \`${table}\` (
      id VARCHAR(255) NOT NULL,
      source_db VARCHAR(100) NOT NULL,
      type VARCHAR(100),
      data LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id, source_db)
    )`);
    console.log(`✅ Tabel \`${table}\` di database \`${database}\` siap.`);

    const dbPath = path.resolve(__dirname, process.env.DATABASE_DIR || './database');
    const sourceDb = new (PouchDB.defaults({ prefix: dbPath + path.sep }))(process.env.DB_NAME || 'wa_database');

    let totalDocs = 0;
    // Migrasi Seluruh DB
    const allDbs = [process.env.DB_NAME || 'wa_database', 'chat_messages', 'chat_users', 'getlynkid_data', 'getlynkid_users', 'wedding_invitation', 'wedding_users'];
    for (const dbName of allDbs) {
      if (fs.existsSync(path.join(dbPath, dbName))) {
        console.log(`🔄 Mengambil data dari PouchDB \`${dbName}\`...`);
        const s = new (PouchDB.defaults({ prefix: dbPath + path.sep }))(dbName);
        const docs = await s.allDocs({ include_docs: true });
        
        let subCount = 0;
        for (const row of docs.rows) {
          if (row.doc && !row.id.startsWith('_design/')) {
            const doc = row.doc;
            await connection.query(
              `INSERT INTO \`${table}\` (id, source_db, type, data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, type = ?`,
              [doc._id, dbName, doc.type || 'unknown', JSON.stringify(doc), JSON.stringify(doc), doc.type || 'unknown']
            );
            subCount++;
            totalDocs++;
          }
        }
        console.log(`✅ ${dbName} Selesai (${subCount} dokumen).`);
      }
    }

    await connection.end();
    console.log(`✅ Migrasi Sukses! Total ${totalDocs} dokumen berhasil dipindahkan.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Gagal Migrasi:`, err.message);
    process.exit(1);
  }
}

runMigration();
