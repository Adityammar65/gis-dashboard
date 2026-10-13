<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TiangModel;
use App\Helpers\NotifikasiHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use App\Services\ImageService;

class TiangController extends Controller
{
    // Tambah Tiang

    public function SimpanTiang(Request $request)
    {
        $storedFiles = [];
        try {
            $validated = $request->validate([
                'kode_tiang'      => 'required|string|max:255|unique:tiang,kode_tiang',
                'wilayah'         => 'required|string|max:255',
                'kecamatan'       => 'required|string|max:255',
                'kelurahan'       => 'required|string|max:255',
                'deskripsi_tiang' => 'required|string',
                'foto_tiang_1'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_2'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_3'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_4'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_5'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'latitude'        => 'required|numeric',
                'longitude'       => 'required|numeric',
                'nama_petugas'    => 'required|string|max:255',
                'status' => 'required|in:Aktif,Nonaktif,aktif,nonaktif',
            ], [
                'kode_tiang.required' => 'Kode Tiang wajib diisi.',
                'kode_tiang.unique' => 'Kode Tiang sudah digunakan.',
                'kecamatan.required' => 'Kecamatan wajib diisi.',
                'kelurahan.required' => 'Kelurahan wajib diisi.',
                'wilayah.required' => 'Wilayah wajib diisi.',
                'deskripsi_tiang.required' => 'Deskripsi Tiang wajib diisi.',
                'foto_tiang_1.required' => 'Foto Tiang 1 wajib diisi.',
                'foto_tiang_2.required' => 'Foto Tiang 2 wajib diisi.',
                'foto_tiang_3.required' => 'Foto Tiang 3 wajib diisi.',
                'foto_tiang_4.required' => 'Foto Tiang 4 wajib diisi.',
                'foto_tiang_5.required' => 'Foto Tiang 5 wajib diisi.',
                'foto_tiang_1.image' => 'Foto Tiang 1 harus berupa gambar.',
                'foto_tiang_2.image' => 'Foto Tiang 2 harus berupa gambar.',
                'foto_tiang_3.image' => 'Foto Tiang 3 harus berupa gambar.',
                'foto_tiang_4.image' => 'Foto Tiang 4 harus berupa gambar.',
                'foto_tiang_5.image' => 'Foto Tiang 5 harus berupa gambar.',
                'latitude.required' => 'Latitude wajib diisi.',
                'latitude.numeric' => 'Latitude harus berupa angka.',
                'longitude.required' => 'Longitude wajib diisi.',
                'longitude.numeric' => 'Longitude harus berupa angka.',
                'nama_petugas.required' => 'Nama Petugas wajib diisi.',
                'status.required' => 'Status wajib diisi.',
                'status.in' => 'Status tidak valid.',
            ]);
            $validated['status'] = strtolower($validated['status']);
            $data = [
                'kode_tiang'      => $validated['kode_tiang'],
                'wilayah'         => $validated['wilayah'],
                'kecamatan'       => $validated['kecamatan'],
                'kelurahan'       => $validated['kelurahan'],
                'deskripsi_tiang' => $validated['deskripsi_tiang'],
                'latitude'        => $validated['latitude'],
                'longitude'       => $validated['longitude'],
                'nama_petugas'    => $validated['nama_petugas'],
                'status'          => $validated['status'],
            ];
            if (!Storage::disk('public')->exists('tiang')) Storage::disk('public')->makeDirectory('tiang');
            if ($request->hasFile('foto_tiang_1')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_1'), 'tiang');
                $data['foto_tiang_1'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_tiang_2')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_2'), 'tiang');
                $data['foto_tiang_2'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_tiang_3')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_3'), 'tiang');
                $data['foto_tiang_3'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_tiang_4')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_4'), 'tiang');
                $data['foto_tiang_4'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_tiang_5')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_5'), 'tiang');
                $data['foto_tiang_5'] = $path;
                $storedFiles[] = $path;
            }
            TiangModel::create($data);
            NotifikasiHelper::kirim('Data Tiang Ditambahkan', 'tiang', NotifikasiHelper::detailPesan('ditambahkan', 'tiang', [], $data));
            return redirect('data-tiang')->with('success', NotifikasiHelper::pesanKeberhasilan('ditambahkan', 'tiang', $data['kode_tiang'], $data['nama_petugas']));
        } catch (QueryException $e) {
            $this->cleanupFiles($storedFiles);
            Log::error('SimpanTiang QueryException: ' . $e->getMessage());
            return redirect()->back()->withErrors($this->parseQueryError($e))->withInput();
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $this->cleanupFiles($storedFiles);
                throw $e;
            }
            $this->cleanupFiles($storedFiles);
            Log::error('SimpanTiang Error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    // Update Data Tiang

    public function PerbaruiTiang(Request $request, $id)
    {
        $newFiles = [];
        $oldFilesToDelete = [];
        try {
            $tiang = TiangModel::findOrFail($id);
            $validated = $request->validate([
                'kode_tiang'      => 'required|string|max:255|unique:tiang,kode_tiang,' . $id,
                'wilayah'         => 'required|string|max:255',
                'kecamatan'       => 'required|string|max:255',
                'kelurahan'       => 'required|string|max:255',
                'deskripsi_tiang' => 'required|string',
                'foto_tiang_1'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_2'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_3'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_4'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_tiang_5'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'hapus_foto_1'    => 'nullable|boolean',
                'hapus_foto_2'    => 'nullable|boolean',
                'hapus_foto_3'    => 'nullable|boolean',
                'hapus_foto_4'    => 'nullable|boolean',
                'hapus_foto_5'    => 'nullable|boolean',
                'latitude'        => 'required|numeric',
                'longitude'       => 'required|numeric',
                'nama_petugas'    => 'required|string|max:255',
                'status'          => 'required|in:aktif,nonaktif',
            ], [
                'kode_tiang.required' => 'Kode Tiang wajib diisi.',
                'kode_tiang.unique' => 'Kode Tiang sudah digunakan.',
                'kecamatan.required' => 'Kecamatan wajib diisi.',
                'kelurahan.required' => 'Kelurahan wajib diisi.',
                'wilayah.required' => 'Wilayah wajib diisi.',
                'deskripsi_tiang.required' => 'Deskripsi Tiang wajib diisi.',
                'latitude.required' => 'Latitude wajib diisi.',
                'latitude.numeric' => 'Latitude harus berupa angka.',
                'longitude.required' => 'Longitude wajib diisi.',
                'longitude.numeric' => 'Longitude harus berupa angka.',
                'nama_petugas.required' => 'Nama Petugas wajib diisi.',
                'status.required' => 'Status wajib diisi.',
                'status.in' => 'Status tidak valid.',
            ]);
            $data = [
                'kode_tiang'      => $validated['kode_tiang'],
                'wilayah'         => $validated['wilayah'],
                'kecamatan'       => $validated['kecamatan'],
                'kelurahan'       => $validated['kelurahan'],
                'deskripsi_tiang' => $validated['deskripsi_tiang'],
                'latitude'        => $validated['latitude'],
                'longitude'       => $validated['longitude'],
                'nama_petugas'    => $validated['nama_petugas'],
                'status'          => $validated['status'],
            ];
            if (!Storage::disk('public')->exists('tiang')) Storage::disk('public')->makeDirectory('tiang');
            if ($request->hasFile('foto_tiang_1')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_1'), 'tiang');
                $data['foto_tiang_1'] = $path;
                $newFiles[] = $path;
                if ($tiang->foto_tiang_1) $oldFilesToDelete[] = $tiang->foto_tiang_1;
            } elseif ($request->boolean('hapus_foto_1')) {
                if ($tiang->foto_tiang_1) $oldFilesToDelete[] = $tiang->foto_tiang_1;
                $data['foto_tiang_1'] = null;
            }
            if ($request->hasFile('foto_tiang_2')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_2'), 'tiang');
                $data['foto_tiang_2'] = $path;
                $newFiles[] = $path;
                if ($tiang->foto_tiang_2) $oldFilesToDelete[] = $tiang->foto_tiang_2;
            } elseif ($request->boolean('hapus_foto_2')) {
                if ($tiang->foto_tiang_2) $oldFilesToDelete[] = $tiang->foto_tiang_2;
                $data['foto_tiang_2'] = null;
            }
            if ($request->hasFile('foto_tiang_3')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_3'), 'tiang');
                $data['foto_tiang_3'] = $path;
                $newFiles[] = $path;
                if ($tiang->foto_tiang_3) $oldFilesToDelete[] = $tiang->foto_tiang_3;
            } elseif ($request->boolean('hapus_foto_3')) {
                if ($tiang->foto_tiang_3) $oldFilesToDelete[] = $tiang->foto_tiang_3;
                $data['foto_tiang_3'] = null;
            }
            if ($request->hasFile('foto_tiang_4')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_4'), 'tiang');
                $data['foto_tiang_4'] = $path;
                $newFiles[] = $path;
                if ($tiang->foto_tiang_4) $oldFilesToDelete[] = $tiang->foto_tiang_4;
            } elseif ($request->boolean('hapus_foto_4')) {
                if ($tiang->foto_tiang_4) $oldFilesToDelete[] = $tiang->foto_tiang_4;
                $data['foto_tiang_4'] = null;
            }
            if ($request->hasFile('foto_tiang_5')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_tiang_5'), 'tiang');
                $data['foto_tiang_5'] = $path;
                $newFiles[] = $path;
                if ($tiang->foto_tiang_5) $oldFilesToDelete[] = $tiang->foto_tiang_5;
            } elseif ($request->boolean('hapus_foto_5')) {
                if ($tiang->foto_tiang_5) $oldFilesToDelete[] = $tiang->foto_tiang_5;
                $data['foto_tiang_5'] = null;
            }
            $lama = $tiang->toArray();
            $tiang->update($data);
            $this->cleanupFiles($oldFilesToDelete);
            NotifikasiHelper::kirim('Data Tiang Diperbarui', 'tiang', NotifikasiHelper::detailPesan('diperbarui', 'tiang', $lama, $data));
            return redirect('data-tiang')->with('success', NotifikasiHelper::pesanKeberhasilan('diperbarui', 'tiang', $data['kode_tiang'], $data['nama_petugas']));
        } catch (QueryException $e) {
            $this->cleanupFiles($newFiles);
            Log::error('UpdateTiang QueryException: ' . $e->getMessage());
            return redirect()->back()->withErrors($this->parseQueryError($e))->withInput();
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $this->cleanupFiles($newFiles);
                throw $e;
            }
            $this->cleanupFiles($newFiles);
            Log::error('UpdateTiang Error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    // Hapus Tiang

    public function HapusTiang($id)
    {
        $tiang = TiangModel::findOrFail($id);
        $kode = $tiang->kode_tiang;
        $lama = $tiang->toArray();
        $files = array_filter([$tiang->foto_tiang_1, $tiang->foto_tiang_2, $tiang->foto_tiang_3, $tiang->foto_tiang_4, $tiang->foto_tiang_5]);
        $tiang->delete();
        $this->cleanupFiles($files);
        NotifikasiHelper::kirim('Data Tiang Dihapus', 'tiang', NotifikasiHelper::detailPesan('dihapus', 'tiang', $lama, []));
        return redirect('data-tiang')->with('success', NotifikasiHelper::pesanKeberhasilan('dihapus', 'tiang', $kode));
    }

    // Handle Error Message

    private function parseQueryError(QueryException $e): array
    {
        $msg = $e->getMessage();
        if (str_contains($msg, 'cannot be null') || str_contains($msg, "doesn't have a default value") || str_contains($msg, '1048') || str_contains($msg, '1364') || preg_match("/(Column|Field) '[^']+' (cannot be null|doesn't have a default value)/", $msg)) {
            if (preg_match("/(?:Column|Field) '([^']+)'/", $msg, $m)) {
                $col = $m[1];
                $labels = ['kode_tiang' => 'Kode Tiang', 'wilayah' => 'Wilayah', 'kecamatan' => 'Kecamatan', 'kelurahan' => 'Kelurahan', 'deskripsi_tiang' => 'Deskripsi Tiang', 'foto_tiang_1' => 'Foto Tiang 1', 'foto_tiang_2' => 'Foto Tiang 2', 'foto_tiang_3' => 'Foto Tiang 3', 'foto_tiang_4' => 'Foto Tiang 4', 'foto_tiang_5' => 'Foto Tiang 5', 'latitude' => 'Latitude', 'longitude' => 'Longitude', 'nama_petugas' => 'Nama Petugas', 'status' => 'Status'];
                return [$col => ($labels[$col] ?? $col) . ' wajib diisi.'];
            }
            return ['error' => 'Ada field wajib yang belum diisi.'];
        }
        if (str_contains($msg, 'Duplicate entry') || str_contains($msg, 'UNIQUE') || str_contains($msg, 'unique constraint') || str_contains($msg, '1062')) {
            if (str_contains($msg, 'kode_tiang')) return ['kode_tiang' => 'Kode Tiang sudah digunakan. Gunakan kode lain.'];
            if (str_contains($msg, 'kode_ont')) return ['kode_ont' => 'Kode ONT sudah digunakan.'];
            if (preg_match("/for key '[^']*\.([^']+)'/", $msg, $m)) {
                $col = $m[1];
                return [$col => ucfirst(str_replace('_', ' ', $col)) . ' sudah digunakan.'];
            }
            return ['error' => 'Data sudah ada (duplikat). Periksa kembali kode unik.'];
        }
        if (str_contains($msg, 'foreign key') || str_contains($msg, '1452')) return ['error' => 'Data relasi tidak valid.'];
        Log::warning('Unmapped QueryException for Tiang: ' . $msg);
        return ['error' => 'Gagal menyimpan data tiang: ' . $this->extractSqlDetail($msg)];
    }

    private function extractSqlDetail(string $msg): string
    {
        if (preg_match('/SQLSTATE\[.*?\]:\s*(.+?)(?:\s*\(|$)/', $msg, $m)) return trim($m[1]);
        return mb_substr($msg, -200);
    }

    private function formatQueryError(QueryException $e): string
    {
        return array_values($this->parseQueryError($e))[0];
    }

    // Handle Delete File

    private function cleanupFiles(array $paths): void
    {
        foreach ($paths as $path) {
            if (!$path) continue;
            try {
                if (Storage::disk('public')->exists($path)) Storage::disk('public')->delete($path);
            } catch (\Throwable $e) {
                Log::warning('Failed to cleanup file: ' . $path . ' - ' . $e->getMessage());
            }
        }
    }
}
