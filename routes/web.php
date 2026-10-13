<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutentikasiController;
use App\Http\Controllers\EksporController;
use App\Http\Controllers\FormulirController;
use App\Http\Controllers\ONTController;
use App\Http\Controllers\HalamanController;
use App\Http\Controllers\SetelUlangKataSandiController;
use App\Http\Controllers\WilayahApiController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\TiangController;
use App\Http\Controllers\WilayahController;

// Autentikasi

Route::get('/login', [HalamanController::class, 'Masuk']);
Route::post('/proses-login', [AutentikasiController::class, 'ProsesLogin']);
Route::get('/logout', [AutentikasiController::class, 'Keluar']);
Route::get('/lupa-password', [HalamanController::class, 'LupaPassword']);
Route::post('/reset-request', [SetelUlangKataSandiController::class, 'ajukan'])->middleware('throttle:5,1');
Route::get('/panduan', [HalamanController::class, 'Panduan']);

// Rute Terlindungi

Route::middleware('cek_login')->group(function () {

    // Navigasi

    Route::get('/', fn() => redirect('home'));
    Route::get('/home', [HalamanController::class, 'Beranda']);
    Route::get('/data-tiang', [HalamanController::class, 'DataTiang']);
    Route::get('/data-ont', [HalamanController::class, 'DataONT']);
    Route::get('/api/search', [HalamanController::class, 'Cari']);
    Route::get('/api/next-kode', [HalamanController::class, 'KodeBerikutnya']);
    Route::get('/api/regions/current/kecamatan', [WilayahApiController::class, 'kecamatanSaatIni']);
    Route::get('/api/regions/kabupaten/{kode}/kecamatan', [WilayahApiController::class, 'kecamatanBerdasarkanKabupaten']);
    Route::get('/api/regions/kecamatan/{code}/kelurahan', [WilayahApiController::class, 'kelurahanBerdasarkanKecamatan']);
    Route::get('/Peta', [HalamanController::class, 'Peta']);
    Route::get('/wilayah', [HalamanController::class, 'Wilayah']);
    Route::get('/peta-sebaran-aset', [HalamanController::class, 'PetaSebaranAset']);
    Route::get('/detail-tiang/{id}', [HalamanController::class, 'DetailTiang']);
    Route::get('/detail-ont/{id}', [HalamanController::class, 'DetailONT']);
    Route::get('/notifikasi', [HalamanController::class, 'Notifikasi']);
    Route::get('/detail-notifikasi/{id}', [HalamanController::class, 'DetailNotifikasi']);
    Route::post('/notifikasi/baca-semua', [HalamanController::class, 'TandaiSemuaDibaca']);
    Route::delete('/notifikasi/hapus-dibaca', [HalamanController::class, 'HapusSudahDibaca']);
    Route::get('/pengaturan', [HalamanController::class, 'Pengaturan']);

    // Formulir

    Route::get('/tambah-tiang', [FormulirController::class, 'TambahTiang']);
    Route::get('/tambah-ont', [FormulirController::class, 'TambahONT']);
    Route::get('/tambah-wilayah', [FormulirController::class, 'TambahWilayah']);
    Route::get('/edit-tiang/{id}', [FormulirController::class, 'EditTiang']);
    Route::get('/edit-ont/{id}', [FormulirController::class, 'EditONT']);

    // Pengaturan

    Route::post('/update-pengaturan', [PengaturanController::class, 'perbaruiWilayah']);

    // Profil

    Route::post('/update-profil', [AutentikasiController::class, 'perbaruiProfil'])->middleware('throttle:5,1');
    Route::post('/update-profil/username', [AutentikasiController::class, 'perbaruiUser'])->middleware('throttle:5,1');
    Route::post('/update-profil/password', [AutentikasiController::class, 'perbaruiKataSandi'])->middleware('throttle:5,1');

    // Persetujuan Setel Ulang Kata Sandi

    Route::post('/reset-requests/{id}/approve', [SetelUlangKataSandiController::class, 'setujui']);
    Route::post('/reset-requests/{id}/reject', [SetelUlangKataSandiController::class, 'tolak']);

    // Kelola Tiang

    Route::post('/simpan-tiang', [TiangController::class, 'SimpanTiang']);
    Route::post('/update-tiang/{id}', [TiangController::class, 'PerbaruiTiang']);
    Route::get('/hapus-tiang/{id}', [TiangController::class, 'HapusTiang']);

    // Kelola ONT

    Route::post('/simpan-ont', [ONTController::class, 'SimpanONT']);
    Route::post('/update-ont/{id}', [ONTController::class, 'PerbaruiONT']);
    Route::get('/hapus-ont/{id}', [ONTController::class, 'HapusONT']);

    // Kelola Wilayah

    Route::post('/simpan-wilayah', [WilayahController::class, 'SimpanWilayah']);
    Route::get('/hapus-wilayah/{id}', [WilayahController::class, 'HapusWilayah']);

    // Ekspor

    Route::get('/export/aset/{type}/{format}', [EksporController::class, 'aset'])
        ->whereIn('type', ['tiang', 'ont'])
        ->whereIn('format', ['pdf', 'excel']);
});
