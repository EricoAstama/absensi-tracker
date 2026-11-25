# Presentasi use case Hadir

Presentasi 8 slide ini merangkum halaman utama Karyawan dan HR/HC berdasarkan route aplikasi dan screenshot dari server lokal. Tampilan HC diambil menggunakan akun seed Superadmin karena akun seed HC Admin tidak tersedia. Hak kelola lokasi dan akun pada slide terakhir hanya berlaku untuk Superadmin.

Nama, email, dan detail lokasi dari data operasional disamarkan pada screenshot HC. Screenshot halaman persetujuan menampilkan keadaan kosong pada saat pengambilan; alur setuju/tolak dijelaskan berdasarkan fitur halaman.

## Menjalankan Slidev

```bash
cd docs/presentation
npm ci
npm run dev
```

## Mengekspor PDF

```bash
cd docs/presentation
npm run export
```

Perintah ekspor memakai Chromium sistem di `/usr/bin/chromium` dan menghasilkan `use-case-absensi.pdf` di folder ini. Pada mesin dengan lokasi Chromium berbeda, jalankan `npx slidev export slides.md --output use-case-absensi.pdf --executable-path /path/ke/chromium`.
