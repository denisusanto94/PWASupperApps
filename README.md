# PWASupperApps

Proyek monorepo: Vue 3 + PWA + PouchDB + Baileys (WhatsApp).

## Struktur

```
PWASupperApps/
├── dist/                # Hasil build Vue (auto-generated)
├── database/            # Penyimpanan fisik PouchDB (auto-generated)
├── sessions/            # Sesi WhatsApp Baileys (gitignored)
├── src/
│   ├── client/          # Frontend: Vue 3 + PouchDB Browser
│   │   ├── db.js        # Konfigurasi PouchDB & Sync
│   │   └── App.vue      # Dashboard Utama
│   └── server/          # Backend: Baileys + Worker
│       ├── baileys.js   # Koneksi & Fungsi Kirim WA
│       └── worker.js    # PouchDB Changes Listener
├── index.js             # Server Utama (Express)
├── vite.config.js       # Config PWA & Build
└── package.json
```

## Scripts

- **`npm run build`** – Build Vue (output ke `dist/`)
- **`npm start`** – Jalankan server di http://localhost:3000

## Cara pakai

1. `npm install`
2. `npm run build`
3. `npm start`
4. Buka http://localhost:3000
5. Scan QR dengan WhatsApp (WhatsApp → Linked Devices)
6. Isi nomor (satu per baris) dan template pesan, lalu **Tambah ke antrian**
7. Worker mengirim dengan jeda acak 10–15 detik per nomor

## PWA – Simpan & Install

- Data disimpan di **IndexedDB** (browser) dan sinkron ke server.
- Untuk **install / Tambah ke Layar Utama**:
  - **Chrome/Edge:** ikon instal di address bar atau menu (⋮) → “Install PWASupperApps” / “Tambah ke Layar Awal”.
  - **Safari (iOS):** Bagikan → “Tambahkan ke Layar Utama”.
- Setelah terpasang, aplikasi bisa dibuka seperti app standalone dan di-cache untuk dipakai offline (halaman dan aset).

## Catatan

- Sesi Baileys disimpan di folder `sessions/` (jangan di-commit).
- Riwayat pengiriman dan status koneksi terupdate real-time lewat PouchDB sync.
