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

## 🛠️ Tutorial Lengkap: Deployment & Sinkronisasi Server

Ikuti langkah-langkah di bawah ini untuk memindahkan aplikasi dari lokal ke server produksi (VPS).

### Bagian 1: Persiapan Server (VPS)
Gunakan VPS dengan OS Ubuntu 20.04/22.04. Login via SSH dan jalankan:
```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instal Node.js (v18+) & Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git
```

### Bagian 2: Deploy Aplikasi (Frontend & Backend)
1. **Clone project ke server**:
   ```bash
   git clone https://github.com/denisusanto94/PWASupperApps.git
   cd PWASupperApps
   ```
2. **Instal dependensi & Build**:
   ```bash
   npm install
   npm run build  # Menghasilkan folder /dist
   ```
3. **Jalankan aplikasi dengan PM2** (agar tetap hidup 24/7):
   ```bash
   sudo npm install pm2 -g
   pm2 start index.js --name pwa-super-apps
   pm2 save
   pm2 startup
   ```

### Bagian 3: Konfigurasi CouchDB (Opsional untuk Skala Besar)
Jika Anda ingin menggunakan database CouchDB native sebagai pusat sinkronisasi:

1. **Instal CouchDB**:
   ```bash
   sudo apt install -y couchdb
   ```
   *Pilih mode 'standalone' dan set password admin saat instalasi.*

2. **Penting: Konfigurasi CORS** (agar browser bisa akses):
   Buka dashboard CouchDB (Fauxton) di `http://IP-SERVER:5984/_utils` atau edit `local.ini`:
   ```ini
   [httpd]
   enable_cors = true

   [cors]
   origins = *
   methods = GET, POST, PUT, DELETE, OPTIONS
   credentials = true
   ```

3. **Ganti URL Database di Frontend**:
   Buka file `src/client/db.js` dan ubah konstanta `remoteDb`:
   ```javascript
   const remoteDb = new PouchDB('https://user:pass@domain-anda.com/db_name');
   ```

### Bagian 4: Pengaturan Domain & SSL (Nginx)
Aplikasi PWA & Enkripsi AES-256 **WAJIB menggunakan HTTPS**.

1. **Instal Nginx**:
   ```bash
   sudo apt install nginx
   ```
2. **Konfigurasi Reverse Proxy**:
   Buat file `/etc/nginx/sites-available/pwasupperapps`:
   ```nginx
   server {
       server_name domain-anda.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. **Pasang SSL (Certbot)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d domain-anda.com
   ```

---
**Catatan**: Seluruh data yang mengalir antar perangkat akan otomatis ter-sinkronisasi melalui API server yang telah Anda pasang di atas.

## 📱 PWA – Instalasi di Perangkat

Aplikasi ini mendukung fitur PWA sepenuhnya:
*   **Chrome/Edge (Desktop/Android)**: Klik ikon instal di address bar atau menu titik tiga → "Install PWASupperApps".
*   **Safari (iOS)**: Klik ikon Bagikan (Share) → "Tambahkan ke Layar Utama" (Add to Home Screen).
*   **Offline Support**: Aset dan data dasar tetap dapat diakses meskipun tanpa koneksi internet.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
