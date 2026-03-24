import mysql from 'mysql2/promise';

export async function initMysql(config) {
  if (!config.host) return;
  console.log('--- Initializing MySQL Schemas ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host || '127.0.0.1',
      port: config.port || 3306,
      user: config.user,
      password: config.password || '',
      database: config.database
    });

    // 1. Create/Update pwa_data (Primary Bridge Table)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pwa_data (
        id VARCHAR(255) PRIMARY KEY,
        source_db VARCHAR(255),
        type VARCHAR(50),
        data LONGTEXT,
        chat_status VARCHAR(20) DEFAULT 'sent',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Safely add chat_status if missing (for legacy tables)
    try {
      await connection.query(`ALTER TABLE pwa_data ADD COLUMN chat_status VARCHAR(20) DEFAULT 'sent'`);
    } catch (e) {}

    // Safely add indexes
    const addIndex = async (name, col) => {
      try {
        await connection.query(`CREATE INDEX ${name} ON pwa_data (${col})`);
      } catch (e) { /* Index already exists or column error */ }
    };
    await addIndex('idx_type', 'type');
    await addIndex('idx_source', 'source_db');
    await addIndex('idx_status', 'chat_status');

    // 2. Heartbeats (Chat Room)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS is_online_chat (
        username VARCHAR(255) PRIMARY KEY,
        last_seen BIGINT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Heartbeats (General Application)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS is_online_general (
        client_id VARCHAR(255) PRIMARY KEY,
        last_seen BIGINT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Application Versioning
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pwa_version (
        id VARCHAR(50) PRIMARY KEY,
        version VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 5. Users Chat (Roster)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users_chat (
        username VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('--- MySQL Schemas OK ---');
    await connection.end();
  } catch (err) {
    console.error('MySQL Init Warning:', err.message);
  }
}
