# PWASupperApps

**PWASupperApps** adalah platform multi-aplikasi berbasis Progressive Web App (PWA) yang menggabungkan berbagai utilitas produktivitas dalam satu ekosistem modern. Dibangun menggunakan **Vue 3**, **PouchDB**, dan **Baileys** untuk integrasi WhatsApp, serta sinkronisasi real-time ke **MySQL**. Fokus utama aplikasi ini adalah keamanan, persistensi data offline-first, dan antarmuka premium.

## 🚀 Fitur Utama

Aplikasi ini terdiri dari beberapa modul utama dengan sistem **Multi-User (Auth)**:

1.  **WaBlaster (WhatsApp Blaster)**:
    *   Kirim pesan WhatsApp bulk dengan jeda acak untuk menghindari deteksi spam.
    *   Impor kontak dari file VCF.
    *   Sinkronisasi riwayat pengiriman real-time.

2.  **getlynk.id (Bio Link Tool) - [Auth Protected]**:
    *   Utilitas pemendekan tautan & Bio Link kustom.
    *   **Fitur Login & Registrasi**: Setiap pengguna memiliki editor dan data konten privat.
    *   Berbagai blok konten: Text, Image, Video, Link, Social Connect.

3.  **Instant Messaging (Secure Chat) - [Auth Protected]**:
    *   **Enkripsi E2EE**: Pesan dienkripsi ujung-ke-ujung via **AES-256-GCM**.
    *   **Secure Access**: Memerlukan username & password untuk akses chat. 
    *   **Media Sharing**: Support gambar, video, audio, dan dokumen.
    *   **Real-time Sync**: Pesan tersinkronisasi antar perangkat secara instan.

4.  **Wedding Invitation (Undangan Digital) - [Auth Protected]**:
    *   Pembuat undangan pernikahan digital dengan template premium.
    *   **User Partitioning**: Progres pembuatan undangan disimpan berdasarkan akun pengguna.
    *   **Multi-Template**: Pilihan template (Classic, Montain, dll) yang responsif.

## ✨ Fitur Sistem & UX Modern

*   **Hybrid Storage Bridge**: Sinkronisasi otomatis data PouchDB (NoSQL) ke **MySQL** secara real-time untuk kebutuhan reporting dan backup terpusat.
*   **Global Toast System**: Notifikasi cerdas (Success, Error, Warning) yang muncul secara *full-width* di bagian atas layar, menggantikan dialog alert tradisional.
*   **Offline-First & PWA**: Akses data tetap lancar meskipun koneksi terputus, otomatis sinkron saat kembali online.
*   **Branded Interface**: Favicon dan ikon aplikasi yang telah diperbarui untuk identitas visual yang seragam.

## 🛠️ Tech Stack

*   **Frontend**: Vue 3 (Composition API), Tailwind CSS / Vanilla CSS, Vue Router.
*   **Backend**: Node.js, Express, Express-PouchDB.
*   **Database**: PouchDB (Local/Server), MySQL (Sync Bridge via `mysql2`).
*   **Security**: Web Crypto API (AES-256-GCM) & PouchDB-based Auth.
*   **WhatsApp**: Baileys Socket Connectivity.

## ⚙️ Cara Instalasi & Penggunaan

### 1. Persiapan Database MySQL
Buatlah database baru di MySQL (misal: `pwa-super-apps`). Aplikasi akan otomatis membuat tabel `pwa_data` saat pertama kali dijalankan.

### 2. Konfigurasi Lingkungan (.env)
Salin `.env.example` ke `.env` dan atur koneksi database Anda:
```env
PORT=3000
DB_NAME=wa_database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=
MYSQL_DB=pwa-super-apps
```

### 3. Jalankan Aplikasi
```bash
# Instal dependensi
npm install

# Jalankan migrasi data lama ke MySQL (Opsional jika ada data lama)
node migrate.js

# Build frontend & Start server
npm run build
npm start
```

## 📂 Struktur Penting Proyek
*   `index.js`: Server utama dengan MySQL Bridge logic.
*   `migrate.js`: Skrip migrasi data dari PouchDB ke MySQL.
*   `src/server/init_db_schemas.js`: Inisialisasi index NoSQL otomatis.
*   `src/client/toast.js`: Sistem notifikasi global.
*   `src/client/db.js`: Konfigurasi sinkronisasi PouchDB.

## 🛠️ Deployment VPS & Sinkronisasi
Untuk deployment lengkap di server produksi, gunakan PM2 dan Nginx dengan SSL (Certbot). Aplikasi ini **WAJIB** berjalan di HTTPS agar fitur PWA dan Web Crypto (Enkripsi) dapat berfungsi di browser mobile.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
