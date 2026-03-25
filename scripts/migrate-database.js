import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { initMysql } from '../src/server/init_mysql.js';

async function main() {
  if (process.env.MYSQL_HOST) {
    console.log('--- Starting Migration (Centralized MySQL) ---');
    const mysqlHost = process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1');
    await initMysql({
      host: mysqlHost,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS || '',
      database: process.env.MYSQL_DB
    });
    console.log('✅ Migration COMPLETED.');
  } else {
    console.error('❌ MYSQL_HOST is not defined in .env — cannot perform migration.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('💥 Migration FAILED:', e);
    process.exit(1);
  });

