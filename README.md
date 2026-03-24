# PWASupperApps

**PWASupperApps** adalah platform multi-aplikasi berbasis Progressive Web App (PWA) yang menggabungkan berbagai utilitas produktivitas dalam satu ekosistem modern. Dibangun menggunakan **Vue 3**, **PouchDB**, dan **Baileys** untuk integrasi WhatsApp, serta sinkronisasi real-time ke **MySQL**. Fokus utama aplikasi ini adalah keamanan, persistensi data offline-first, dan antarmuka premium.

## 🚀 Fitur Utama

Aplikasi ini terdiri dari beberapa modul utama dengan sistem **Multi-User (Auth)**:

1.  **WaBlaster (WhatsApp Blaster)**:
    *   Kirim pesan WhatsApp bulk dengan jeda acak untuk menghindari deteksi spam.
    *   Impor kontak dari file VCF.
    *   Sinkronisasi riwayat pengiriman real-time & Integrasi Notifikasi Global (Toast).

2.  **getlynk.id (Bio Link Tool) - [Auth Protected]**:
    *   Utilitas pemendekan tautan & Bio Link kustom.
    *   **Fitur Login & Registrasi**: Setiap pengguna memiliki editor dan data konten privat.
    *   Berbagai blok konten: Text, Image, Video, Link, Social Connect.

3.  **Instant Chat (Secure Communication) - [Auth Protected]**:
    *   **Keamanan Vault**: Enkripsi identitas **AES-256 GCM** via PBKDF2 (Zero-Visibility Credentials).
    *   **Real-time Voice & Video Call**: Panggilan suara dan video berkualitas tinggi berbasis **WebRTC** (Peer-to-Peer).
    *   **Call History**: Pencatatan otomatis riwayat panggilan (Missed, Ended, Cancelled) di timeline chat.
    *   **Media Sharing**: Support gambar, video, audio, dan dokumen terenkripsi.
    *   **Indikator Online**: Status kehadiran real-time antar pengguna.

4.  **Wedding Invitation (Undangan Digital) - [Auth Protected]**:
    *   Pembuat undangan pernikahan digital dengan template premium.
    *   **User Partitioning**: Progres pembuatan undangan disimpan berdasarkan akun pengguna.
    *   **Multi-Template**: Pilihan template (Classic, Montain, dll) yang responsif.

5.  **Timestamp Camera (Absensi Online & Foto Lokasi)**:
    *   **On-Demand Camera**: Kamera hanya aktif saat pengguna mengklik tombol "Ambil Foto", menghemat daya dan meningkatkan privasi.
    *   **Metode Ganda**: Pengambilan foto via kamera langsung (Selfie) atau unggah dari galeri (Upload).
    *   **Resolusi Tinggi (Full HD Portrait)**: Foto dihasilkan dalam ukuran **1080 x 1920 px**.
    *   **Overlay Presisi Tinggi**: Koordinat (8 desimal desimal), Alamat detail, dan Waktu (Detik).
    *   **Modal Preview Details**: Pratinjau hasil foto menggunakan dialog premium untuk detail yang lebih jelas.
    *   **Premium Viewfinder**: Antarmuka modern dengan garis fokus dan entry animations.

6.  **Real-time Insights (Plugins)**:
    *   **Forecast BMKG**: Prakiraan cuaca resmi dari server BMKG Indonesia dengan ikon SVG premium.
    *   **Google News Feed**: Berita terkini harian yang terintegrasi di Dashboard dengan fitur **"Lihat Lebih Banyak" (Load More)**.

## ✨ Fitur Sistem & UX Modern

*   **PouchDB Instance Registry (getDb)**: Implementasi registry PouchDB untuk memastikan hanya satu instance database yang aktif, meningkatkan stabilitas, terutama pada sistem operasi Windows.
*   **MySQL Full-Sync Initializer**: Pada saat startup, bridge akan melakukan sinkronisasi penuh (*Full docs sync*) dari PouchDB ke MySQL untuk memastikan seluruh data historis (chat, users, version) terbit ke backend SQL.
*   **Credential Hardening**: Seluruh password di database dimigrasikan dari plain-text ke format enkripsi AES-256. (Gunakan `migrate_passwords.js` untuk mereset akun lama).
*   **Global Toast Notification**: Notifikasi cerdas (Full-width top overlay) dengan prioritas `z-index: 10001` yang menjamin pesan sistem selalu terlihat di atas aset visual apa pun.
*   **WebRTC Signaling via PouchDB**: Penggunaan NoSQL sebagai signaling server untuk panggilan peer-to-peer tanpa ketergantungan server pihak ketiga berbayar.
*   **Idempotent Migrations**: Inisialisasi skema MySQL otomatis yang cerdas (Index checking & Field validation) setiap kali server dijalankan.

## 🛠️ Tech Stack

*   **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS / Vanilla Premium UI.
*   **Backend**: Node.js, Express, Express-PouchDB.
*   **Database**: PouchDB (IndexedDB/LevelDB), MySQL (Persistence Bridge via Remote Server).
*   **RTC & Security**: WebRTC (Signaling via PouchDB), Web Crypto API (AES-GCM 256), PBKDF2 (50.000 iterations).
*   **WhatsApp**: Baileys WASocket Middleware.

## ⚙️ Cara Instalasi & Penggunaan

### 1. Persiapan Database MySQL
Buatlah database baru di MySQL (misal: `pwa_super_apps`). Aplikasi akan otomatis membangun tabel `pwa_data`, `is_online_chat`, `users_chat`, dan `pwa_version` saat pertama kali dijalankan.

### 2. Konfigurasi Lingkungan (.env)
Sesuaikan koneksi database (.env) Anda dengan kredensial MySQL yang valid:
```env
PORT=3000
DATABASE_DIR=./database
MYSQL_HOST=109.106.253.215
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASS='your_pass'
MYSQL_DB=pwa_super_apps
```

### 3. Jalankan Aplikasi
```bash
# Instal dependensi
npm install

# Jalankan migrasi enkripsi user lama (Opsional)
node migrate_passwords.js

# Build frontend production bundle
npm run build

# Start server (Sync otomatis akan berjalan)
npm start
```

## 📂 File Infrastruktur Penting
*   `index.js`: Server utama dengan logika Full-Sync Bridge.
*   `src/server/init_mysql.js`: Skema otomatis & indexing MySQL.
*   `src/server/init_db_schemas.js`: Inisialisasi index NoSQL (PouchDB).
*   `migrate_passwords.js`: Tool migrasi keamanan kredensial.
*   `src/client/toast.js`: Utilitas notifikasi global.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
