<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\WilayahModel;
use Illuminate\Support\Facades\Cache;

class PengaturanController extends Controller
{
    // Ubah lokasi aplikasi

    public function perbaruiWilayah(Request $request)
    {
        $request->validate([
            'wilayah' => ['required', 'exists:wilayah,id'],
        ]);

        $wilayah = WilayahModel::findOrFail($request->wilayah);

        $settings = [
            'id' => $wilayah->id,
            'nama_wilayah' => $wilayah->nama_wilayah,
            'kode_wilayah' => $wilayah->kode_wilayah,
        ];

        File::put(
            storage_path('app/settings.json'),
            json_encode(
                $settings,
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            )
        );
        Cache::forget('settings');
        Cache::forget('wilayah:list');

        return redirect()
            ->back()
            ->with('success', 'Wilayah operasi berhasil diperbarui.');
    }
}
