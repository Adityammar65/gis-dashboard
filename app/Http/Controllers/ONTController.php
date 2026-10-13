<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ONTModel;
use App\Helpers\NotifikasiHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use App\Services\ImageService;

class ONTController extends Controller
{
    // Tambah ONT

    public function SimpanONT(Request $request)
    {
        $storedFiles = [];
        try {
            $validated = $request->validate([
                'kode_ont'      => 'required|string|max:255|unique:ont,kode_ont',
                'wilayah'         => 'required|string|max:255',
                'kecamatan'       => 'required|string|max:255',
                'kelurahan'       => 'required|string|max:255',
                'deskripsi_ont' => 'required|string',
                'foto_ont_1'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_2'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_3'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_4'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_5'    => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
                'latitude'        => 'required|numeric',
                'longitude'       => 'required|numeric',
                'nama_petugas'    => 'required|string|max:255',
                'status'          => 'required|in:aktif,nonaktif',
            ], [
                'kode_ont.required' => 'Kode ONT wajib diisi.',
                'kode_ont.unique' => 'Kode ONT sudah digunakan.',
                'wilayah.required' => 'Wilayah wajib diisi.',
                'kecamatan.required' => 'Kecamatan wajib diisi.',
                'kelurahan.required' => 'Kelurahan wajib diisi.',
                'deskripsi_ont.required' => 'Deskripsi ONT wajib diisi.',
                'foto_ont_1.required' => 'Foto ONT 1 wajib diisi.',
                'foto_ont_2.required' => 'Foto ONT 2 wajib diisi.',
                'foto_ont_3.required' => 'Foto ONT 3 wajib diisi.',
                'foto_ont_4.required' => 'Foto ONT 4 wajib diisi.',
                'foto_ont_5.required' => 'Foto ONT 5 wajib diisi.',
                'foto_ont_1.image' => 'Foto ONT 1 harus berupa gambar.',
                'foto_ont_2.image' => 'Foto ONT 2 harus berupa gambar.',
                'foto_ont_3.image' => 'Foto ONT 3 harus berupa gambar.',
                'foto_ont_4.image' => 'Foto ONT 4 harus berupa gambar.',
                'foto_ont_5.image' => 'Foto ONT 5 harus berupa gambar.',
                'latitude.required' => 'Latitude wajib diisi.',
                'latitude.numeric' => 'Latitude harus berupa angka.',
                'longitude.required' => 'Longitude wajib diisi.',
                'longitude.numeric' => 'Longitude harus berupa angka.',
                'nama_petugas.required' => 'Nama Petugas wajib diisi.',
                'status.required' => 'Status wajib diisi.',
                'status.in' => 'Status tidak valid.',
            ]);
            $data = [
                'kode_ont'      => $validated['kode_ont'],
                'wilayah'         => $validated['wilayah'],
                'kecamatan'       => $validated['kecamatan'],
                'kelurahan'       => $validated['kelurahan'],
                'deskripsi_ont' => $validated['deskripsi_ont'],
                'latitude'        => $validated['latitude'],
                'longitude'       => $validated['longitude'],
                'nama_petugas'    => $validated['nama_petugas'],
                'status'          => $validated['status'],
            ];
            if (!Storage::disk('public')->exists('ont')) Storage::disk('public')->makeDirectory('ont');
            if ($request->hasFile('foto_ont_1')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_1'), 'ont');
                $data['foto_ont_1'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_ont_2')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_2'), 'ont');
                $data['foto_ont_2'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_ont_3')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_3'), 'ont');
                $data['foto_ont_3'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_ont_4')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_4'), 'ont');
                $data['foto_ont_4'] = $path;
                $storedFiles[] = $path;
            }
            if ($request->hasFile('foto_ont_5')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_5'), 'ont');
                $data['foto_ont_5'] = $path;
                $storedFiles[] = $path;
            }
            ONTModel::create($data);
            NotifikasiHelper::kirim('Data ONT Ditambahkan', 'ont', NotifikasiHelper::detailPesan('ditambahkan', 'ont', [], $data));
            return redirect('data-ont')->with('success', NotifikasiHelper::pesanKeberhasilan('ditambahkan', 'ont', $data['kode_ont'], $data['nama_petugas']));
        } catch (QueryException $e) {
            $this->cleanupFiles($storedFiles);
            Log::error('SimpanONT QueryException: ' . $e->getMessage());
            return redirect()->back()->withErrors($this->parseQueryError($e))->withInput();
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $this->cleanupFiles($storedFiles);
                throw $e;
            }
            $this->cleanupFiles($storedFiles);
            Log::error('SimpanONT Error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    // Update Data ONT

    public function PerbaruiONT(Request $request, $id)
    {
        $newFiles = [];
        $oldFilesToDelete = [];
        try {
            $ont = ONTModel::findOrFail($id);
            $validated = $request->validate([
                'kode_ont'      => 'required|string|max:255|unique:ont,kode_ont,' . $id,
                'wilayah'         => 'required|string|max:255',
                'kecamatan'       => 'required|string|max:255',
                'kelurahan'       => 'required|string|max:255',
                'deskripsi_ont' => 'required|string',
                'foto_ont_1'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_2'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_3'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_4'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                'foto_ont_5'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
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
                'kode_ont.required' => 'Kode ONT wajib diisi.',
                'kode_ont.unique' => 'Kode ONT sudah digunakan.',
                'wilayah.required' => 'Wilayah wajib diisi.',
                'kecamatan.required' => 'Kecamatan wajib diisi.',
                'kelurahan.required' => 'Kelurahan wajib diisi.',
                'deskripsi_ont.required' => 'Deskripsi ONT wajib diisi.',
                'latitude.required' => 'Latitude wajib diisi.',
                'latitude.numeric' => 'Latitude harus berupa angka.',
                'longitude.required' => 'Longitude wajib diisi.',
                'longitude.numeric' => 'Longitude harus berupa angka.',
                'nama_petugas.required' => 'Nama Petugas wajib diisi.',
                'status.required' => 'Status wajib diisi.',
                'status.in' => 'Status tidak valid.',
            ]);
            $data = [
                'kode_ont'      => $validated['kode_ont'],
                'wilayah'         => $validated['wilayah'],
                'kecamatan'       => $validated['kecamatan'],
                'kelurahan'       => $validated['kelurahan'],
                'deskripsi_ont' => $validated['deskripsi_ont'],
                'latitude'        => $validated['latitude'],
                'longitude'       => $validated['longitude'],
                'nama_petugas'    => $validated['nama_petugas'],
                'status'          => $validated['status'],
            ];
            if (!Storage::disk('public')->exists('ont')) Storage::disk('public')->makeDirectory('ont');
            if ($request->hasFile('foto_ont_1')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_1'), 'ont');
                $data['foto_ont_1'] = $path;
                $newFiles[] = $path;
                if ($ont->foto_ont_1) $oldFilesToDelete[] = $ont->foto_ont_1;
            } elseif ($request->boolean('hapus_foto_1')) {
                if ($ont->foto_ont_1) $oldFilesToDelete[] = $ont->foto_ont_1;
                $data['foto_ont_1'] = null;
            }
            if ($request->hasFile('foto_ont_2')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_2'), 'ont');
                $data['foto_ont_2'] = $path;
                $newFiles[] = $path;
                if ($ont->foto_ont_2) $oldFilesToDelete[] = $ont->foto_ont_2;
            } elseif ($request->boolean('hapus_foto_2')) {
                if ($ont->foto_ont_2) $oldFilesToDelete[] = $ont->foto_ont_2;
                $data['foto_ont_2'] = null;
            }
            if ($request->hasFile('foto_ont_3')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_3'), 'ont');
                $data['foto_ont_3'] = $path;
                $newFiles[] = $path;
                if ($ont->foto_ont_3) $oldFilesToDelete[] = $ont->foto_ont_3;
            } elseif ($request->boolean('hapus_foto_3')) {
                if ($ont->foto_ont_3) $oldFilesToDelete[] = $ont->foto_ont_3;
                $data['foto_ont_3'] = null;
            }
            if ($request->hasFile('foto_ont_4')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_4'), 'ont');
                $data['foto_ont_4'] = $path;
                $newFiles[] = $path;
                if ($ont->foto_ont_4) $oldFilesToDelete[] = $ont->foto_ont_4;
            } elseif ($request->boolean('hapus_foto_4')) {
                if ($ont->foto_ont_4) $oldFilesToDelete[] = $ont->foto_ont_4;
                $data['foto_ont_4'] = null;
            }
            if ($request->hasFile('foto_ont_5')) {
                $path = app(ImageService::class)->storeOptimizedWebP($request->file('foto_ont_5'), 'ont');
                $data['foto_ont_5'] = $path;
                $newFiles[] = $path;
                if ($ont->foto_ont_5) $oldFilesToDelete[] = $ont->foto_ont_5;
            } elseif ($request->boolean('hapus_foto_5')) {
                if ($ont->foto_ont_5) $oldFilesToDelete[] = $ont->foto_ont_5;
                $data['foto_ont_5'] = null;
            }
            $lama = $ont->toArray();
            $ont->update($data);
            $this->cleanupFiles($oldFilesToDelete);
            NotifikasiHelper::kirim('Data ONT Diperbarui', 'ont', NotifikasiHelper::detailPesan('diperbarui', 'ont', $lama, $data));
            return redirect('data-ont')->with('success', NotifikasiHelper::pesanKeberhasilan('diperbarui', 'ont', $data['kode_ont'], $data['nama_petugas']));
        } catch (QueryException $e) {
            $this->cleanupFiles($newFiles);
            Log::error('UpdateONT QueryException: ' . $e->getMessage());
            return redirect()->back()->withErrors($this->parseQueryError($e))->withInput();
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $this->cleanupFiles($newFiles);
                throw $e;
            }
            $this->cleanupFiles($newFiles);
            Log::error('UpdateONT Error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    // Hapus ONT

    public function HapusONT($id)
    {
        $ont = ONTModel::findOrFail($id);
        $kode = $ont->kode_ont;
        $lama = $ont->toArray();
        $files = array_filter([$ont->foto_ont_1, $ont->foto_ont_2, $ont->foto_ont_3, $ont->foto_ont_4, $ont->foto_ont_5]);
        $ont->delete();
        $this->cleanupFiles($files);
        NotifikasiHelper::kirim('Data ONT Dihapus', 'ont', NotifikasiHelper::detailPesan('dihapus', 'ont', $lama, []));
        return redirect('data-ont')->with('success', NotifikasiHelper::pesanKeberhasilan('dihapus', 'ont', $kode));
    }

    // Handle Error Message

    private function parseQueryError(QueryException $e): array
    {
        $msg = $e->getMessage();
        if (str_contains($msg, 'cannot be null') || str_contains($msg, "doesn't have a default value") || str_contains($msg, '1048') || str_contains($msg, '1364') || preg_match("/(Column|Field) '[^']+' (cannot be null|doesn't have a default value)/", $msg)) {
            if (preg_match("/(?:Column|Field) '([^']+)'/", $msg, $m)) {
                $col = $m[1];
                $labels = ['kode_ont' => 'Kode ONT', 'wilayah' => 'Wilayah', 'kecamatan' => 'Kecamatan', 'kelurahan' => 'Kelurahan', 'deskripsi_ont' => 'Deskripsi ONT', 'foto_ont_1' => 'Foto ONT 1', 'foto_ont_2' => 'Foto ONT 2', 'foto_ont_3' => 'Foto ONT 3', 'foto_ont_4' => 'Foto ONT 4', 'foto_ont_5' => 'Foto ONT 5', 'latitude' => 'Latitude', 'longitude' => 'Longitude', 'nama_petugas' => 'Nama Petugas', 'status' => 'Status'];
                return [$col => ($labels[$col] ?? $col) . ' wajib diisi.'];
            }
            return ['error' => 'Ada field wajib yang belum diisi.'];
        }
        if (str_contains($msg, 'Duplicate entry') || str_contains($msg, 'UNIQUE') || str_contains($msg, 'unique constraint') || str_contains($msg, '1062')) {
            if (str_contains($msg, 'kode_ont')) return ['kode_ont' => 'Kode ONT sudah digunakan. Gunakan kode lain.'];
            if (str_contains($msg, 'kode_tiang')) return ['kode_tiang' => 'Kode Tiang sudah digunakan.'];
            if (preg_match("/for key '[^']*\.([^']+)'/", $msg, $m)) {
                $col = $m[1];
                return [$col => ucfirst(str_replace('_', ' ', $col)) . ' sudah digunakan.'];
            }
            return ['error' => 'Data sudah ada (duplikat). Periksa kembali kode unik.'];
        }
        if (str_contains($msg, 'foreign key') || str_contains($msg, '1452')) return ['error' => 'Data relasi tidak valid.'];
        Log::warning('Unmapped QueryException for ONT: ' . $msg);
        return ['error' => 'Gagal menyimpan data ONT: ' . $this->extractSqlDetail($msg)];
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
