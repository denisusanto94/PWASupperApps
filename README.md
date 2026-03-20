# PWASupperApps

**PWASupperApps** adalah platform multi-aplikasi berbasis Progressive Web App (PWA) yang menggabungkan berbagai utilitas produktivitas dalam satu ekosistem modern. Dibangun menggunakan **Vue 3**, **PouchDB**, dan **Baileys** untuk integrasi WhatsApp yang handal, dengan fokus pada keamanan dan antarmuka premium.

## 🚀 Fitur Utama

Aplikasi ini terdiri dari beberapa modul utama yang dapat diakses melalui dashboard terpusat:

1.  **WaBlaster (WhatsApp Blaster)**:
    *   Kirim pesan WhatsApp bulk dengan jeda acak (10-15 detik) untuk menghindari deteksi spam.
    *   Impor kontak dari file VCF (vCard).
    *   Template pesan dinamis (Ucapan Hari Raya, dll).
    *   Sinkronisasi riwayat pengiriman real-time melalui worker background.

2.  **getlynk.id (Bio Link Tool)**:
    *   Utilitas pemendekan tautan (Short link) & Bio Link kustom.
    *   Layout responsif: Desktop (Side-by-side editor/preview), Mobile (Stacked).
    *   Berbagai blok konten: Text, Image, Video, Link, Social Connect.
    *   Integrasi header global untuk navigasi cepat.

3.  **Instant Messaging (Secure Chat)**:
    *   **Enkripsi E2EE**: Seluruh pesan teks dienkripsi ujung-ke-ujung menggunakan algoritma **AES-256-GCM** via Web Crypto API.
    *   **Media Sharing**: Support kirim gambar, video (in-app playback), audio (voice note), dan dokumen.
    *   **Layout Adaptif**: Antarmuka 2-kolom pada desktop (30% list, 70% chat) dan gaya WhatsApp pada mobile.
    *   **Fitur Call**: UI terintegrasi untuk Video Call dan Voice Call.
    *   **Privacy Control**: Tombol hapus seluruh data dengan proteksi password (admin/owner).

4.  **Wedding Invitation (Undangan Digital)**:
    *   Pembuat undangan pernikahan digital dengan berbagai pilihan template premium.
    *   **Template Carousel**: Pilihan template menggunakan carousel responsif (Desktop: 4.5 items, Tablet: 3.8, Mobile: 2.1).
    *   **Template Classic**: Desain elegan dengan nuansa tradisional/mewah.
    *   **Template Montain**: Desain modern dengan estetika alam/pegunungan.
    *   Fitur preview langsung dengan scroll vertikal mandiri.

## ✨ Antarmuka Premium & UX

*   **Global App Header**: Header glassmorphism dengan efek `backdrop-filter: blur`, navigasi portal teleport, dan tombol back minimalis.
*   **Tag-Style Dashboard**: Tombol aplikasi di home menggunakan desain "pill-tag" modern dengan ikon ringkas.
*   **Dark Mode Native**: Tema gelap eksklusif yang dioptimalkan untuk kenyamanan mata dan estetika modern.
*   **Smooth Motion**: Animasi bounce dan fade pada modal serta transisi halus antar halaman.

## 🛠️ Tech Stack

*   **Frontend**: Vue 3 (Composition API), Tailwind CSS, Vue Router.
*   **Database**: PouchDB (Browser & Server sync) untuk persistensi data offline-first.
*   **Security**: Web Crypto API (AES-256-GCM) untuk enkripsi chat.
*   **Backend**: Node.js, Express, Express-PouchDB.
*   **WhatsApp Engine**: Baileys (Library koneksi WA socket).
*   **Build Tool**: Vite dengan `vite-plugin-pwa`.

## 📂 Struktur Proyek

```text
PWASupperApps/
├── dist/                # Hasil build produksi (auto-generated)
├── database/            # Database server-side PouchDB (auto-generated)
├── sessions/            # Sesi koneksi WhatsApp (gitignored)
├── public/              # Aset statis & template asset
├── src/
│   ├── client/          # Frontend source code
│   │   ├── views/       # Halaman-halaman aplikasi (Dashboard, Home, dll)
│   │   ├── db.js        # Konfigurasi PouchDB & Sync logic
│   │   └── App.vue      # Entry point Vue dengan Global Header Portal
│   ├── server/          # Backend source code
│   │   ├── baileys.js   # Logic koneksi & pengiriman WhatsApp
│   │   └── worker.js    # Background worker untuk antrian pesan
│   └── template/        # Template Vue untuk undangan digital
├── index.js             # Server utama (Express)
├── vite.config.js       # Konfigurasi PWA & Vite build
└── package.json         # Dependensi & Scripts
```

## ⚙️ Cara Instalasi & Penggunaan

### 1. Persiapan
Pastikan Anda sudah menginstal **Node.js** di sistem Anda.
```bash
# Clone repositori ini
cd PWASupperApps

# Instal dependensi
npm install
```

### 2. Menjalankan Aplikasi
```bash
# Build frontend untuk produksi
npm run build

# Menjalankan server
npm start
```

### 3. Penggunaan
1.  Buka browser ke `http://localhost:3000`.
2.  Pilih modul aplikasi yang diinginkan dari Home Dashboard.
3.  Untuk **Instant Messaging**: Masukkan username pertama kali, cari teman bicara, dan mulai chat terenkripsi.
4.  Untuk **Wedding Invitation**: Telusuri template melalui carousel, pilih, dan pratinjau desain undangan.

## 🔗 Sinkronisasi & Deployment Database

Aplikasi ini menggunakan model **Offline-First**. Data disimpan di browser lokal via PouchDB dan disinkronkan ke server secara real-time.

### 1. Metode Sinkronisasi Default
Secara default, aplikasi ini sudah memiliki server PouchDB terintegrasi (`express-pouchdb`) yang menyimpan data ke folder `/database` (Format LevelDB). Anda hanya perlu menjalankan aplikasi ini di server (VPS) menggunakan **PM2**:
```bash
npm install pm2 -g
pm2 start index.js --name pwa-super-apps
```

### 2. Menggunakan Database Lain (MySQL, PostgreSQL, MongoDB, dll)
PouchDB di sisi server dapat dikonfigurasi untuk menyimpan data ke database Relational atau NoSQL lain menggunakan **Adapters**. Hal ini memungkinkan data chat/WabBlaster tersimpan di tabel database pilihan Anda:

*   **MySQL & PostgreSQL**:
    *   Gunakan library `pouchdb-adapter-mysql` atau `pouchdb-adapter-postgresql`.
    *   Konfigurasi pada `index.js` untuk menggantikan adapter default (LevelDB).
*   **MongoDB**:
    *   Gunakan `pouchdb-adapter-mongodb` untuk performa skala besar.
*   **Oracle/Cloud SQL**:
    *   Mendukung koneksi via adapter SQL standar atau API CouchDB-compatible.

> **Penting**: Sinkronisasi antar user tetap akan menggunakan protokol CouchDB melalui API yang disediakan oleh server ini, apa pun jenis database (MySQL/Mongo) yang digunakan di belakangnya.

### 3. Konfigurasi Hosting (VPS/Cloud)
1.  **CORS**: Pastikan CORS diaktifkan di server agar domain frontend dapat mengakses API database.
2.  **HTTPS**: Wajib menggunakan SSL/HTTPS untuk mendukung fitur enkripsi AES-256 dan akses PWA di browser.
3.  **Reverse Proxy**: Gunakan Nginx atau Apache untuk mengarahkan port `3000` ke domain publik Anda.

## 📱 PWA – Instalasi di Perangkat

Aplikasi ini mendukung fitur PWA sepenuhnya:
*   **Chrome/Edge (Desktop/Android)**: Klik ikon instal di address bar atau menu titik tiga → "Install PWASupperApps".
*   **Safari (iOS)**: Klik ikon Bagikan (Share) → "Tambahkan ke Layar Utama" (Add to Home Screen).
*   **Offline Support**: Aset dan data dasar tetap dapat diakses meskipun tanpa koneksi internet.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
