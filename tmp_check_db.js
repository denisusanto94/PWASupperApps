import mysql from 'mysql2/promise';
import 'dotenv/config';

(async () => {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST === 'localhost' ? '127.0.0.1' : (process.env.MYSQL_HOST || '127.0.0.1'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS || '',
        database: process.env.MYSQL_DB
    });
    
    try {
        const [rows] = await pool.query("SELECT * FROM wa_blaster WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) = 'connection'");
        console.log("Found connection rows:", rows.length);
        for (const row of rows) {
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            console.log(`User ${row.user_id}: Status=${data.status}, session=${data.sessionId}, hasQR=${!!data.qr}`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
