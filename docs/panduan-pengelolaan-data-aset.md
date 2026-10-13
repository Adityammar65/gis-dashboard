# Panduan Pengelolaan Data Aset

Dokumen ini menjelaskan langkah menambah, melihat, mengubah, dan menghapus data **Tiang** serta **ONT**, termasuk pengisian koordinat geografis dan pengunggahan foto. Alur keduanya sama; perbedaannya hanya pada nama kode (`kode_tiang` / `kode_ont`) dan deskripsi.

## 1. Menambah Data Baru

1. Buka **Data Tiang** (atau **Data ONT**), lalu tekan tombol **Tambah**.
2. Isi kolom formulir berikut (seluruhnya wajib):
   - **Kode**: terisi otomatis dengan format `SIMS-{kode_wilayah}-{nomor}` (contoh `SIMS-YGY-001`) berdasarkan wilayah yang dipilih; kode harus unik.
   - **Wilayah**: pilih dari daftar wilayah yang terdaftar.
   - **Kecamatan dan Kelurahan**: ketik untuk memunculkan saran dari layanan data wilayah; bila saran tidak muncul (gangguan API), isi secara manual.
   - **Deskripsi**: keterangan kondisi atau ciri aset.
   - **Koordinat**: isi **Latitude** (-90 sampai 90) dan **Longitude** (-180 sampai 180) dengan salah satu cara:
     - klik langsung titik lokasi pada peta mini, lalu tekan **Tentukan Lokasi**;
     - ketik alamat pada kolom pencarian peta (misalnya nama jalan atau kelurahan), pilih salah satu hasil (maksimal 5 dari wilayah Indonesia), lalu tekan **Tentukan Lokasi**;
     - ketik angka secara manual pada kolom latitude/longitude (koma otomatis dibaca sebagai titik desimal).
   - **Foto 1–5**: unggah lima foto berekstensi `jpg`, `jpeg`, `png`, atau `webp`, masing-masing maksimal 5 MB. Sistem otomatis mengonversi foto menjadi format WebP yang dioptimalkan.
   - **Nama Petugas**: nama petugas lapangan pendata.
   - **Status**: `Aktif` atau `Nonaktif`.
3. Tekan **Simpan**. Bila ada kolom yang belum valid, pesan kesalahan berbahasa Indonesia akan muncul di bawah kolom terkait dan isian tidak hilang.
4. Data yang berhasil disimpan tercatat pada halaman Notifikasi (misalnya *Data Tiang berhasil ditambahkan* beserta rincian datanya).

## 2. Melihat Data

- **Tabel**: setiap halaman menampilkan 15 baris. Saring berdasarkan wilayah, status, kecamatan, kelurahan, atau gunakan kolom pencarian (mencakup kode, wilayah, area, dan petugas).
- **Detail**: tekan ikon mata untuk membuka halaman Detail berisi galeri lima foto, informasi wilayah/area/petugas/status/koordinat/deskripsi, peta lokasi tunggal, dan tombol **Buka di Google Maps**.
- **Ekspor**: tombol ekspor pada tiap halaman tabel mengunduh PDF atau Excel **mengikuti penyaring yang sedang aktif**, dengan dua cakupan: halaman yang sedang dibuka atau seluruh data hasil saringan.

## 3. Mengubah Data

1. Pada tabel, tekan ikon pena pada baris yang dimaksud (atau tombol **Edit Data** di halaman Detail).
2. Kode dapat diubah selama tidak dipakai aset lain; wilayah, area, deskripsi, koordinat, petugas, dan status dapat disesuaikan.
3. **Foto**: setiap slot foto dapat (a) dibiarkan, (b) diganti dengan mengunggah foto baru, atau (c) dikosongkan melalui penanda hapus — foto lama dihapus dari penyimpanan saat penggantian/pengosongan berhasil.
4. Tekan **Simpan**. Notifikasi mencatat data sebagai *Diperbarui* lengkap dengan daftar kolom yang berubah (misalnya `- Status: Aktif → Nonaktif`).

## 4. Menghapus Data

1. Tekan ikon tong sampah pada baris (atau tombol **Hapus Data** di halaman Detail), lalu konfirmasi pada dialog yang muncul.
2. Data beserta seluruh berkas fotonya dihapus permanen dan tercatat pada Notifikasi sebagai *Dihapus*.

## 5. Catatan Khusus Wilayah

- Tambah wilayah memerlukan **nama wilayah** dan **kode wilayah** yang unik (kode dipakai untuk pembentukan kode aset otomatis, contoh `YGY`).
- Hapus wilayah **ditolak sistem** bila wilayah tersebut masih memiliki data Tiang atau ONT; hapus atau pindahkan data terkait terlebih dahulu.
