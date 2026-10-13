# Panduan Penggunaan Aplikasi (User Manual)

Dokumen ini menjelaskan cara menggunakan aplikasi Dashboard GIS, mulai dari masuk (login), navigasi menu, pengelolaan data, penggunaan peta, hingga notifikasi.

## 1. Masuk ke Aplikasi (Login)

1. Buka halaman login aplikasi di peramban.
2. Isi **Username** dan **Password**, lalu tekan tombol **Masuk**.
3. Centang **Ingat Saya** bila ingin tetap masuk otomatis di perangkat tersebut (berlaku 30 hari).
4. Akun bawaan setelah instalasi:
   - Username: `admin`
   - Password: `password`
5. Untuk keluar, gunakan menu **Keluar** (ikon keluar di bilah samping atau menu profil). Seluruh sesi dan fitur ingat-saya akun tersebut akan dimatikan.

> Seluruh halaman selain Login dan Lupa Password hanya dapat dibuka setelah masuk. Pengguna yang belum masuk akan otomatis diarahkan ke halaman Login.

## 2. Lupa Password

1. Pada halaman Login, klik tautan **Lupa password?**.
2. Isi username yang terdaftar, kata sandi baru (minimal 8 karakter), dan konfirmasinya, lalu kirim.
3. Permintaan **tidak langsung berlaku** — permintaan menunggu persetujuan admin dan hanya hash kata sandi yang disimpan sistem.
4. Admin menyetujui atau menolak melalui kartu **Persetujuan Reset Kata Sandi** di halaman Pengaturan, atau langsung dari halaman Detail Notifikasi terkait.
5. Aturan: permintaan untuk satu username hanya dapat menunggu satu dalam satu waktu, dan admin tidak dapat menyetujui permintaan akunnya sendiri.

## 3. Navigasi Menu

| Menu | Fungsi |
|---|---|
| Beranda | Ringkasan angka (rekapitulasi), peta pratinjau, dan 5 pembaruan aset terbaru |
| Data Tiang | Tabel, pencarian, penyaringan, dan pengelolaan data Tiang |
| Data ONT | Tabel, pencarian, penyaringan, dan pengelolaan data ONT |
| Data Wilayah | Rekapitulasi per wilayah serta tambah/hapus wilayah |
| Peta Sebaran Aset | Peta layar penuh berisi lokasi seluruh aset |
| Notifikasi | Daftar pemberitahuan aktivitas (lengkap dengan penanda belum dibaca) |
| Pengaturan | Wilayah operasi, profil akun, persetujuan reset, dan tema tampilan |

Kolom pencarian di bilah atas berfungsi sebagai **pencarian global**: ketik minimal 2 huruf untuk mencari kode aset, wilayah, kecamatan, kelurahan, atau nama petugas. Hasil yang cocok pada kode akan membuka halaman detail aset; hasil wilayah/area akan membuka halaman data yang sudah tersaring.

## 4. Pengelolaan Data Tiang dan ONT (ringkas)

- Buka **Data Tiang** atau **Data ONT**.
- Gunakan penyaring wilayah, status, kecamatan, kelurahan, atau kolom pencarian teks.
- Tombol **Tambah** membuka formulir data baru; ikon **tatapan/mata** membuka detail; ikon **pena** membuka formulir ubah; ikon **tong sampah** menghapus data (dengan konfirmasi).
- Setiap halaman tabel menampilkan 15 baris per halaman dan tombol **Ekspor** PDF/Excel yang mengikuti penyaring yang sedang aktif.
- Detail langkah tercantum pada *Panduan Pengelolaan Data Aset*.

## 5. Pengelolaan Wilayah (ringkas)

- Buka **Data Wilayah** untuk melihat rekapitulasi tiap wilayah (total Tiang, total ONT, total aset, aktif, nonaktif).
- Tombol tambah digunakan untuk mendaftarkan wilayah baru (nama dan kode wilayah, keduanya unik).
- Wilayah yang masih memiliki data Tiang atau ONT **tidak dapat dihapus**; pindahkan atau hapus data terkait terlebih dahulu.
- Detail langkah tercantum pada *Panduan Pengelolaan Data Aset*; pengaruh wilayah operasi dijelaskan pada *Panduan Pengaturan Wilayah Operasi*.

## 6. Penggunaan Peta (ringkas)

- Buka **Peta Sebaran Aset**: pilih jenis aset (Tiang/ONT), status (Aktif/Nonaktif), dan wilayah untuk menyaring penanda.
- Penanda **hijau** berarti aktif, **merah** berarti nonaktif. Klik penanda untuk melihat ringkasan dan tautan ke halaman detail.
- Tersedia legenda, statistik jumlah penanda yang tampil, koordinat kursor terkini, dan tombol penyesuai bingkai peta.
- Pada halaman Detail Tiang/ONT tersedia tombol **Buka di Google Maps** untuk melihat lokasi di aplikasi peta luar.
- Detail langkah tercantum pada *Panduan Penggunaan Peta Sebaran Aset*.

## 7. Notifikasi (ringkas)

- Ikon lonceng menampilkan jumlah notifikasi yang belum dibaca.
- Buka **Notifikasi** untuk melihat daftar; baris berpenanda merah berarti belum dibaca dan otomatis menjadi terbaca saat halaman detailnya dibuka.
- Tombol **Tandai semua dibaca** dan **Hapus yang dibaca** tersedia di bagian atas daftar.
- Detail langkah tercantum pada *Panduan Notifikasi dan Rekapitulasi*.

## 8. Pengaturan (ringkas)

Halaman Pengaturan memuat: pemilihan **wilayah operasi**, manajemen **profil** (ubah username dan kata sandi melalui persetujuan), kartu **Persetujuan Reset Kata Sandi**, dan pilihan **tema tampilan** Terang/Gelap yang tersimpan per perangkat. Detail masing-masing tercantum pada panduan terkait.
