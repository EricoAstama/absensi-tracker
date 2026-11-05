# Hadir — Absensi Tracker

Aplikasi absensi empat slot berbasis Next.js untuk pekerja dan HC Admin. UI dapat langsung dijalankan dalam demo mode; konfigurasi Supabase dan Cloudinary mengaktifkan integrasi produksi.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Halaman pekerja tersedia di `/employee`, halaman HC di `/hc`, dan login demo di `/login`.

## Konfigurasi produksi

1. Jalankan `supabase/migrations/0001_initial.sql` di Supabase SQL Editor.
2. Isi variabel dari `.env.example` melalui penyedia deployment. Jangan expose `CLOUDINARY_API_SECRET` ke client.
3. Buat pengguna di Supabase Auth dan record `profiles` terkait.
4. Deploy ke host HTTPS agar Camera dan Geolocation API dapat digunakan.

## Validasi

```bash
npm test
npm run lint
npm run build
```
