-- Notifikasi in-app (undangan meeting, dll.)
-- npm run migrate memakai init_mysql.js; file ini untuk eksekusi manual bila perlu.

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
);
