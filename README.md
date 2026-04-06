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
*   **Arah dalam aplikasi**: Rute **OSRM** (profil mengemudi/jalan/kendaraan) di-proxy lewat `GET /api/maps-shareit/route` untuk menghindari CORS; panel arah di popup marker.
*   **Penyimpanan**: Tabel MySQL `maps_shareit`, kolom `data` (JSON) berisi `latitude`, `longitude`, `kategori`, `komentar`, serta `addressLabel` / `createdAt` bila ada.
*   **Verifikasi (admin)**: Field opsional `verified: true` di JSON — ditetapkan hanya dari panel admin. Di peta publik, entri terverifikasi menampilkan **ikon centang biru** di **popup Leaflet** dan di **daftar sidebar** (kontributor terbaru).
*   **Edit kontribusi**: Saat pengguna mengubah lokasinya sendiri, flag `verified` yang sudah diset admin **dipertahankan** oleh server (bukan di-set dari klien).
*   **Kategori & marker**: **Tempat Makan**, **Cafe**, **Hiburan** — ikon pin berbeda per kategori.
*   **Kontributor terbaru**: Daftar ringkas di sidebar (nama, kategori, komentar, waktu); popup marker berisi petunjuk arah (OSRM), **OSM Directions**, URI **`geo:`**, serta tautan **Google Maps** / **Apple Maps** (sesuai implementasi UI).
*   **API publik** (tanpa sesi): `GET /api/maps-shareit/places` (response menyertakan `verified`), `GET /api/maps-shareit/geocode?q=`, `GET /api/maps-shareit/reverse?lat=&lon=`, `GET /api/maps-shareit/route?from=&to=&profile=`. Kontribusi: `POST /api/modules/maps_shareit` (autentikasi wajib, validasi server).

### 7. Admin Panel & Session Management
*   **Rute**: `/admin` — akses **admin** / **superadmin** (sesuai kebijakan auth aplikasi).
*   **Tab Users Management**: Daftar pengguna, reset sesi, hapus user (bukan akun admin utama yang dilindungi).
*   **Tab Maps Shareit Management**: Daftar kontribusi `maps_shareit` dengan pencarian; **toggle on/off verifikasi** per baris (memanggil API patch); hapus kontribusi.
*   **Konfirmasi**: Tindakan destruktif atau sensitif (**hapus user**, **hapus kontribusi Maps**, **reset sesi**) memakai **modal konfirmasi** di dalam aplikasi, bukan `window.confirm` / `alert` bawaan browser.
*   **Session Monitor**: Indikator status sesi (Online/Offline) secara visual pada daftar user.
*   **Force Logout / Reset Sesi**: Kemampuan admin untuk menutup paksa atau mereset sesi aktif user di semua perangkat.
*   **Admin Multi-Device**: Izin login simultan dari banyak perangkat khusus untuk akun `admin` dan `superadmin`.
*   **Idle Auto-Logout**: Keamanan otomatis yang menutup sesi jika pengguna tidak aktif selama 30 menit.

**API admin Maps ShareIt** (sesi admin): `GET /api/admin/maps-shareit`, `PATCH /api/admin/maps-shareit/:id` (body `{ "verified": true|false }`), `DELETE /api/admin/maps-shareit/:id`.

### 8. Meeting Online (VConference)
*   **Rute**: `/vconference` (daftar & buat meeting), `/vconference/room/:code` (room video) — **wajib login**.
*   **Akses dari beranda**: kartu **Meeting Online** di halaman `/`.
*   **Penyimpanan MySQL**: tabel **`vconference`** (pembuat `user_id`, `room_code` unik, `title`, `scheduled_start` / `scheduled_end`, `link_gdrive` opsional) dan **`vconference_participants`** (`invited_at`, `joined_at` saat peserta masuk room).
*   **Video**: **Jitsi Meet** (`meet.jit.si`) di iframe; nama pada layar **prejoin** diisi otomatis dari **nama / email user login** (parameter URL `userInfo.displayName` & opsional `userInfo.email`).
*   **Picture-in-Picture**: tombol **Mode mini (PiP)** memakai **Document Picture-in-Picture** (browser Chromium); opsi **otomatis mini saat pindah tab**; iframe utama di-`about:blank` saat meeting hanya di jendela mini agar tidak dua sesi sekaligus.
*   **Undangan & notifikasi**: pembuat meeting dapat memilih pengguna dari daftar; setiap undangan baru menulis baris di **`user_notifications`** (tipe `meeting_invite`). Di **header** (sebelah ikon pesan) ada **ikon lonceng** dengan **badge jumlah belum dibaca**; panel daftar notifikasi, **tandai dibaca**, klik item menuju room meeting. Ringkasan polling: `GET /api/notifications?summary=1`.
*   **API** (autentikasi): `GET /api/vconference`, `POST /api/vconference`, `GET /api/vconference/by-code/:code`, `POST /api/vconference/join`, `PATCH /api/vconference/:id`, `DELETE /api/vconference/:id`, `GET /api/vconference/invite-candidates`; notifikasi: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`, `POST /api/notifications/mark-meeting-read` (body `{ "room_code" }`).

### 9. Mini Games (Hiburan & Skill)
*   **Rute**: `/mini-games` (Hub), `/mini-games/solitaire` (Solitaire), `/mini-games/memory-match` (Memory Match).
*   **Game Hub**: Antarmuka terpadu dengan efek hover dinamis dan glow ambient untuk memilih berbagai permainan.
*   **Solitaire (Kartu Klasik)**: 
    *   Implementasi logika kartu Klondike standar dengan sistem drag-and-drop.
    *   Status permainan disimpan secara lokal (PWA persistence).
    *   Deteksi kemenangan otomatis dengan efek visual yang memuaskan.
*   **Memory Match (Latih Memori)**:
    *   Sistem Difficulty: **Easy**, **Medium**, dan **Hard** dengan grid kartu yang menyesuaikan secara otomatis.
    *   Mekanik *flip-and-match* yang halus dengan animasi kartu 3D.
    *   Pembersihan otomatis kartu yang sudah cocok untuk visual yang lebih rapi.
*   **Akses Offline**: Sebagai PWA, game tetap dapat dimainkan meskipun tanpa koneksi internet (Offline-ready).

### 10. Header global (setelah login)
*   **Pesan**: ikon ke `/instant-chat` dengan **badge merah** jumlah pesan Instant Chat belum dibaca (polling modul `instant_chat`).
*   **Notifikasi**: ikon lonceng dengan **badge oranye** jumlah notifikasi **belum dibaca** (`user_notifications`), termasuk undangan Meeting Online.
*   **Idle Tracker Policy**: Sistem secara global memantau aktivitas. Jika tidak ada aktivitas selama 30 menit, sesi akan ditutup otomatis demi keamanan.

---

## 🔄 Alur Operasional & Penggunaan Menu

Berikut adalah panduan alur pengguna dari awal hingga pengelolaan fitur:

### 1. Alur Login & Sesi
*   **Akses Pertama**: User melakukan Login/Registrasi. Sesi disimpan di **MySQL** dan **LocalStorage**.
*   **Multi-Device**: Satu akun bisa masuk di berbagai browser/perangkat sekaligus tanpa saling memutus.
*   **Persistensi**: Sesi tetap aktif selama 24 jam meskipun browser ditutup, kecuali jika terjadi **Idle** 30 menit atau Logout manual.
*   **Logout Bersih**: Saat logout (manual atau idle), aplikasi melakukan `localStorage.clear()` untuk menghapus seluruh jejak data di perangkat.

### 2. Penggunaan Modul Utama
*   **Instant Chat**: Begitu masuk, status Anda otomatis menjadi **Online** di seluruh aplikasi. Muncul modal "Ringing" di tengah layar jika ada panggilan masuk, yang bisa di-*hide* ke bar atas.
*   **WaBlaster**: Hubungkan WhatsApp via QR Code. Data sesi aman & terisolasi per user.
*   **Timestamp Camera**: Akses kamera untuk absensi. Foto disimpan di server dengan watermark lokasi presisi (koordinat + alamat).
*   **Maps ShareIt**: Cari lokasi atau bagikan lokasi Anda. Admin akan melakukan verifikasi (centang biru) melalui Panel Admin.
*   **VConference**: Buat meeting, undang rekan melalui sistem notifikasi lonceng, dan gunakan fitur **PiP (Picture-in-Picture)** untuk tetap melihat video saat membuka menu lain.
*   **Mini Games**: Isi waktu luang dengan Solitaire atau asah otak dengan Memory Match langsung dari dashboard tanpa instalasi tambahan.

---

## ⚙️ Alur Teknis & Arsitektur Sistem

Dokumentasi teknis untuk pengembang dan pemeliharaan sistem:

### 1. Arsitektur Frontend (Client-Side)
*   **State Management**: Menggunakan Vue 3 **Reactive State** (`src/client/db.js`) untuk sinkronisasi data antar komponen.
*   **Global Polling**: `App.vue` menjalankan background timer setiap 15-30 detik untuk:
    - **Ping Online**: Memperbarui status hadir di server.
    - **Unread Counter**: Menghitung pesan chat & notifikasi masuk secara real-time.
    - **Idle Watcher**: Mendeteksi `mousemove/keydown` untuk mencegah auto-logout.
*   **Secure Storage**: Data sensitif dienkripsi di tingkat aplikasi sebelum disimpan atau dikirim.

### 2. Arsitektur Backend (Server-Side)
*   **Middleware Authenticate**: Setiap request divalidasi silang terhadap tabel `sessions_id`. Menggunakan perbandingan **DATETIME (MySQL)** untuk menghindari masalah perbedaan zona waktu komputer.
*   **Activity Lock**: Server memperbarui kolom `last_activity` pada setiap request API. Jika selisih `NOW()` dengan `last_activity` > 30 menit, request ditolak (401).
*   **JSON Bridge**: Menggunakan `mysql2` untuk memproses data dinamis dari modul (PouchDB style) ke dalam struktur relasional MySQL.
*   **Cleanup Worker**: Proses latar belakang (`setInterval`) yang membersihkan sesi mati di database setiap 5 menit.

---

## ✨ Arsitektur & Keunggulan Teknis

*   **Hybrid Sync Engine**: Menggabungkan kecepatan **PouchDB (Offline-first)** di sisi klien dengan keandalan **MySQL (Persistence)** di sisi server menggunakan sinkronisasi bridge yang cerdas.
*   **MySQL Version Compatibility**: Seluruh query JSON menggunakan `JSON_UNQUOTE(JSON_EXTRACT(...))` untuk menjamin kompatibilitas pada versi MySQL lama maupun baru.
*   **Security Hardening**: Migrasi kredensial otomatis dari plain-text ke format terenkripsi AES-256 GCM.
*   **Advanced Session Policy**: Kebijakan single-session untuk user standar, namun tetap fleksibel (multi-login) untuk role Admin demi kemudahan manajemen.
*   **Unique Registration Control**: Validasi ketat pada proses pendaftaran untuk memastikan integritas data pengguna.
*   **Toast global**: overlay pesan singkat (sukses/error/info) dengan prioritas visual tinggi (`z-index: 10001`).
*   **Notifikasi in-app**: tabel MySQL `user_notifications` untuk item di panel header (terpisah dari toast); undangan meeting menambah baris per penerima undangan.
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
Menambahkan atau menyelaraskan tabel (termasuk `maps_shareit`, `vconference`, `vconference_participants`, `user_notifications`, dll.) tanpa menghapus data yang ada:
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
*   `index.js`: Entry point server & API Bridge (modul `maps_shareit`, Maps ShareIt publik, **vconference**, **notifikasi**).
*   `src/server/baileys.js`: Logika Multi-Session WhatsApp.
*   `src/server/worker.js`: Background worker pengirim pesan bulk.
*   `src/server/init_mysql.js`: Skema otomatis & tabel migrasi (`is_guest` standardized, `maps_shareit`, `vconference` + partisipan, `user_notifications`).
*   `scripts/migrate-database.js`: Jalankan via `npm run migrate`.
*   `src/client/App.vue`: Shell global, header (ikon pesan + badge Instant Chat; ikon notifikasi + badge; polling).
*   `src/client/views/MapsShareItView.vue`: UI Maps ShareIt (peta, form bagikan, popup navigasi & verifikasi).
*   `src/client/views/AdminView.vue`: Panel admin (Users, Maps Shareit Management, toggle verifikasi, modal konfirmasi).
*   `src/client/views/VconferenceView.vue`: Meeting Online — form buat meeting, room Jitsi, PiP, undangan.
*   `src/client/views/InstantMessagingView.vue`: UI Instant Chat, WebRTC, ringtone & suara end/decline.
*   `src/client/views/MiniGamesView.vue`: Dashboard pusat permainan mini.
*   `src/client/views/SolitaireView.vue`: Komponen permainan kartu Solitaire.
*   `src/client/views/MemoryMatchView.vue`: Komponen permainan asah memori.
*   `src/client/db.js`: Abstraksi data client-side & API Fetcher; helper Instant Chat unread (`migrateInstantChatReadMapOnce`, `countInstantChatUnread`, `setChatReadCursor`).
*   `public/sound/`: Aset audio panggilan Instant Chat (`voice-call-ringing.mp3`, `video-call-ringing.mp3`, `end-decline-call.mp3`).

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
