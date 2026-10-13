<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TiangModel;
use App\Models\ONTModel;
use App\Models\NotifikasiModel;
use App\Models\RequestPerubahanAkun;
use App\Models\WilayahModel;
use App\Models\UserModel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class HalamanController extends Controller
{
    // Halaman Utama

    public function Beranda()
    {
        $settings = Cache::remember('settings', 3600, function () {
            $path = storage_path('app/settings.json');
            if (!file_exists($path)) return [];
            return json_decode(file_get_contents($path), true) ?? [];
        });
        $namaWilayah = trim((string) ($settings['nama_wilayah'] ?? ''));

        $tiang = collect();
        $ont = collect();

        if ($namaWilayah !== '') {
            $tiang = TiangModel::query()
                ->select(['id', 'kode_tiang', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'latitude', 'longitude'])
                ->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)])
                ->whereNotNull('latitude')->where('latitude', '!=', '')
                ->whereNotNull('longitude')->where('longitude', '!=', '')
                ->orderByDesc('id')->limit(2000)->get();
            $ont = ONTModel::query()
                ->select(['id', 'kode_ont', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'latitude', 'longitude'])
                ->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)])
                ->whereNotNull('latitude')->where('latitude', '!=', '')
                ->whereNotNull('longitude')->where('longitude', '!=', '')
                ->orderByDesc('id')->limit(2000)->get();
        }

        $tiangAgg = TiangModel::query()
            ->when($namaWilayah !== '', fn($q) => $q->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)]))
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN LOWER(status)='aktif' THEN 1 ELSE 0 END) as aktif, SUM(CASE WHEN LOWER(status)='nonaktif' THEN 1 ELSE 0 END) as nonaktif")
            ->first();
        $ontAgg = ONTModel::query()
            ->when($namaWilayah !== '', fn($q) => $q->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)]))
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN LOWER(status)='aktif' THEN 1 ELSE 0 END) as aktif, SUM(CASE WHEN LOWER(status)='nonaktif' THEN 1 ELSE 0 END) as nonaktif")
            ->first();

        $wilayahTotal = WilayahModel::count();

        $berkoordTiang = TiangModel::query()
            ->when($namaWilayah !== '', fn($q) => $q->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)]))
            ->whereNotNull('latitude')->where('latitude', '!=', '')
            ->whereNotNull('longitude')->where('longitude', '!=', '')
            ->count();
        $berkoordOnt = ONTModel::query()
            ->when($namaWilayah !== '', fn($q) => $q->whereRaw('LOWER(wilayah) = ?', [strtolower($namaWilayah)]))
            ->whereNotNull('latitude')->where('latitude', '!=', '')
            ->whereNotNull('longitude')->where('longitude', '!=', '')
            ->count();

        $totalTiang = (int) ($tiangAgg->total ?? 0);
        $totalOnt = (int) ($ontAgg->total ?? 0);
        $totalAset = $totalTiang + $totalOnt;
        $berkoord = $berkoordTiang + $berkoordOnt;
        $persen = $totalAset > 0 ? (int) round($berkoord / $totalAset * 100) : 0;

        $stats = [
            'tiang' => [
                'total' => $totalTiang,
                'aktif' => (int) ($tiangAgg->aktif ?? 0),
                'nonaktif' => (int) ($tiangAgg->nonaktif ?? 0),
            ],
            'ont' => [
                'total' => $totalOnt,
                'aktif' => (int) ($ontAgg->aktif ?? 0),
                'nonaktif' => (int) ($ontAgg->nonaktif ?? 0),
            ],
            'wilayah' => [
                'total' => (int) $wilayahTotal,
            ],
            'koordinat' => [
                'total' => $totalAset,
                'berkoordinat' => $berkoord,
                'persen' => $persen,
            ],
        ];

        $recentTiang = TiangModel::query()
            ->select(['id', 'kode_tiang as kode', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'nama_petugas', 'updated_by', 'created_at', 'updated_at'])
            ->orderByDesc('updated_at')->orderByDesc('id')->limit(5)->get()
            ->map(fn($r) => array_merge($r->toArray(), ['type' => 'tiang']));
        $recentOnt = ONTModel::query()
            ->select(['id', 'kode_ont as kode', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'nama_petugas', 'updated_by', 'created_at', 'updated_at'])
            ->orderByDesc('updated_at')->orderByDesc('id')->limit(5)->get()
            ->map(fn($r) => array_merge($r->toArray(), ['type' => 'ont']));
        $recentAssets = $recentTiang->concat($recentOnt)->sortByDesc('updated_at')->take(5)->values();

        return Inertia::render('Home', [
            'tiang' => $tiang,
            'ont' => $ont,
            'stats' => $stats,
            'recentAssets' => $recentAssets,
        ]);
    }

    // Halaman Data Tiang

    public function DataTiang(Request $request)
    {
        $query = TiangModel::query()->select(['id', 'kode_tiang', 'wilayah', 'kecamatan', 'kelurahan', 'nama_petugas', 'status', 'foto_tiang_1', 'latitude', 'longitude']);

        if ($request->filled('wilayah')) {
            $wilayah = Cache::remember('wilayah:' . $request->wilayah, 3600, fn() => WilayahModel::find($request->wilayah));
            if ($wilayah) {
                $query->where('wilayah', $wilayah->nama_wilayah);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('kecamatan')) {
            $kec = trim($request->kecamatan);
            if (mb_strlen($kec) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $kec) . '%';
                $query->where('kecamatan', 'like', $like);
            }
        }

        if ($request->filled('kelurahan')) {
            $kel = trim($request->kelurahan);
            if (mb_strlen($kel) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $kel) . '%';
                $query->where('kelurahan', 'like', $like);
            }
        }

        if ($request->filled('q')) {
            $q = trim($request->q);
            if (mb_strlen($q) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $q) . '%';
                $query->where(function ($w) use ($like) {
                    $w->where('kode_tiang', 'like', $like)
                        ->orWhere('wilayah', 'like', $like)
                        ->orWhere('kecamatan', 'like', $like)
                        ->orWhere('kelurahan', 'like', $like)
                        ->orWhere('nama_petugas', 'like', $like);
                });
            }
        }

        $dataTiang = $query->latest('id')->paginate(15)->withQueryString();
        $wilayah = Cache::remember('wilayah:list', 3600, fn() => WilayahModel::all());

        return Inertia::render('DataTiang', [
            'dataTiang' => $dataTiang,
            'wilayah' => $wilayah,
            'filter' => [
                'wilayah' => $request->wilayah ?? '',
                'kecamatan' => $request->kecamatan ?? '',
                'kelurahan' => $request->kelurahan ?? '',
                'status' => $request->status ?? '',
                'q' => $request->q ?? '',
            ],
        ]);
    }

    // Halaman Data ONT

    public function DataONT(Request $request)
    {
        $query = ONTModel::query()->select(['id', 'kode_ont', 'wilayah', 'kecamatan', 'kelurahan', 'nama_petugas', 'status', 'foto_ont_1', 'latitude', 'longitude']);

        if ($request->filled('wilayah')) {
            $wilayah = Cache::remember('wilayah:' . $request->wilayah, 3600, fn() => WilayahModel::find($request->wilayah));
            if ($wilayah) {
                $query->where('wilayah', $wilayah->nama_wilayah);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('kecamatan')) {
            $kec = trim($request->kecamatan);
            if (mb_strlen($kec) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $kec) . '%';
                $query->where('kecamatan', 'like', $like);
            }
        }

        if ($request->filled('kelurahan')) {
            $kel = trim($request->kelurahan);
            if (mb_strlen($kel) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $kel) . '%';
                $query->where('kelurahan', 'like', $like);
            }
        }

        if ($request->filled('q')) {
            $q = trim($request->q);
            if (mb_strlen($q) >= 1) {
                $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $q) . '%';
                $query->where(function ($w) use ($like) {
                    $w->where('kode_ont', 'like', $like)
                        ->orWhere('wilayah', 'like', $like)
                        ->orWhere('kecamatan', 'like', $like)
                        ->orWhere('kelurahan', 'like', $like)
                        ->orWhere('nama_petugas', 'like', $like);
                });
            }
        }

        $dataONT = $query->latest('id')->paginate(15)->withQueryString();
        $wilayah = Cache::remember('wilayah:list', 3600, fn() => WilayahModel::all());

        return Inertia::render('DataONT', [
            'dataONT' => $dataONT,
            'wilayah' => $wilayah,
            'filter' => [
                'wilayah' => $request->wilayah ?? '',
                'kecamatan' => $request->kecamatan ?? '',
                'kelurahan' => $request->kelurahan ?? '',
                'status' => $request->status ?? '',
                'q' => $request->q ?? '',
            ],
        ]);
    }

    // Search API

    public function Cari(Request $request)
    {
        $qRaw = trim((string) $request->query('q', ''));
        $typeRaw = strtolower(trim((string) $request->query('type', '')));
        $type = in_array($typeRaw, ['tiang', 'ont']) ? $typeRaw : '';
        if (mb_strlen($qRaw) < 2) {
            return response()->json(['results' => []]);
        }

        $esc = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $qRaw);
        $like = "%{$esc}%";
        $exact = $qRaw;
        $prefix = "{$esc}%";

        $results = collect();
        $limitPerType = 5;

        $rankSqlTiang = "CASE WHEN kode_tiang = ? THEN 0 WHEN kode_tiang LIKE ? THEN 1 WHEN kode_tiang LIKE ? THEN 2 WHEN wilayah = ? THEN 3 WHEN wilayah LIKE ? THEN 4 WHEN wilayah LIKE ? THEN 5 WHEN kecamatan = ? THEN 6 WHEN kecamatan LIKE ? THEN 7 WHEN kecamatan LIKE ? THEN 8 WHEN kelurahan = ? THEN 9 WHEN kelurahan LIKE ? THEN 10 WHEN kelurahan LIKE ? THEN 11 WHEN nama_petugas = ? THEN 12 WHEN nama_petugas LIKE ? THEN 13 WHEN nama_petugas LIKE ? THEN 14 ELSE 15 END";
        $rankSqlOnt = "CASE WHEN kode_ont = ? THEN 0 WHEN kode_ont LIKE ? THEN 1 WHEN kode_ont LIKE ? THEN 2 WHEN wilayah = ? THEN 3 WHEN wilayah LIKE ? THEN 4 WHEN wilayah LIKE ? THEN 5 WHEN kecamatan = ? THEN 6 WHEN kecamatan LIKE ? THEN 7 WHEN kecamatan LIKE ? THEN 8 WHEN kelurahan = ? THEN 9 WHEN kelurahan LIKE ? THEN 10 WHEN kelurahan LIKE ? THEN 11 WHEN nama_petugas = ? THEN 12 WHEN nama_petugas LIKE ? THEN 13 WHEN nama_petugas LIKE ? THEN 14 ELSE 15 END";

        if ($type === '' || $type === 'tiang') {
            $tiangRows = TiangModel::select(['id', 'kode_tiang', 'wilayah', 'kecamatan', 'kelurahan', 'nama_petugas'])
                ->selectRaw("{$rankSqlTiang} as r", [$exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like])
                ->where(function ($w) use ($like) {
                    $w->where('kode_tiang', 'like', $like)->orWhere('wilayah', 'like', $like)->orWhere('kecamatan', 'like', $like)->orWhere('kelurahan', 'like', $like)->orWhere('nama_petugas', 'like', $like);
                })
                ->orderBy('r')->orderBy('kode_tiang')->limit($limitPerType)->get();
            foreach ($tiangRows as $row) {
                $r = (int) $row->r;
                $isKode = $r <= 2;
                if ($isKode) {
                    $results->push(['id' => $row->id, 'kode' => $row->kode_tiang, 'type' => 'tiang', 'match' => 'kode', 'matchedValue' => $row->kode_tiang, 'label' => $row->kode_tiang . ' - ' . $row->wilayah . ' / ' . $row->kecamatan . ' / ' . $row->kelurahan, 'href' => "detail-tiang/{$row->id}", 'rank' => $r]);
                } else {
                    $field = $r <= 5 ? 'wilayah' : ($r <= 8 ? 'kecamatan' : ($r <= 11 ? 'kelurahan' : 'petugas'));
                    $val = $field === 'wilayah' ? $row->wilayah : ($field === 'kecamatan' ? $row->kecamatan : ($field === 'kelurahan' ? $row->kelurahan : $row->nama_petugas));
                    $href = null;
                    $parentWilayah = Cache::remember('wilayah:name:' . strtolower($row->wilayah ?? ''), 3600, fn() => WilayahModel::where('nama_wilayah', $row->wilayah)->first());
                    $parentWilayahId = $parentWilayah ? $parentWilayah->id : null;
                    if ($field === 'wilayah') {
                        $wModel = Cache::remember('wilayah:name:' . strtolower($val), 3600, fn() => WilayahModel::where('nama_wilayah', $val)->first());
                        if ($wModel) $href = "data-tiang?wilayah={$wModel->id}";
                        else $href = "data-tiang?q=" . urlencode($val);
                        $parentWilayahId = $wModel ? $wModel->id : $parentWilayahId;
                    } else {
                        $href = "data-tiang?q=" . urlencode($val);
                    }
                    $results->push(['id' => $row->id, 'kode' => $row->kode_tiang, 'type' => 'tiang', 'match' => $field, 'matchedValue' => $val, 'label' => ucfirst($field) . ": {$val}", 'href' => $href, 'wilayah' => $row->wilayah, 'wilayahId' => $parentWilayahId, 'rank' => $r + 2]);
                }
            }
        }

        if ($type === '' || $type === 'ont') {
            $ontRows = ONTModel::select(['id', 'kode_ont', 'wilayah', 'kecamatan', 'kelurahan', 'nama_petugas'])
                ->selectRaw("{$rankSqlOnt} as r", [$exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like, $exact, $prefix, $like])
                ->where(function ($w) use ($like) {
                    $w->where('kode_ont', 'like', $like)->orWhere('wilayah', 'like', $like)->orWhere('kecamatan', 'like', $like)->orWhere('kelurahan', 'like', $like)->orWhere('nama_petugas', 'like', $like);
                })
                ->orderBy('r')->orderBy('kode_ont')->limit($limitPerType)->get();
            foreach ($ontRows as $row) {
                $r = (int) $row->r;
                $isKode = $r <= 2;
                if ($isKode) {
                    $results->push(['id' => $row->id, 'kode' => $row->kode_ont, 'type' => 'ont', 'match' => 'kode', 'matchedValue' => $row->kode_ont, 'label' => $row->kode_ont . ' - ' . $row->wilayah . ' / ' . $row->kecamatan . ' / ' . $row->kelurahan, 'href' => "detail-ont/{$row->id}", 'rank' => $r]);
                } else {
                    $field = $r <= 5 ? 'wilayah' : ($r <= 8 ? 'kecamatan' : ($r <= 11 ? 'kelurahan' : 'petugas'));
                    $val = $field === 'wilayah' ? $row->wilayah : ($field === 'kecamatan' ? $row->kecamatan : ($field === 'kelurahan' ? $row->kelurahan : $row->nama_petugas));
                    $href = null;
                    $parentWilayah = Cache::remember('wilayah:name:' . strtolower($row->wilayah ?? ''), 3600, fn() => WilayahModel::where('nama_wilayah', $row->wilayah)->first());
                    $parentWilayahId = $parentWilayah ? $parentWilayah->id : null;
                    if ($field === 'wilayah') {
                        $wModel = Cache::remember('wilayah:name:' . strtolower($val), 3600, fn() => WilayahModel::where('nama_wilayah', $val)->first());
                        if ($wModel) $href = "data-ont?wilayah={$wModel->id}";
                        else $href = "data-ont?q=" . urlencode($val);
                        $parentWilayahId = $wModel ? $wModel->id : $parentWilayahId;
                    } else {
                        $href = "data-ont?q=" . urlencode($val);
                    }
                    $results->push(['id' => $row->id, 'kode' => $row->kode_ont, 'type' => 'ont', 'match' => $field, 'matchedValue' => $val, 'label' => ucfirst($field) . ": {$val}", 'href' => $href, 'wilayah' => $row->wilayah, 'wilayahId' => $parentWilayahId, 'rank' => $r + 2]);
                }
            }
        }

        $results = $results->sortBy('rank')->unique('href')->take(8)->values();
        return response()->json(['results' => $results]);
    }

    // Next Kode

    public function KodeBerikutnya(Request $request)
    {
        $kodeWil = trim((string) $request->query('kode_wilayah', ''));
        $wilayahName = trim((string) $request->query('wilayah', ''));
        $typeRaw = strtolower(trim((string) $request->query('type', 'tiang')));
        $type = $typeRaw === 'ont' ? 'ont' : 'tiang';

        $wilayahModel = null;
        if ($kodeWil !== '') {
            $wilayahModel = WilayahModel::where('kode_wilayah', $kodeWil)->first();
        }
        if (!$wilayahModel && $wilayahName !== '') {
            $wilayahModel = WilayahModel::where('nama_wilayah', $wilayahName)->first();
            if ($wilayahModel) $kodeWil = $wilayahModel->kode_wilayah;
        }
        if (!$wilayahModel) {
            return response()->json(['error' => 'Wilayah tidak ditemukan'], 404);
        }

        $prefix = 'SIMS-' . $kodeWil;
        $column = $type === 'ont' ? 'kode_ont' : 'kode_tiang';
        $modelClass = $type === 'ont' ? ONTModel::class : TiangModel::class;

        $codes = $modelClass::where($column, 'like', $prefix . '-%')->pluck($column);
        $max = 0;
        foreach ($codes as $code) {
            if (preg_match('/^' . preg_quote($prefix, '/') . '-(\d+)$/', $code, $m)) {
                $num = (int) $m[1];
                if ($num > $max) $max = $num;
            }
        }
        $nextNum = $max + 1;
        $nextKode = sprintf('%s-%03d', $prefix, $nextNum);

        return response()->json([
            'kode' => $nextKode,
            'prefix' => $prefix,
            'wilayah' => $wilayahModel->nama_wilayah,
            'kode_wilayah' => $kodeWil,
            'type' => $type,
        ]);
    }

    // Preview Peta

    public function Peta()
    {
        return Inertia::render('Peta');
    }

    // Wilayah

    public function Wilayah(Request $request)
    {
        $wilayahList = WilayahModel::all();

        $tiangGrouped = TiangModel::selectRaw("wilayah, COUNT(*) as total, SUM(CASE WHEN LOWER(status)='aktif' THEN 1 ELSE 0 END) as aktif, SUM(CASE WHEN LOWER(status)='nonaktif' THEN 1 ELSE 0 END) as nonaktif")
            ->groupBy('wilayah')
            ->get()
            ->keyBy('wilayah');

        $ontGrouped = ONTModel::selectRaw("wilayah, COUNT(*) as total, SUM(CASE WHEN LOWER(status)='aktif' THEN 1 ELSE 0 END) as aktif, SUM(CASE WHEN LOWER(status)='nonaktif' THEN 1 ELSE 0 END) as nonaktif")
            ->groupBy('wilayah')
            ->get()
            ->keyBy('wilayah');

        $rows = collect($wilayahList)->map(function ($w) use ($tiangGrouped, $ontGrouped) {
            $nama = $w->nama_wilayah;
            $tg = $tiangGrouped->get($nama);
            $og = $ontGrouped->get($nama);
            $totalTiang = $tg ? (int) $tg->total : 0;
            $totalOnt = $og ? (int) $og->total : 0;
            $aktif = (int) ($tg->aktif ?? 0) + (int) ($og->aktif ?? 0);
            $nonaktif = (int) ($tg->nonaktif ?? 0) + (int) ($og->nonaktif ?? 0);
            return [
                'id' => $w->id,
                'nama_wilayah' => $nama,
                'kode_wilayah' => $w->kode_wilayah,
                'total_tiang' => $totalTiang,
                'total_ont' => $totalOnt,
                'total_aset' => $totalTiang + $totalOnt,
                'aset_aktif' => $aktif,
                'aset_nonaktif' => $nonaktif,
            ];
        });

        $filterWilayah = $request->query('wilayah', '');
        $filterAset = $request->query('aset', '');

        if ($request->filled('wilayah')) {
            $wilayahFilter = Cache::remember('wilayah:' . $request->wilayah, 3600, fn() => WilayahModel::find($request->wilayah));
            if ($wilayahFilter) {
                $rows = $rows->where('id', (int) $wilayahFilter->id)->values();
            } else {
                $rows = $rows->where('nama_wilayah', $request->wilayah)->values();
            }
        }

        if ($request->filled('aset') && in_array($request->aset, ['tiang', 'ont'])) {
            if ($request->aset === 'tiang') {
                $rows = $rows->filter(fn($r) => $r['total_tiang'] > 0)->values();
                if ($request->filled('wilayah') && $rows->isEmpty()) {
                    $rows = collect($wilayahList)->map(function ($w) use ($tiangGrouped, $ontGrouped) {
                        $nama = $w->nama_wilayah;
                        $tg = $tiangGrouped->get($nama);
                        $og = $ontGrouped->get($nama);
                        return [
                            'id' => $w->id,
                            'nama_wilayah' => $nama,
                            'kode_wilayah' => $w->kode_wilayah,
                            'total_tiang' => $tg ? (int) $tg->total : 0,
                            'total_ont' => $og ? (int) $og->total : 0,
                            'total_aset' => ($tg ? (int) $tg->total : 0) + ($og ? (int) $og->total : 0),
                            'aset_aktif' => (int) ($tg->aktif ?? 0) + (int) ($og->aktif ?? 0),
                            'aset_nonaktif' => (int) ($tg->nonaktif ?? 0) + (int) ($og->nonaktif ?? 0),
                        ];
                    })->where('id', (int) $request->wilayah)->values();
                }
            }

            if ($request->aset === 'ont') {
                $rows = $rows->filter(fn($r) => $r['total_ont'] > 0)->values();
                if ($request->filled('wilayah') && $rows->isEmpty()) {
                    $rows = collect($wilayahList)->map(function ($w) use ($tiangGrouped, $ontGrouped) {
                        $nama = $w->nama_wilayah;
                        $tg = $tiangGrouped->get($nama);
                        $og = $ontGrouped->get($nama);
                        return [
                            'id' => $w->id,
                            'nama_wilayah' => $nama,
                            'kode_wilayah' => $w->kode_wilayah,
                            'total_tiang' => $tg ? (int) $tg->total : 0,
                            'total_ont' => $og ? (int) $og->total : 0,
                            'total_aset' => ($tg ? (int) $tg->total : 0) + ($og ? (int) $og->total : 0),
                            'aset_aktif' => (int) ($tg->aktif ?? 0) + (int) ($og->aktif ?? 0),
                            'aset_nonaktif' => (int) ($tg->nonaktif ?? 0) + (int) ($og->nonaktif ?? 0),
                        ];
                    })->where('id', (int) $request->wilayah)->values();
                }
            }
        }

        $page = max(1, (int) $request->query('page', 1));
        $perPage = 15;
        $totalRows = $rows->count();
        $paginatedRows = $rows->forPage($page, $perPage)->values();
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedRows,
            $totalRows,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Wilayah', [
            'dataWilayah' => $paginator,
            'wilayah' => $wilayahList,
            'filter' => [
                'wilayah' => $filterWilayah,
                'aset' => $filterAset,
            ],
        ]);
    }

    // Peta Sebaran Aset

    public function PetaSebaranAset()
    {
        $tiang = TiangModel::query()->select(['id', 'kode_tiang', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'latitude', 'longitude', 'nama_petugas'])
            ->whereNotNull('latitude')->where('latitude', '!=', '')
            ->whereNotNull('longitude')->where('longitude', '!=', '')
            ->orderByDesc('id')->limit(2000)->get();
        $ont = ONTModel::query()->select(['id', 'kode_ont', 'wilayah', 'kecamatan', 'kelurahan', 'status', 'latitude', 'longitude', 'nama_petugas'])
            ->whereNotNull('latitude')->where('latitude', '!=', '')
            ->whereNotNull('longitude')->where('longitude', '!=', '')
            ->orderByDesc('id')->limit(2000)->get();
        $wilayah = Cache::remember('wilayah:list', 3600, fn() => WilayahModel::all());

        return Inertia::render('PetaSebaranAset', [
            'tiang' => $tiang,
            'ont' => $ont,
            'wilayah' => $wilayah,
        ]);
    }

    // Detail Tiang

    public function DetailTiang($id)
    {
        $tiang = TiangModel::findOrFail($id);

        return Inertia::render('DetailTiang', [
            'tiang' => $tiang,
        ]);
    }

    // Detail ONT

    public function DetailONT($id)
    {
        $ont = ONTModel::findOrFail($id);

        return Inertia::render('DetailONT', [
            'ont' => $ont,
        ]);
    }

    // Login

    public function Masuk(Request $request)
    {
        if ($request->session()->has('login')) {
            return redirect('home');
        }

        $cookie = $request->cookie('gis_remember');
        if ($cookie && str_contains($cookie, '|')) {
            [$id, $plainToken] = explode('|', $cookie, 2);
            $user = UserModel::find($id);
            if ($user && $user->remember_token && hash_equals($user->remember_token, hash('sha256', $plainToken))) {
                $request->session()->regenerate();
                $request->session()->put([
                    'login' => true,
                    'user_id' => $user->id,
                    'username' => $user->username,
                ]);
                return redirect('home');
            }
        }

        return Inertia::render('Login');
    }

    // Lupa Password (publik)

    public function LupaPassword(Request $request)
    {
        if ($request->session()->has('login')) {
            return redirect('home');
        }

        $cookie = $request->cookie('gis_remember');
        if ($cookie && str_contains($cookie, '|')) {
            [$id, $plainToken] = explode('|', $cookie, 2);
            $user = UserModel::find($id);
            if ($user && $user->remember_token && hash_equals($user->remember_token, hash('sha256', $plainToken))) {
                $request->session()->regenerate();
                $request->session()->put([
                    'login' => true,
                    'user_id' => $user->id,
                    'username' => $user->username,
                ]);
                return redirect('home');
            }
        }

        return Inertia::render('LupaPassword');
    }

    // Notifikasi

    public function Notifikasi()
    {
        $notifikasi = NotifikasiModel::orderByRaw("CASE WHEN status = 'belum_dibaca' THEN 0 ELSE 1 END")->orderByDesc('id')->limit(100)->get();
        return Inertia::render('Notifikasi', [
            'notifikasi' => $notifikasi,
        ]);
    }

    // Detail Notifikasi

    public function DetailNotifikasi($id)
    {
        $notifikasi = NotifikasiModel::findOrFail($id);
        if ($notifikasi->status === 'belum_dibaca') {
            $notifikasi->update(['status' => 'dibaca']);
            $notifikasi->refresh();
        }
        $resetRequest = null;
        if ($notifikasi->reset_request_id) {
            $resetRequest = RequestPerubahanAkun::where('id', $notifikasi->reset_request_id)
                ->first(['id', 'tipe_request', 'requested_by', 'username_baru', 'status', 'handled_by', 'handled_at', 'created_at']);
        }
        return Inertia::render('DetailNotifikasi', [
            'notifikasi' => $notifikasi,
            'resetRequest' => $resetRequest,
        ]);
    }

    // Tandai Semua Notifikasi Dibaca

    public function TandaiSemuaDibaca()
    {
        NotifikasiModel::where('status', 'belum_dibaca')->update(['status' => 'dibaca']);
        return redirect('notifikasi');
    }

    // Hapus Semua Notifikasi yang Sudah Dibaca

    public function HapusSudahDibaca()
    {
        NotifikasiModel::where('status', 'dibaca')->delete();
        return redirect('notifikasi');
    }
    // Panduan Penggunaan

    public function Panduan()
    {
        return Inertia::render('Panduan', []);
    }

    // Pengaturan

    public function Pengaturan()
    {
        $wilayah = Cache::remember('wilayah:list', 3600, fn() => WilayahModel::all());
        $settings = Cache::remember('settings', 3600, function () {
            $path = storage_path('app/settings.json');
            if (!file_exists($path)) return [];
            return json_decode(file_get_contents($path), true) ?? [];
        });

        return Inertia::render('Pengaturan', [
            'wilayah' => $wilayah,
            'settings' => $settings,
            'resetRequests' => RequestPerubahanAkun::where('status', 'pending')
                ->orderByDesc('id')
                ->get(['id', 'tipe_request', 'requested_by', 'username_baru', 'created_at']),
            'resetHistory' => RequestPerubahanAkun::whereIn('status', ['approved', 'rejected'])
                ->orderByDesc('id')
                ->limit(5)
                ->get(['id', 'tipe_request', 'requested_by', 'username_baru', 'status', 'handled_by', 'handled_at']),
        ]);
    }
}
