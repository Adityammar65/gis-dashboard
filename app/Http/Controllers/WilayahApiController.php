<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\WilayahModel;

class WilayahApiController extends Controller
{
    // Ambil Wilayah Saat Ini

    private function getCurrentWilayah(): ?WilayahModel
    {
        $settings = Cache::remember('settings', 3600, function () {
            $path = storage_path('app/settings.json');
            if (!file_exists($path)) return [];
            return json_decode(file_get_contents($path), true) ?? [];
        });
        $id = $settings['id'] ?? null;
        $nama = $settings['nama_wilayah'] ?? null;
        if ($id) {
            $w = WilayahModel::find($id);
            if ($w) return $w;
        }
        if ($nama) {
            return WilayahModel::where('nama_wilayah', $nama)->first();
        }
        return WilayahModel::first();
    }

    // Resolve Kode Kemendagri

    private function resolveKemendagriCode(WilayahModel $wil): ?string
    {
        if (isset($wil->kemendagri_code) && $wil->kemendagri_code) {
            return (string) $wil->kemendagri_code;
        }
        $map = config('regions.map', [
            'yogyakarta' => '3471',
            'sleman' => '3404',
            'bantul' => '3402',
            'kulon progo' => '3401',
            'gunungkidul' => '3403',
            'jepara' => '3320',
            'sukoharjo' => '3311',
            'magelang' => '3308',
        ]);
        $key = strtolower(trim($wil->nama_wilayah));
        return $map[$key] ?? null;
    }

    // Kecamatan Berdasarkan Kabupaten

    public function kecamatanBerdasarkanKabupaten(Request $request, $kode)
    {
        $kode = trim((string) $kode);
        $wil = WilayahModel::where('kode_wilayah', $kode)->orWhere('nama_wilayah', $kode)->first();
        $code = null;
        $wilForMeta = $wil;
        if ($wil) {
            $code = $this->resolveKemendagriCode($wil);
        } else {
            $code = $kode;
            $wilForMeta = null;
        }
        if (!$code) {
            return response()->json(['data' => [], 'meta' => ['source' => 'fallback', 'warning' => 'Kode Kemendagri tidak ditemukan untuk wilayah ' . $kode]]);
        }

        $cacheKey = "regions:kecamatan:kabupaten:$code";
        $result = Cache::remember($cacheKey, 86400, function () use ($code) {
            $apiKey = config('services.api_indonesia.key') ?? env('API_INDONESIA_KEY');
            if ($apiKey) {
                try {
                    $res = Http::withHeaders(['x-api-key' => $apiKey])
                        ->timeout(5)
                        ->get("https://use.apiindonesia.id/api/v1/wilayah/kecamatan", [
                            'kabupaten_id' => $code,
                            'per_page' => 100,
                        ]);
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? $it['id'] ?? '',
                            'name' => $it['name'] ?? $it['alt_name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        return ['data' => $norm, 'source' => 'api_indonesia', 'meta' => $json['meta'] ?? []];
                    }
                    Log::warning("Region API Indonesia kecamatan failed: " . $res->status() . " " . $res->body());
                } catch (\Throwable $e) {
                    Log::warning("Region API Indonesia exception: " . $e->getMessage());
                }
            }

            $wilayahIdCode = $this->formatForWilayahId($code, 'kabupaten');
            foreach ([$code, $wilayahIdCode] as $tryCode) {
                try {
                    $res = Http::timeout(5)->get("https://wilayah.id/api/districts/{$tryCode}.json");
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? '',
                            'name' => $it['name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        if (!empty($norm)) return ['data' => $norm, 'source' => 'wilayah.id', 'meta' => $json['meta'] ?? []];
                    }
                } catch (\Throwable $e) {
                    Log::warning("Wilayah.id districts fetch failed: " . $e->getMessage());
                }
            }

            return null;
        });

        if ($result && !empty($result['data'])) {
            return response()->json([
                'data' => $result['data'],
                'meta' => array_merge($result['meta'] ?? [], ['source' => $result['source'], 'kabupaten' => $wilForMeta?->nama_wilayah ?? $kode, 'kabupaten_code' => $code]),
            ]);
        }
        return response()->json([
            'data' => [],
            'meta' => ['source' => 'fallback', 'warning' => 'Gagal memuat kecamatan dari API, silakan isi manual', 'kabupaten' => $wilForMeta?->nama_wilayah ?? $kode],
        ]);
    }

    // Format Kode untuk Wilayah.id

    private function formatForWilayahId(string $code, string $level): string
    {
        $digits = preg_replace('/[^0-9]/', '', $code);
        if ($level === 'kabupaten' && strlen($digits) === 4) return substr($digits, 0, 2) . '.' . substr($digits, 2);
        if ($level === 'kecamatan' && strlen($digits) === 7) return substr($digits, 0, 2) . '.' . substr($digits, 2, 2) . '.' . substr($digits, 4);
        if ($level === 'kecamatan' && strlen($digits) === 6) return substr($digits, 0, 2) . '.' . substr($digits, 2, 2) . '.' . substr($digits, 4);

        if (str_contains($code, '.')) return $code;
        return $code;
    }

    // Kecamatan Wilayah Aktif

    public function kecamatanSaatIni(Request $request)
    {
        $wil = $this->getCurrentWilayah();
        if (!$wil) {
            return response()->json(['data' => [], 'meta' => ['source' => 'fallback', 'warning' => 'Wilayah tidak ditemukan']]);
        }

        $code = $request->query('kabupaten_id') ?? $this->resolveKemendagriCode($wil);
        if (!$code) {
            return response()->json(['data' => [], 'meta' => ['source' => 'fallback', 'warning' => 'Kode Kemendagri tidak ditemukan untuk wilayah ' . $wil->nama_wilayah]]);
        }

        $cacheKey = "regions:kecamatan:kabupaten:$code";
        $result = Cache::remember($cacheKey, 86400, function () use ($code) {
            $apiKey = config('services.api_indonesia.key') ?? env('API_INDONESIA_KEY');
            if ($apiKey) {
                try {
                    $res = Http::withHeaders(['x-api-key' => $apiKey])
                        ->timeout(5)
                        ->get("https://use.apiindonesia.id/api/v1/wilayah/kecamatan", [
                            'kabupaten_id' => $code,
                            'per_page' => 100,
                        ]);
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? $it['id'] ?? '',
                            'name' => $it['name'] ?? $it['alt_name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        return ['data' => $norm, 'source' => 'api_indonesia', 'meta' => $json['meta'] ?? []];
                    }
                    Log::warning("Region API Indonesia kecamatan failed: " . $res->status() . " " . $res->body());
                } catch (\Throwable $e) {
                    Log::warning("Region API Indonesia exception: " . $e->getMessage());
                }
            }

            $wilayahIdCode = $this->formatForWilayahId($code, 'kabupaten');
            foreach ([$code, $wilayahIdCode] as $tryCode) {
                try {
                    $res = Http::timeout(5)->get("https://wilayah.id/api/districts/{$tryCode}.json");
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? '',
                            'name' => $it['name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        if (!empty($norm)) return ['data' => $norm, 'source' => 'wilayah.id', 'meta' => $json['meta'] ?? []];
                    }
                } catch (\Throwable $e) {
                    Log::warning("Wilayah.id districts fetch failed: " . $e->getMessage());
                }
            }
            return null;
        });

        if ($result && !empty($result['data'])) {
            return response()->json([
                'data' => $result['data'],
                'meta' => array_merge($result['meta'] ?? [], ['source' => $result['source'], 'kabupaten' => $wil->nama_wilayah, 'kabupaten_code' => $code]),
            ]);
        }

        return response()->json([
            'data' => [],
            'meta' => ['source' => 'fallback', 'warning' => 'Gagal memuat kecamatan dari API, silakan isi manual', 'kabupaten' => $wil->nama_wilayah],
        ]);
    }

    // Kelurahan Berdasarkan Kecamatan

    public function kelurahanBerdasarkanKecamatan(Request $request, $code)
    {
        $code = trim((string) $code);
        if ($code === '') {
            return response()->json(['data' => [], 'meta' => ['source' => 'fallback', 'warning' => 'Kode kecamatan kosong']]);
        }

        $cacheKey = "regions:kelurahan:kecamatan:$code";
        $result = Cache::remember($cacheKey, 86400, function () use ($code) {
            $apiKey = config('services.api_indonesia.key') ?? env('API_INDONESIA_KEY');
            if ($apiKey) {
                try {
                    $res = Http::withHeaders(['x-api-key' => $apiKey])
                        ->timeout(5)
                        ->get("https://use.apiindonesia.id/api/v1/wilayah/kelurahan", [
                            'kecamatan_id' => $code,
                            'per_page' => 100,
                        ]);
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? $it['id'] ?? '',
                            'name' => $it['name'] ?? $it['alt_name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        return ['data' => $norm, 'source' => 'api_indonesia', 'meta' => $json['meta'] ?? []];
                    }
                    Log::warning("Region API Indonesia kelurahan failed: " . $res->status());
                } catch (\Throwable $e) {
                    Log::warning("Region kelurahan API exception: " . $e->getMessage());
                }
            }

            $wilayahIdCode = $this->formatForWilayahId($code, 'kecamatan');
            foreach ([$code, $wilayahIdCode] as $tryCode) {
                try {
                    $res = Http::timeout(5)->get("https://wilayah.id/api/villages/{$tryCode}.json");
                    if ($res->successful()) {
                        $json = $res->json();
                        $data = $json['data'] ?? [];
                        $norm = collect($data)->map(fn($it) => [
                            'code' => $it['code'] ?? '',
                            'name' => $it['name'] ?? '',
                            '_raw' => $it,
                        ])->values()->all();
                        if (!empty($norm)) return ['data' => $norm, 'source' => 'wilayah.id', 'meta' => $json['meta'] ?? []];
                    }
                } catch (\Throwable $e) {
                    Log::warning("Wilayah.id villages fetch failed: " . $e->getMessage());
                }
            }
            return null;
        });

        if ($result && isset($result['data'])) {
            return response()->json([
                'data' => $result['data'],
                'meta' => array_merge($result['meta'] ?? [], ['source' => $result['source'], 'kecamatan_code' => $code]),
            ]);
        }

        return response()->json([
            'data' => [],
            'meta' => ['source' => 'fallback', 'warning' => 'Gagal memuat kelurahan dari API, silakan isi manual', 'kecamatan_code' => $code],
        ]);
    }
}
