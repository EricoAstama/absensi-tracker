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

RBAC: Employee hanya mengakses data sendiri; HC Admin dapat mengelola kehadiran, izin, dan ekspor; hanya Superadmin yang dapat mengelola akun serta lokasi dan menghapus data. Endpoint ekspor menghasilkan workbook `.xlsx` dari data Supabase dan hanya tersedia untuk HC Admin/Superadmin.

## Mengelola akun Employee dan HC Admin

Superadmin dapat membuka **Pengaturan → Akun pengguna** untuk menambah Employee atau HC Admin, mengubah profil dan role, mereset password, atau menghapus akun. Saat membuat akun, tombol **Buat otomatis** menghasilkan password yang kuat. Setelah akun dibuat, salin kredensial yang ditampilkan dan bagikan kepada pengguna melalui kanal yang aman. Akun langsung dapat login tanpa perlu membuka dashboard Supabase. Penghapusan Employee juga menghapus presensi dan pengajuan yang terkait.

Pada halaman yang sama, Superadmin dapat menambah, mengubah, mengaktifkan/nonaktifkan, dan menghapus lokasi kantor beserta koordinat dan radius geofencing.

Fitur ini memakai `SUPABASE_SERVICE_ROLE_KEY` hanya di API server. Variabel tersebut wajib tersedia pada environment deployment dan tidak boleh memakai awalan `NEXT_PUBLIC_`. HC Admin dapat melihat daftar akun, tetapi endpoint akan menolak pengelolaan akun selain dari Superadmin. API hanya menerima role `employee` dan `hc_admin`, sehingga akun Superadmin tidak dapat dibuat atau diubah melalui halaman ini.

## CI migration Supabase

Workflow `.github/workflows/supabase-migrations.yml` otomatis menjalankan migration baru ketika file di `supabase/migrations` berubah pada branch `main`.

Tambahkan tiga GitHub Actions secrets pada repository atau environment `production`:

- `SUPABASE_ACCESS_TOKEN` — dibuat dari Supabase Account → Access Tokens.
- `SUPABASE_PROJECT_REF` — ID proyek dari URL `https://<project-ref>.supabase.co`.
- `SUPABASE_DB_PASSWORD` — password database proyek, bukan service-role key.

Karena migration `0001`–`0004` pertama kali dijalankan lewat SQL Editor, buka GitHub → Actions → **Supabase production migrations** → **Run workflow**, aktifkan `baseline_existing`, lalu jalankan satu kali. Workflow akan menandai empat migration tersebut sebagai applied dan memverifikasi bahwa tidak ada SQL lama yang dijalankan ulang. Push migration berikutnya ke `main` akan diterapkan otomatis setelah dry run berhasil.
