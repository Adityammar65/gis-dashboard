# Dokumentasi Teknis Sistem

Dokumen ini ditujukan bagi pengembang: arsitektur aplikasi, teknologi, struktur basis data, konfigurasi lingkungan, dan pemeliharaan sistem.

## 1. Arsitektur Aplikasi

- **Backend**: Laravel 12 (pola MVC). Rute web didefinisikan di `routes/web.php`; logika di `app/Http/Controllers/` (misalnya `HalamanController` untuk halaman, `Tiang/ONT/WilayahController` untuk CRUD, `EksporController`, `WilayahApiController`, `SetelUlangKataSandiController`, `ProfilController`, `PengaturanController`, `AutentikasiController`, `FormulirController`).
- **Frontend**: React + Inertia.js 3 (tanpa API JSON terpisah kecuali endpoint `/api/*` untuk pencarian, kode berikutnya, dan data regions). Halaman di `resources/js/Pages/`, komponen di `resources/js/Components/`, kait di `resources/js/Hooks/`, tata letak di `resources/js/Layouts/`. Build oleh Vite ke `public/build`.
- **Peta**: Leaflet + React-Leaflet dengan tile OpenStreetMap; pencarian alamat memakai Nominatim (dibatasi kode negara Indonesia).
- **Autentikasi**: sesi Laravel + middleware `cek_login` (`CekLogin`); dukungan Ingat Saya via cookie `gis_remember` (token hash SHA-256 di kolom `remember_token`, 30 hari). Props bersama Inertia (`pengaturan`, `auth`, `errors`, `flash`, `notifikasiBelumDibaca`) disediakan `HandleInertiaRequests` dan `AppServiceProvider`.
- **Konfigurasi dinamis**: `storage/app/settings.json` (`{id, nama_wilayah, kode_wilayah}`) dibaca dengan tembolok 3600 detik; dibuat via `php artisan settings:generate` atau disimpan dari halaman Pengaturan.
- **File**: foto disimpan di disk `public` (`tiang/`, `ont/`, memerlukan `php artisan storage:link`), dikonversi ke WebP oleh `ImageService` (CLI `cwebp`/ImageMagick; lihat `config/image.php`).

## 2. Teknologi yang Digunakan

| Lapisan | Teknologi |
|---|---|
| Bahasa backend | PHP ^8.2 (ekstensi `gd`, `mbstring`, `pdo_mysql`, `fileinfo`, `openssl`) |
| Framework backend | Laravel ^12.0, Inertia Laravel ^3.3 |
| Pustaka backend | `barryvdh/laravel-dompdf` ^3.1 (PDF), `phpoffice/phpspreadsheet` ^5.10 (Excel), dev: PHPUnit ^11.5, Pint, Pail, Sail |
| Frontend | React + `@inertiajs/react` ^3.7, Vite ^7, Tailwind CSS ^4.3 (+ plugin Vite), `axios`, `react-icons` |
| Peta | `leaflet` ^1.9.4, `react-leaflet` ^5.0 |
| Basis data | MySQL (driver `pdo_mysql`); tembolok dan antrean memakai database (`CACHE_STORE=database`, `QUEUE_CONNECTION=database`) |
| Perkakas | Composer 2.x, Node.js 20+ & npm 9+, Git |

## 3. Struktur Basis Data

Migrasi di `database/migrations/`. Tidak ada foreign key basis data; relasi bersifat logis (kolom string `wilayah` merujuk `nama_wilayah`).

| Tabel | Kolom kunci |
|---|---|
| `user` | `username` (unik), `password` (hash), `remember_token`, timestamps |
| `tiang` | `kode_tiang` (unik), `wilayah`, `kecamatan`, `kelurahan`, `deskripsi_tiang`, `foto_tiang_1..5` (dapat null), `latitude`, `longitude`, `nama_petugas`, `updated_by`, `status` (`aktif`/`nonaktif`, bawaan `aktif`) |
| `ont` | Sama seperti `tiang` dengan prefix `kode_ont`/`deskripsi_ont`/`foto_ont_*` |
| `wilayah` | `nama_wilayah`, `kode_wilayah` (unik) |
| `notifikasi` | `jenis`, `kategori`, `status` (`belum_dibaca`/`dibaca`), `pesan`, `updated_by`, `reset_request_id` (dapat null) |
| `request_perubahan_akun` | `password_baru` (dapat null untuk ubah username), `tipe_request` (`password_reset`/`password_change`/`username_change`), `requested_by`, `username_baru`, `status` (`pending`/`approved`/`rejected`), `requested_ip`, `handled_by`, `handled_at` |

Indeks tambahan (migrasi `add_performance_indexes`) mencakup kolom yang sering disaring. Seeder bawaan (`DatabaseSeeder` → `UserSeeder`, `WilayahSeeder`, `TiangSeeder`, `OntSeeder`) membuat akun `admin`/`password` dan data contoh (foto contoh berupa string placeholder `tiang/dummy.jpg`, `ont/dummy.jpg`).

## 4. Konfigurasi Lingkungan Pengembangan

1. Salin `.env.example` menjadi `.env`, isi `APP_KEY` (`php artisan key:generate`), dan sesuaikan `DB_*` (bawaan `DB_DATABASE=gis_database`, MySQL `127.0.0.1:3306`).
2. Kunci `.env` yang berpengaruh: `APP_URL` (mendukung subfolder, dibantu `useBase` di frontend), `SESSION_DRIVER=file`, `FILESYSTEM_DISK=local`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`, `MAIL_MAILER=log`, serta `IMAGE_MAX_LONGEST_SIDE=1600`, `IMAGE_WEBP_QUALITY=85`, `IMAGE_DISK=public`, `IMAGE_PRESERVE_METADATA=true`, `IMAGE_SHARP_YUV=true`, `IMAGE_METHOD=4` (lihat `config/image.php`).
3. Alur siap jalan: `composer install` → `npm install` → `migrate --seed` → `storage:link` → `settings:generate` (atur izin tulis `storage/app/settings.json`) → `npm run build` (atau `npm run dev` + `php artisan serve` / `composer run dev` untuk pengembangan).
4. Direktori yang wajib dapat ditulis: `storage/`, `bootstrap/cache/`, `storage/app/public/`.

## 5. Petunjuk Pemeliharaan Sistem

- **Rutin**: jalankan `php artisan queue:listen` bila memakai antrean database; pantau log `storage/logs/`; cadangkan database MySQL dan direktori `storage/app/public/` (foto) secara berkala.
- **Ubah perilaku**: aturan validasi dan pesan kesalahan ada di masing-masing controller (`Tiang/ONT/Wilayah/Profil/SetelUlangKataSandiController`); teks notifikasi terpusat di `NotifikasiHelper`; batas foto/kualitas gambar via `.env` + `config/image.php` (perlu CLI `cwebp` atau ImageMagick terinstal).
- **Uji dan mutu**: `composer test` (PHPUnit; konfigurasi `phpunit.xml`), `npm run build` untuk memastikan frontend lolos kompilasi; oportunidades: cakupan uji saat ini minimal sehingga perubahan logika CRUD/ekspor sebaiknya diuji manual (tambah–ubah–hapus–ekspor–peta).
- **Rilis**: lakukan `npm run build` sebelum deploy agar `public/build` terkini; pastikan `APP_ENV=production`, `APP_DEBUG=false`, dan `APP_KEY` terisi di server.
