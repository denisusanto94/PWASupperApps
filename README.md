# PWASupperApps

**PWASupperApps** adalah platform multi-aplikasi berbasis Progressive Web App (PWA) yang menggabungkan berbagai utilitas produktivitas dalam satu ekosistem modern. Dibangun menggunakan **Vue 3**, **PouchDB**, dan **Baileys** untuk integrasi WhatsApp, serta sinkronisasi real-time ke **MySQL**. Fokus utama aplikasi ini adalah keamanan, persistensi data offline-first, dan antarmuka premium berstandar industri.

---

## 🚀 Fitur Utama & Modul

Aplikasi ini terdiri dari beberapa modul utama dengan sistem **Multi-User (Auth)** yang terisolasi:

### 1. WaBlaster (WhatsApp Bulk & Automation)
*   **Multi-Login & Multi-User Support**: Sesi WhatsApp kini terisolasi per pengguna (`sessions/user_{id}/main`), memungkinkan banyak pengguna terhubung sekaligus tanpa konflik.
*   **Smart QR Watchdog**: Deteksi otomatis 10 detik jika QR Code gagal muncul, lengkap dengan tombol refresh aplikasi terintegrasi.
*   **Bulk Messaging**: Kirim pesan massal dengan jeda acak (jitter) untuk menghindari deteksi spam.
*   **Contact Management**: Impor kontak dari file VCF dan kelola daftar nomor tujuan secara privat.
*   **Clean Navigation**: Antarmuka terpadu tanpa parameter sesi yang membingungkan di URL.

### 2. Instant Chat (Secure Communication)
*   **Keamanan Vault**: Enkripsi identitas **AES-256 GCM** via PBKDF2 (Zero-Visibility Credentials).
*   **Real-time Calling (WebRTC)**: Panggilan suara dan video berkualitas tinggi (Peer-to-Peer).
*   **Historical Call Logs**: Pencatatan riwayat panggilan otomatis (Missed, Ended, Cancelled) langsung ke dalam timeline chat untuk audit komunikasi.
*   **Real-time Presence**: Indikator status online/offline berdasarkan heartbeat (`is_online_chat`).
*   **Media Encryption**: Berbagi gambar, video, dan dokumen secara aman.

### 3. getlynk.id (Bio Link Creator)
*   **Custom Landing Pages**: Editor WYSIWYG untuk membuat halaman bio link digital.
*   **Blok Konten Variatif**: Dukungan untuk teks, gambar, video embedding, link eksternal, dan social connect.
*   **User Editor Partitioning**: Data setiap pengguna dipisahkan secara ketat untuk privasi total.

### 4. Timestamp Camera (Absensi & Foto Lokasi)
*   **File-Based Storage Architecture**: Mengatasi error `413 Payload Too Large` dengan menyimpan foto secara fisik di server (`public/timestamp-camera/`) dan hanya menyimpan referensi URL di database.
*   **High-Precision Overlays**: Koordinat lokasi (8 desimal), alamat detail (Reverse Geocoding), dan timestamp detik yang presisi.
*   **On-Demand Activation**: Penggunaan resource kamera hanya saat dibutuhkan untuk efisiensi daya.
*   **Full HD Portrait**: Output foto beresolusi 1080 x 1920 px.

### 5. Wedding Invitation (Digital Invitation)
*   **Premium Template Engine**: Pilihan template (Classic, Montain, dll) dengan visual fidelitas tinggi 100%.
*   **Guest Mode Access**: Memungkinkan pembuatan pratinjau tanpa login awal (Self-service).

---

## ✨ Arsitektur & Keunggulan Teknis

*   **Hybrid Sync Engine**: Menggabungkan kecepatan **PouchDB (Offline-first)** di sisi klien dengan keandalan **MySQL (Persistence)** di sisi server menggunakan sinkronisasi bridge yang cerdas.
*   **MySQL Version Compatibility**: Seluruh query JSON menggunakan `JSON_UNQUOTE(JSON_EXTRACT(...))` untuk menjamin kompatibilitas pada versi MySQL lama maupun baru.
*   **Security Hardening**: Migrasi kredensial otomatis dari plain-text ke format terenkripsi AES-256 GCM.
*   **Global Notification System**: Overlay toast transparan dengan prioritas visual tertinggi (`z-index: 10001`).
*   **PouchDB Registry**: Menghindari *file locking* pada Windows dengan memastikan sirkulasi instance database yang tunggal.

---

## 🛠️ Instalasi & Konfigurasi

### 1. Database & Lingkungan (.env)
Pastikan MySQL sudah terinstal. Buat database `pwa_super_apps` (atau sesuai konfigurasi). 

Isi file `.env` di root:
```env
PORT=3000
DATABASE_DIR=./database
SESSIONS_DIR=./sessions
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=
MYSQL_DB=pwa-super-apps
MYSQL_DROP_ON_START=false
```

### 2. Memulai Aplikasi
```bash
# 1. Instalasi Node Modules
npm install

# 2. Build Frontend (Vite)
npm run build

# 3. Jalankan Server Utama
npm start
```

---

## 📂 Struktur Penting
*   `index.js`: Entry point server & API Bridge.
*   `src/server/baileys.js`: Logika Multi-Session WhatsApp.
*   `src/server/worker.js`: Background worker pengirim pesan bulk.
*   `src/server/init_mysql.js`: Skema otomatis & tabel migrasi (`is_guest` standardized).
*   `src/client/db.js`: Abstraksi data client-side & API Fetcher.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
