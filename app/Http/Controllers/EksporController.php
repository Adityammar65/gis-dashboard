<?php

namespace App\Http\Controllers;

use App\Models\TiangModel;
use App\Models\ONTModel;
use App\Models\WilayahModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class EksporController extends Controller
{
    // Jumlah Baris

    const PER_HALAMAN = 15;

    // Baris Judul

    const JUDUL_BARIS = 3;

    // Warna

    const WARNA_JUDUL = '6F2424';
    const WARNA_HEADER = '6F2424';
    const WARNA_BORDER = 'D9D9D9';

    // Ekspor

    public function aset(Request $request, string $type, string $format)
    {
        $config = $this->konfigurasiAset($type);

        $cakupan = strtolower(trim((string) $request->query('scope', 'halaman')));
        $semua = in_array($cakupan, ['all', 'semua', 'semua-data', 'semua_data'], true);

        if ($semua) {
            $items = $this->bangunKueri($type, $request)->latest('id')->get();

            if ($items->isEmpty()) {
                return response()->json(['message' => 'Tidak ada data yang dapat diexpor pada filter saat ini.'], 422);
            }

            $rows = $items
                ->values()
                ->map(fn($item, $index) => $this->petakanBaris($item, $config, $index + 1))
                ->all();

            $meta = [
                'judul' => $config['judul'],
                'label' => $config['label'],
                'namaWilayah' => $this->wilayahEkspor($request),
                'waktu' => now()->format('d-m-Y H:i'),
                'halaman' => 1,
                'totalHalaman' => 1,
                'totalData' => $items->count(),
                'cakupan' => 'semua',
                'filter' => $this->labelPenyaring($request),
            ];

            $filename = $this->namaBerkasSemua($config['label']);

            if ($format === 'excel') {
                return $this->buatExcel($rows, $config, $meta, $filename);
            }

            return $this->buatPdf($rows, $config, $meta, $filename);
        }

        $page = max(1, $request->integer('page', 1));

        $paginator = $this->bangunKueri($type, $request)
            ->paginate(self::PER_HALAMAN, ['*'], 'page', $page);

        if ($paginator->total() > 0 && $paginator->isEmpty()) {
            return response()->json(['message' => 'Halaman ini tidak memiliki data. Kembali ke halaman pertama lalu export ulang.'], 422);
        }

        if ($paginator->isEmpty()) {
            return response()->json(['message' => 'Tidak ada data yang dapat diexpor pada filter saat ini.'], 422);
        }

        $offset = ($paginator->currentPage() - 1) * self::PER_HALAMAN;

        $rows = $paginator
            ->getCollection()
            ->values()
            ->map(fn($item, $index) => $this->petakanBaris($item, $config, $offset + $index + 1))
            ->all();

        $meta = [
            'judul' => $config['judul'],
            'label' => $config['label'],
            'namaWilayah' => $this->wilayahEkspor($request),
            'waktu' => now()->format('d-m-Y H:i'),
            'halaman' => $paginator->currentPage(),
            'totalHalaman' => $paginator->lastPage(),
            'totalData' => $paginator->total(),
            'cakupan' => 'halaman',
            'filter' => $this->labelPenyaring($request),
        ];

        $filename = $this->namaBerkas($config['label'], $page);

        if ($format === 'excel') {
            return $this->buatExcel($rows, $config, $meta, $filename);
        }

        return $this->buatPdf($rows, $config, $meta, $filename);
    }

    // Konfigurasi Aset

    private function konfigurasiAset(string $type): array
    {
        if ($type === 'ont') {
            return [
                'model' => ONTModel::class,
                'judul' => 'Data ONT',
                'label' => 'ONT',
                'kode' => 'kode_ont',
                'deskripsi' => 'deskripsi_ont',
            ];
        }

        return [
            'model' => TiangModel::class,
            'judul' => 'Data Tiang',
            'label' => 'Tiang',
            'kode' => 'kode_tiang',
            'deskripsi' => 'deskripsi_tiang',
        ];
    }

    // Kueri + Penyaring

    private function bangunKueri(string $type, Request $request)
    {
        $config = $this->konfigurasiAset($type);
        $kode = $config['kode'];

        $query = $config['model']::query()->select([
            'id',
            $kode,
            'wilayah',
            'kecamatan',
            'kelurahan',
            $config['deskripsi'],
            'latitude',
            'longitude',
            'nama_petugas',
            'status',
            'created_at',
            'updated_at',
        ]);

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
                $query->where(function ($w) use ($like, $kode) {
                    $w->where($kode, 'like', $like)
                        ->orWhere('wilayah', 'like', $like)
                        ->orWhere('kecamatan', 'like', $like)
                        ->orWhere('kelurahan', 'like', $like)
                        ->orWhere('nama_petugas', 'like', $like);
                });
            }
        }

        return $query->latest('id');
    }

    // Baris Laporan

    private function petakanBaris($item, array $config, int $no): array
    {
        $latitude = trim((string) $item->latitude);
        $longitude = trim((string) $item->longitude);
        $peta = '';

        if ($latitude !== '' && $longitude !== '') {
            $peta = 'https://www.google.com/maps?q=' . rawurlencode($latitude) . ',' . rawurlencode($longitude);
        }

        return [
            'no' => $no,
            'kode' => (string) $item->{$config['kode']},
            'wilayah' => (string) $item->wilayah,
            'kecamatan' => (string) $item->kecamatan,
            'kelurahan' => (string) $item->kelurahan,
            'deskripsi' => trim((string) $item->{$config['deskripsi']}),
            'latitude' => $latitude,
            'longitude' => $longitude,
            'petugas' => (string) $item->nama_petugas,
            'status' => ucfirst((string) $item->status),
            'dibuat' => $item->created_at ? $item->created_at->format('d-m-Y H:i') : '-',
            'diperbarui' => $item->updated_at ? $item->updated_at->format('d-m-Y H:i') : '-',
            'peta' => $peta,
        ];
    }

    // Nama Wilayah

    private function wilayahEkspor(Request $request): string
    {
        if ($request->filled('wilayah')) {
            $wilayah = Cache::remember('wilayah:' . $request->wilayah, 3600, fn() => WilayahModel::find($request->wilayah));
            if ($wilayah) {
                return ucfirst($wilayah->nama_wilayah);
            }
        }

        return 'Semua';
    }

    // Penyaring Laporan

    private function labelPenyaring(Request $request): array
    {
        $labels = [];

        if ($request->filled('kecamatan')) {
            $labels[] = 'Kecamatan: ' . trim((string) $request->kecamatan);
        }

        if ($request->filled('kelurahan')) {
            $labels[] = 'Kelurahan: ' . trim((string) $request->kelurahan);
        }

        if ($request->filled('status')) {
            $labels[] = 'Status: ' . ucfirst(trim((string) $request->status));
        }

        if ($request->filled('q')) {
            $labels[] = 'Pencarian: ' . trim((string) $request->q);
        }

        return $labels;
    }

    // Nama Berkas

    private function namaBerkas(string $label, int $page): string
    {
        $suffix = $page > 1 ? '-Hal' . $page : '';

        return 'Data-' . $label . $suffix . '-' . now()->format('Y-m-d');
    }

    // Nama Berkas Semua

    private function namaBerkasSemua(string $label): string
    {
        return 'Data-' . $label . '-Semua-' . now()->format('Y-m-d');
    }

    // Kepala Kolom

    private function kepalaKolom(array $config): array
    {
        return [
            'No',
            'Kode ' . $config['label'],
            'Wilayah',
            'Kecamatan',
            'Kelurahan',
            'Deskripsi',
            'Latitude',
            'Longitude',
            'Petugas Lapangan',
            'Status',
            'Dibuat',
            'Diperbarui',
            'Peta',
        ];
    }

    // PDF A4 Lanskap

    private function buatPdf(array $rows, array $config, array $meta, string $filename)
    {
        return Pdf::loadView('exports.aset', [
            'baris' => $rows,
            'headers' => $this->kepalaKolom($config),
            'meta' => $meta,
            'jumlahKolom' => count($this->kepalaKolom($config)),
        ])
            ->setPaper('a4', 'landscape')
            ->download($filename . '.pdf');
    }

    // XLSX

    private function buatExcel(array $rows, array $config, array $meta, string $filename)
    {
        $headers = $this->kepalaKolom($config);
        $jumlahKolom = count($headers);
        $kolomTerakhir = $this->kolomTerakhir($jumlahKolom);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($config['label']);

        $lebar = [
            'A' => 5,
            'B' => 22,
            'C' => 20,
            'D' => 20,
            'E' => 20,
            'F' => 46,
            'G' => 13,
            'H' => 13,
            'I' => 24,
            'J' => 12,
            'K' => 18,
            'L' => 18,
            'M' => 14,
        ];

        foreach ($lebar as $kolom => $lebarKolom) {
            $sheet->getColumnDimension($kolom)->setWidth($lebarKolom);
        }

        // Judul

        $sheet->mergeCells('A1:' . $kolomTerakhir . '1');
        $sheet->setCellValue('A1', strtoupper($meta['judul']));
        $sheet->getStyle('A1:' . $kolomTerakhir . '1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => self::WARNA_JUDUL]],
            'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(24);

        // Kop

        $sheet->mergeCells('A2:' . $kolomTerakhir . '2');
        $cakupanKop = ($meta['cakupan'] ?? 'halaman') === 'semua'
            ? 'Semua data'
            : 'Halaman ' . $meta['halaman'] . ' dari ' . $meta['totalHalaman'];
        $sheet->setCellValue('A2', 'Wilayah: ' . $meta['namaWilayah'] . '  |  Dicetak: ' . $meta['waktu'] . '  |  ' . $cakupanKop . '  |  Total data: ' . $meta['totalData']);
        $sheet->getStyle('A2:' . $kolomTerakhir . '2')->applyFromArray([
            'font' => ['size' => 9, 'color' => ['rgb' => '555555']],
            'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        ]);

        if (!empty($meta['filter'])) {
            $sheet->mergeCells('A3:' . $kolomTerakhir . '3');
            $sheet->setCellValue('A3', 'Filter: ' . implode('  |  ', $meta['filter']));
            $sheet->getStyle('A3:' . $kolomTerakhir . '3')->applyFromArray([
                'font' => ['size' => 9, 'italic' => true, 'color' => ['rgb' => '555555']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
            ]);
        }

        // Kepala

        $barisHeader = self::JUDUL_BARIS + 1;

        foreach ($headers as $offset => $header) {
            $sheet->setCellValue($this->alamatSel($offset + 1, $barisHeader), $header);
        }

        $sheet->getStyle('A' . $barisHeader . ':' . $kolomTerakhir . $barisHeader)->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::WARNA_HEADER]],
            'alignment' => ['horizontal' => 'center', 'vertical' => 'center', 'wrapText' => true],
            'borders' => $this->bingkai(),
        ]);
        $sheet->getRowDimension($barisHeader)->setRowHeight(24);

        // Data

        $barisAwal = $barisHeader + 1;

        foreach ($rows as $index => $row) {
            $nomorBaris = $barisAwal + $index;

            $nilai = [
                $row['no'],
                $row['kode'],
                $row['wilayah'],
                $row['kecamatan'],
                $row['kelurahan'],
                $row['deskripsi'],
                $row['latitude'],
                $row['longitude'],
                $row['petugas'],
                $row['status'],
                $row['dibuat'],
                $row['diperbarui'],
                $row['peta'] !== '' ? 'Lihat Peta' : '-',
            ];

            foreach ($nilai as $offset => $value) {
                $sheet->setCellValue($this->alamatSel($offset + 1, $nomorBaris), $value);
            }

            if ($row['peta'] !== '') {
                $sheet->getCell('M' . $nomorBaris)->getHyperlink()->setUrl($row['peta']);
                $sheet->getStyle('M' . $nomorBaris)->getFont()->setColor(new Color('1D4ED8'));
                $sheet->getStyle('M' . $nomorBaris)->getFont()->setUnderline(true);
            }

            $sheet->getStyle('A' . $nomorBaris . ':' . $kolomTerakhir . $nomorBaris)->applyFromArray([
                'font' => ['size' => 10],
                'alignment' => ['vertical' => 'top', 'wrapText' => true],
                'borders' => $this->bingkai(),
            ]);

            $sheet->getStyle('A' . $nomorBaris)->getAlignment()->setHorizontal('center');
            $sheet->getStyle('G' . $nomorBaris . ':' . $kolomTerakhir . $nomorBaris)->getAlignment()->setHorizontal('center');
            $sheet->getStyle('J' . $nomorBaris)->getAlignment()->setHorizontal('center');
            $sheet->getStyle('M' . $nomorBaris)->getAlignment()->setHorizontal('center');
        }

        $barisAkhir = $barisAwal + count($rows) - 1;

        $sheet->freezePane('A' . $barisAwal);
        $sheet->setAutoFilter('A' . $barisHeader . ':' . $kolomTerakhir . $barisAkhir);

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function alamatSel(int $kolom, int $baris): string
    {
        return Coordinate::stringFromColumnIndex($kolom) . $baris;
    }

    private function kolomTerakhir(int $jumlahKolom): string
    {
        return Coordinate::stringFromColumnIndex($jumlahKolom);
    }

    private function bingkai(): array
    {
        $garis = ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::WARNA_BORDER]];

        return [
            'allBorders' => $garis,
            'outline' => [
                'borderStyle' => Border::BORDER_MEDIUM,
                'color' => ['rgb' => self::WARNA_BORDER],
            ],
        ];
    }
}
