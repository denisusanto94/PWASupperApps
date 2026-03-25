
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB
  };
  
  const connection = await mysql.createConnection(config);
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables:', tables);
  
  const tablesToCheck = ['users_chat', 'pwa_data'];
  for (const t of tablesToCheck) {
    const [rows] = await connection.query(`SELECT * FROM ${t} LIMIT 5`);
    console.log(`Table ${t}:`, rows);
  }
  
  await connection.end();
}

check();
