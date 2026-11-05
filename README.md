# Hadir — Absensi Tracker

Aplikasi absensi empat slot berbasis Next.js untuk pekerja, HC Admin, dan Superadmin. Autentikasi memakai Supabase, akses dilindungi RBAC, laporan menggunakan XLSX, dan Vercel Analytics aktif di root layout.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Halaman pekerja tersedia di `/employee`, halaman HC di `/hc`, dan login demo di `/login`.

## Konfigurasi produksi

1. Jalankan migration di `supabase/migrations` secara berurutan pada database Supabase.
2. Isi variabel dari `.env.example` melalui penyedia deployment. Jangan expose `CLOUDINARY_API_SECRET` ke client.
3. Isi environment seed dari `.env.example`, lalu jalankan `npm run seed:production` untuk membuat satu akun Superadmin dan satu Employee secara idempotent. Jangan memasukkan password ke repository.
4. Deploy ke host HTTPS agar Camera dan Geolocation API dapat digunakan.

## Validasi

```bash
npm test
npm run lint
npm run build
```

RBAC: Employee hanya mengakses data sendiri; HC Admin dapat mengelola kehadiran, izin, lokasi, dan ekspor; hanya Superadmin yang dapat mengelola akun dan menghapus data. Endpoint ekspor menghasilkan workbook `.xlsx` dari data Supabase dan hanya tersedia untuk HC Admin/Superadmin.
