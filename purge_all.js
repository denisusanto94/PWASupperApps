
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB
};

async function purge() {
  console.log('--- 🛡️ PERINGATAN: Memulai Purge Data Penuh 🛡️ ---');
  
  // 1. Clear Sessions (WhatsApp)
  const sessionsPath = path.resolve('sessions');
  if (fs.existsSync(sessionsPath)) {
      console.log('🗑️ Menghapus folder [sessions]...');
      fs.rmSync(sessionsPath, { recursive: true, force: true });
      fs.mkdirSync(sessionsPath);
      console.log('✅ Folder [sessions] dibersihkan.');
  }

  // 2. Clear Local PouchDB Files (Server side)
  const dbPath = path.resolve('database');
  if (fs.existsSync(dbPath)) {
      console.log('🗑️ Menghapus folder [database] PouchDB...');
      fs.rmSync(dbPath, { recursive: true, force: true });
      fs.mkdirSync(dbPath);
      console.log('✅ Folder [database] dibersihkan.');
  }

  // 3. Clear MySQL Tables
  if (config.host && config.user && config.database) {
      console.log(`🔌 Menghubungkan ke MySQL [${config.database}]...`);
      try {
          const connection = await mysql.createConnection({
              host: config.host,
              port: config.port,
              user: config.user,
              password: config.password,
              database: config.database
          });

          const tablesToDrop = [
              'pwa_data',
              'is_online_chat',
              'is_online_general',
              'pwa_version',
              'users_chat'
          ];

          console.log(`🗑️ Menghapus ${tablesToDrop.length} tabel...`);
          for (const table of tablesToDrop) {
              await connection.query(`DROP TABLE IF EXISTS ${table}`);
              console.log(`  - Tabel [${table}] dihapus.`);
          }

          await connection.end();
          console.log('✅ Seluruh tabel MySQL dibersihkan.');
      } catch (err) {
          console.error('❌ Gagal akses MySQL:', err.message);
      }
  } else {
      console.warn('⚠️ Konfigurasi MySQL tidak lengkap di .env. Lewati pembersihan MySQL.');
  }

  console.log('--- ✨ Purge Selesai. Silakan jalankan [npm start] untuk migrasi ulang. ✨ ---');
}

purge();
