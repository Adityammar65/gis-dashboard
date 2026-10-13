# Panduan Pengaturan Wilayah Operasi

Dokumen ini menjelaskan cara memilih wilayah operasi dan pengaruh pilihan tersebut terhadap penggunaan aplikasi, sesuai implementasi sistem.

## 1. Memilih Wilayah Operasi

1. Buka halaman **Pengaturan**.
2. Pada kartu wilayah operasi, pilih salah satu wilayah dari daftar, lalu tekan **Simpan**.
3. Pilihan tersimpan pada berkas `storage/app/settings.json` dalam bentuk `{id, nama_wilayah, kode_wilayah}` dan berlaku untuk seluruh pengguna aplikasi (bukan per akun).
4. Pilihan awal dapat dibuat melalui perintah `php artisan settings:generate` (wilayah bawaan dari proses instalasi).

## 2. Pengaruh Terhadap Aplikasi

Wilayah operasi yang dipilih memengaruhi bagian berikut:

- **Beranda**: angka statistik dan peta pratinjau hanya menghitung aset pada wilayah terpilih. Bila belum ada wilayah yang dipilih, Beranda menampilkan ajakan menentukan wilayah terlebih dahulu.
- **Pembuatan kode aset**: kode otomatis memakai kode wilayah operasi (`SIMS-{kode_wilayah}-{nomor}`).
- **Formulir aset**: daftar kecamatan acuan pada formulir mengikuti kabupaten dari wilayah operasi.
- Pilihan dibaca ulang maksimal setiap 1 jam (tembolok 3600 detik); perubahan umumnya langsung terasa setelah menyimpan ulang pilihan.

## 3. Mengelola Daftar Wilayah

- **Menambah**: gunakan tombol tambah di halaman Data Wilayah; isi nama wilayah dan kode wilayah (keduanya harus unik).
- **Mengubah nama/kode**: tidak tersedia melalui antarmuka; hapus dan daftarkan ulang bila diperlukan (perhatikan aturan hapus di bawah).
- **Menghapus**: tekan ikon hapus pada baris wilayah. Sistem menolak penghapusan bila wilayah masih memiliki data Tiang atau ONT, disertai pesan yang menyebutkan jumlah data terkait. Hapus atau pindahkan data tersebut terlebih dahulu, kemudian ulangi.
