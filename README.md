# PWASupperApps

**PWASupperApps** adalah platform multi-aplikasi berbasis Progressive Web App (PWA) yang menggabungkan berbagai utilitas produktivitas dalam satu ekosistem. Dibangun menggunakan **Vue 3**, **PouchDB**, dan **Baileys** untuk integrasi WhatsApp yang handal.

## 🚀 Fitur Utama
Aplikasi ini terdiri dari beberapa modul utama yang dapat diakses melalui dashboard terpusat:

1.  **WaBlaster (WhatsApp Blaster)**:
    *   Kirim pesan WhatsApp bulk dengan jeda acak (10-15 detik) untuk menghindari deteksi spam.
    *   Impor kontak dari file VCF (vCard).
    *   Template pesan dinamis (Ucapan Hari Raya, dll).
    *   Sinkronisasi riwayat pengiriman real-time.
2.  **Shortlynk.id**: Utilitas untuk pemendekan tautan (Short link).
3.  **Instant Messaging**: Fitur chat cepat.
4.  **Wedding Invitation (Undangan Digital)**:
    *   Pembuat undangan pernikahan digital dengan berbagai pilihan template premium.
    *   **Template Classic**: Desain elegan dengan nuansa tradisional/mewah.
    *   **Template Montain**: Desain modern dengan estetika alam/pegunungan.
    *   Fitur preview langsung sebelum publikasi.

## 🛠️ Tech Stack
*   **Frontend**: Vue 3 (Composition API), Tailwind CSS, Vue Router.
*   **Database**: PouchDB (Browser & Server sync) untuk persistensi data offline-first.
*   **Backend**: Node.js, Express.
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
│   │   └── App.vue      # Entry point Vue
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
3.  Untuk **WaBlaster**:
    *   Scan QR code yang muncul di layar menggunakan WhatsApp (Linked Devices).
    *   Tambah kontak secara manual atau impor file VCF.
    *   Tulis pesan atau pilih template, lalu klik kirim.
4.  Untuk **Wedding Invitation**:
    *   Pilih template (Classic/Montain).
    *   Lihat preview hasil desain.

## 📱 PWA – Instalasi di Perangkat
Aplikasi ini mendukung fitur PWA sepenuhnya:
*   **Chrome/Edge (Desktop/Android)**: Klik ikon instal di address bar atau menu titik tiga → "Install PWASupperApps".
*   **Safari (iOS)**: Klik ikon Bagikan (Share) → "Tambahkan ke Layar Utama" (Add to Home Screen).
*   **Offline Support**: Aset dan data dasar tetap dapat diakses meskipun tanpa koneksi internet.

---
**Author**: [denisusanto94@gmail.com](mailto:denisusanto94@gmail.com)  
**Tahun**: 2026
