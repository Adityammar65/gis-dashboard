<?php

namespace App\Helpers;

use App\Models\NotifikasiModel;
use Illuminate\Support\Facades\Log;

class NotifikasiHelper
{
    public static function pesanKeberhasilan(string $aksi, string $tipe, string $kode, ?string $petugas = null): string
    {
        $label = $tipe === 'ont' ? 'Data ont' : 'Data tiang';
        if ($aksi === 'dihapus') {
            return "{$label} berhasil dihapus.";
        }
        return "{$label} berhasil {$aksi}.";
    }

    public static function labelKolom(string $tipe): array
    {
        $kode = $tipe === 'ont' ? 'kode_ont' : 'kode_tiang';
        $deskripsi = $tipe === 'ont' ? 'deskripsi_ont' : 'deskripsi_tiang';
        return [
            $kode => 'Kode',
            'wilayah' => 'Wilayah',
            'kecamatan' => 'Kecamatan',
            'kelurahan' => 'Kelurahan',
            $deskripsi => 'Deskripsi',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'nama_petugas' => 'Petugas',
            'status' => 'Status',
        ];
    }

    public static function detailPesan(string $aksi, string $tipe, array $lama = [], array $baru = []): string
    {
        $short = self::pesanKeberhasilan($aksi, $tipe, $baru['kode_tiang'] ?? $baru['kode_ont'] ?? $lama['kode_tiang'] ?? $lama['kode_ont'] ?? '');
        $labels = self::labelKolom($tipe);
        $lines = [];

        if ($aksi === 'diperbarui') {
            foreach ($labels as $key => $label) {
                $old = array_key_exists($key, $lama) ? self::formatNilai($lama[$key]) : null;
                $new = array_key_exists($key, $baru) ? self::formatNilai($baru[$key]) : null;
                if ($new === null || $old === $new) continue;
                $lines[] = "- {$label}: {$old} → {$new}";
            }
            $fotoKey = $tipe === 'ont' ? 'foto_ont_' : 'foto_tiang_';
            for ($i = 1; $i <= 5; $i++) {
                $k = $fotoKey . $i;
                if (!array_key_exists($k, $baru)) continue;
                $old = $lama[$k] ?? null;
                $new = $baru[$k] ?? null;
                if (empty($old) && empty($new)) continue;
                if ($new === null || $new === '') {
                    if (!empty($old)) $lines[] = "- Foto {$i}: dihapus";
                } elseif (empty($old)) {
                    $lines[] = "- Foto {$i}: ditambahkan";
                } else {
                    $lines[] = "- Foto {$i}: diganti";
                }
            }
            if (empty($lines)) {
                return $short . "\nTidak ada perubahan data.";
            }
            return $short . "\nPerubahan (" . count($lines) . "):\n" . implode("\n", $lines);
        }

        $snapshot = $aksi === 'dihapus' ? $lama : $baru;
        $prefix = $aksi === 'dihapus' ? 'Data yang dihapus:' : 'Detail data:';
        foreach ($labels as $key => $label) {
            if (!array_key_exists($key, $snapshot)) continue;
            $lines[] = "- {$label}: " . self::formatNilai($snapshot[$key]);
        }
        if (empty($lines)) return $short;
        return $short . "\n" . $prefix . "\n" . implode("\n", $lines);
    }

    private static function formatNilai($value): string
    {
        if ($value === null || $value === '') return '-';
        if (is_bool($value)) return $value ? 'ya' : 'tidak';
        return (string) $value;
    }

    public static function kirim(string $jenis, string $kategori, string $pesan, ?string $diperbaruiOleh = null): ?NotifikasiModel
    {
        try {
            if ($diperbaruiOleh === null || $diperbaruiOleh === '') {
                try {
                    $diperbaruiOleh = session('username');
                } catch (\Throwable $e) {
                    $diperbaruiOleh = null;
                }
            }
            return NotifikasiModel::create([
                'jenis' => $jenis,
                'kategori' => $kategori,
                'status' => 'belum_dibaca',
                'pesan' => $pesan,
                'updated_by' => $diperbaruiOleh,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Gagal membuat notifikasi: ' . $e->getMessage());
            return null;
        }
    }
}
