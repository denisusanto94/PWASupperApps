-- maps_shareit: data modul maps / ShareIt (JSON di kolom data)
-- Terapkan manual jika perlu, atau jalankan: npm run migrate (menggunakan init_mysql.js)

CREATE TABLE IF NOT EXISTS maps_shareit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  data LONGTEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
