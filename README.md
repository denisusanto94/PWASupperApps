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
*   **Rute**: `/instant-chat`.
*   **Keamanan Vault**: Enkripsi identitas **AES-256 GCM** via PBKDF2 (Zero-Visibility Credentials).
*   **Tambah Chat & Daftar User**: Antarmuka inisiasi sesi yang lebih intuitif dengan pencarian user yang cepat.
*   **Clean User Roster**: Menyaring (exclude) akun `admin` dan `superadmin` dari daftar percakapan.
*   **Badge pesan di header**: Setelah login, ikon pesan di app header (kiri menu profil) mengarah ke `/instant-chat` dengan **badge jumlah pesan masuk belum dibaca** (agregat semua lawan bicara). Cursor “sudah dibaca” disimpan per pengguna di `localStorage`; migrasi sekali menandai histori lama agar tidak membanjiri badge. Log panggilan (`isCallLog`) tidak dihitung sebagai unread.
*   **Real-time Calling (WebRTC)**: Panggilan suara dan video berkualitas tinggi (Peer-to-Peer) dengan penanganan state yang lebih stabil (Robust End-to-End).
*   **Suara panggilan (penerima)**: Ringtone loop dari `public/sound/` — **suara**: `voice-call-ringing.mp3`, **video**: `video-call-ringing.mp3`. Ringtone berhenti saat jawab, tolak, atau hangup.
*   **Suara akhir / tolak**: Satu kali `end-decline-call.mp3` saat **decline**, **end call** (tombol tutup atau hangup lawan saat panggilan aktif), atau lawan membatalkan panggilan masuk. Saat **accept**, hanya ringtone yang dihentikan (tanpa suara end).
*   **Historical Call Logs**: Pencatatan riwayat panggilan otomatis (Masuk, Keluar, Tak Terjawab) ke timeline chat.
*   **Media Encryption**: Berbagi gambar, video, dan dokumen secara aman.

### 3. getlynk.id (Bio Link Creator)
*   **Custom Landing Pages**: Editor WYSIWYG untuk membuat halaman bio link digital.
*   **Blok Konten Variatif**: Dukungan untuk teks, gambar, video embedding, link eksternal, dan social connect.
*   **User Editor Partitioning**: Data setiap pengguna dipisahkan secara ketat untuk privasi total.

### 4. Timestamp Camera (Absensi & Foto Lokasi)
*   **File-Based Storage Architecture**: Menyimpan foto secara fisik di server (`public/timestamp-camera/`) untuk performa maksimal.
*   **High-Precision Overlays**: Koordinat lokasi (8 desimal), alamat detail (Reverse Geocoding), dan timestamp presisi.
*   **Clean Professional Layout**: Overlay teks diposisikan rapat 10px ke pojok kanan bawah tanpa tagline yang mengganggu estetika.
*   **On-Demand Activation**: Penggunaan resource kamera hanya saat dibutuhkan untuk efisiensi daya.
*   **Full HD Portrait**: Output foto beresolusi 1080 x 1920 px.

### 5. Wedding Invitation (Digital Invitation)
*   **Premium Template Engine**: Pilihan template (Classic, Montain, dll) dengan visual fidelitas tinggi 100%.
*   **Guest Mode Access**: Memungkinkan pembuatan pratinjau tanpa login awal (Self-service).
*   **Superadmin Role Support**: Dukungan penuh untuk level akses tertinggi aplikasi.

### 6. Maps ShareIt (Berbagi Lokasi)
*   **Rute**: `/maps-shareit` — halaman dapat diakses **tanpa login**; **berbagi lokasi baru** memerlukan login.
*   **Peta**: **OpenStreetMap** (tiles OSM) dengan **Leaflet**; pencarian alamat lewat proxy **Nominatim** di server.
*   **Penyimpanan**: Tabel MySQL `maps_shareit`, kolom `data` (JSON) berisi `latitude`, `longitude`, `kategori`, `komentar`, serta `addressLabel` / `createdAt` bila ada.
*   **Kategori & marker**: **Tempat Makan**, **Cafe**, **Hiburan** — ikon pin berbeda per kategori.
*   **Kontributor terbaru**: Daftar ringkas di sidebar (nama, kategori, komentar, waktu); popup marker berisi arah ke **OSM Directions**, URI **`geo:`** (aplikasi peta bawaan perangkat), serta tautan **Google Maps** / **Apple Maps**.
*   **API publik** (tanpa sesi): `GET /api/maps-shareit/places`, `GET /api/maps-shareit/geocode?q=`, `GET /api/maps-shareit/reverse?lat=&lon=`. Kontribusi: `POST /api/modules/maps_shareit` (autentikasi wajib, validasi server).

### 7. Admin Panel & Session Management
*   **Session Monitor**: Indikator status sesi (Online/Offline) secara visual pada daftar user.
*   **Force Logout / Reset Sesi**: Kemampuan admin untuk menutup paksa atau mereset sesi aktif user di semua perangkat.
*   **Admin Multi-Device**: Izin login simultan dari banyak perangkat khusus untuk akun `admin` dan `superadmin`.
*   **Idle Auto-Logout**: Keamanan otomatis yang menutup sesi jika pengguna tidak aktif selama 30 menit.

---

## ✨ Arsitektur & Keunggulan Teknis

*   **Hybrid Sync Engine**: Menggabungkan kecepatan **PouchDB (Offline-first)** di sisi klien dengan keandalan **MySQL (Persistence)** di sisi server menggunakan sinkronisasi bridge yang cerdas.
*   **MySQL Version Compatibility**: Seluruh query JSON menggunakan `JSON_UNQUOTE(JSON_EXTRACT(...))` untuk menjamin kompatibilitas pada versi MySQL lama maupun baru.
*   **Security Hardening**: Migrasi kredensial otomatis dari plain-text ke format terenkripsi AES-256 GCM.
*   **Advanced Session Policy**: Kebijakan single-session untuk user standar, namun tetap fleksibel (multi-login) untuk role Admin demi kemudahan manajemen.
*   **Unique Registration Control**: Validasi ketat pada proses pendaftaran untuk memastikan integritas data pengguna.
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

### 2. Migrasi skema MySQL
Menambahkan atau menyelaraskan tabel (termasuk `maps_shareit`) tanpa menghapus data yang ada:
```bash
npm run migrate
```
Membutuhkan variabel `MYSQL_*` yang valid di `.env`. Skema utama diatur di `src/server/init_mysql.js`; file SQL opsional ada di folder `migrations/`.

### 3. Memulai Aplikasi
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
*   `index.js`: Entry point server & API Bridge (termasuk modul `maps_shareit` & endpoint Maps ShareIt publik).
*   `src/server/baileys.js`: Logika Multi-Session WhatsApp.
*   `src/server/worker.js`: Background worker pengirim pesan bulk.
*   `src/server/init_mysql.js`: Skema otomatis & tabel migrasi (`is_guest` standardized, tabel `maps_shareit`).
*   `scripts/migrate-database.js`: Jalankan via `npm run migrate`.
*   `src/client/App.vue`: Shell global, header (ikon pesan + badge unread Instant Chat, polling modul `instant_chat`).
*   `src/client/views/MapsShareItView.vue`: UI Maps ShareIt (peta, form bagikan, popup navigasi).
*   `src/client/views/InstantMessagingView.vue`: UI Instant Chat, WebRTC, ringtone & suara end/decline.
*   `src/client/db.js`: Abstraksi data client-side & API Fetcher; helper Instant Chat unread (`migrateInstantChatReadMapOnce`, `countInstantChatUnread`, `setChatReadCursor`).
*   `public/sound/`: Aset audio panggilan Instant Chat (`voice-call-ringing.mp3`, `video-call-ringing.mp3`, `end-decline-call.mp3`).

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
