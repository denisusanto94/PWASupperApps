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
      database: config.database,
      multipleStatements: true
    });

    // 0. Drop all existing tables IF REQUESTED
    if (config.dropAll) {
        console.log('⚠️ DROPPING ALL TABLES...');
        try {
            const [tables] = await connection.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = ?
            `, [config.database]);

            if (tables.length > 0) {
                await connection.query('SET FOREIGN_KEY_CHECKS = 0');
                for (const table of tables) {
                    await connection.query(`DROP TABLE IF EXISTS \`${table.TABLE_NAME || table.table_name}\``);
                }
                await connection.query('SET FOREIGN_KEY_CHECKS = 1');
                console.log(`✅ Successfully dropped ${tables.length} tables.`);
            }
        } catch (dropErr) {
            console.warn('⚠️ No tables to drop or error dropping:', dropErr.message);
        }
    }

    // 1. users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    // 3. permission
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permission (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    // 4. roles_has_permission
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles_has_permission (
        role_id INT,
        permission_id INT,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
      )
    `);

    // 5. users_has_roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users_has_roles (
        user_id INT,
        role_id INT,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    // 6. wa_blaster
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wa_blaster (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    try { await connection.query(`ALTER TABLE wa_blaster ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER data`); } catch(e){}

    // 7. getlynk_id
    await connection.query(`
      CREATE TABLE IF NOT EXISTS getlynk_id (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    try { await connection.query(`ALTER TABLE getlynk_id ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER data`); } catch(e){}

    // 8. instant_chat
    await connection.query(`
      CREATE TABLE IF NOT EXISTS instant_chat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    try { await connection.query(`ALTER TABLE instant_chat ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER data`); } catch(e){}

    // 9. wedding_invitation
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wedding_invitation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    try { await connection.query(`ALTER TABLE wedding_invitation ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER data`); } catch(e){}

    // 10. timestamp_camera
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timestamp_camera (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 10b. is_online_chat (Real-time Presence)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS is_online_chat (
        user_id INT PRIMARY KEY,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 11. sessions_id
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions_id (
        id VARCHAR(255) PRIMARY KEY,
        user_id INT,
        expires_at DATETIME,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Migration to DATETIME
    try { await connection.query(`ALTER TABLE sessions_id MODIFY COLUMN expires_at DATETIME`); } catch(e){}
    try { await connection.query(`ALTER TABLE sessions_id MODIFY COLUMN last_activity DATETIME DEFAULT CURRENT_TIMESTAMP`); } catch(e){}
    try { await connection.query(`ALTER TABLE sessions_id MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`); } catch(e){}

    // 12. token_id
    await connection.query(`
      CREATE TABLE IF NOT EXISTS token_id (
        token VARCHAR(255) PRIMARY KEY,
        user_id INT,
        type VARCHAR(50),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 13. maps_shareit
    await connection.query(`
      CREATE TABLE IF NOT EXISTS maps_shareit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        data LONGTEXT,
        is_guest BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    try { await connection.query(`ALTER TABLE maps_shareit ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER data`); } catch(e){}

    // 14. vconference (meeting online — metadata + jadwal)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vconference (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT 'pembuat meeting',
        room_code VARCHAR(32) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        scheduled_start DATETIME NOT NULL,
        scheduled_end DATETIME NOT NULL,
        link_gdrive TEXT NULL COMMENT 'tautan hasil/rekaman meeting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_vconf_room_code (room_code),
        INDEX idx_vconf_creator (user_id),
        INDEX idx_vconf_schedule (scheduled_start)
      )
    `);

    // 15. vconference_participants (undangan + waktu masuk room)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vconference_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vconference_id INT NOT NULL,
        user_id INT NOT NULL,
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        joined_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (vconference_id) REFERENCES vconference(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_vconf_participant (vconference_id, user_id),
        INDEX idx_vconf_part_user (user_id)
      )
    `);

    // 16. user_notifications (header / bell)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        data_json JSON,
        read_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_unotif_user_unread (user_id, read_at),
        INDEX idx_unotif_created (user_id, created_at)
      )
    `);

    // --- SEED INITIAL DATA ---
    console.log('🌱 Seeding initial data...');
    
    // Roles
    await connection.query(`INSERT IGNORE INTO roles (name) VALUES ('admin'), ('user')`);
    
    // Admin User
    const [existingAdmin] = await connection.query(`SELECT id FROM users WHERE email = ?`, ['admin@gmail.com']);
    if (existingAdmin.length === 0) {
        await connection.query(`
            INSERT INTO users (email, password, full_name) 
            VALUES ('admin@gmail.com', '12345678', 'Sistem Administrator')
        `);
        const [adminResult] = await connection.query(`SELECT id FROM users WHERE email = ?`, ['admin@gmail.com']);
        const adminId = adminResult[0].id;
        
        const [roleResult] = await connection.query(`SELECT id FROM roles WHERE name = 'admin'`);
        const roleId = roleResult[0].id;
        
        await connection.query(`INSERT IGNORE INTO users_has_roles (user_id, role_id) VALUES (?, ?)`, [adminId, roleId]);
        console.log('✅ Admin user created: admin@gmail.com / 12345678');
    }

    console.log('--- MySQL Schemas OK ---');
    await connection.end();
  } catch (err) {
    console.error('❌ MySQL Init Error:', err.message);
    throw err;
  }
}

