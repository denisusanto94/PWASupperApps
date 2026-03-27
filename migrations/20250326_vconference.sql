-- Video conference / meeting online (jadwal, kode room, undangan, join)
-- Jalankan: npm run migrate (init_mysql.js), atau eksekusi manual di MySQL.

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
);

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
);
