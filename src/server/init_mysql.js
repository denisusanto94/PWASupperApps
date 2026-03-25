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
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

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

