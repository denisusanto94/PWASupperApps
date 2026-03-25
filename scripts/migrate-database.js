import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { initDbMigrations } from '../src/server/init_db_schemas.js';
import { initMysql } from '../src/server/init_mysql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dbPath = path.resolve(root, process.env.DATABASE_DIR || './database');

async function main() {
  await initDbMigrations(dbPath);
  if (process.env.MYSQL_HOST) {
    const mysqlHost = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : process.env.MYSQL_HOST;
    await initMysql({
      host: mysqlHost,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB
    });
  } else {
    console.log('MYSQL_HOST tidak diset — lewati inisialisasi skema MySQL.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
