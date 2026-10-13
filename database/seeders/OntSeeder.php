<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ONTModel;
use Illuminate\Support\Str;

class OntSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 2 per wilayah, kode O-<KODE>-<n>, random area, lorem 5 words, petugas John/Jane Doe, 404 dummy image.
     * Run manually: php artisan db:seed --class=OntSeeder
     * Not registered in DatabaseSeeder.
     */
    public function run(): void
    {
        $areas = ['Area A', 'Area B', 'Area C', 'Kawasan 1', 'Kawasan 2', 'Blok Utara', 'Blok Selatan'];
        $kelurahan = ['Kel. A', 'Kel. B', 'Kelurahan C', 'Kelurahan 1', 'Kelurahan 2', 'Kel. Utara', 'Kel. Selatan'];
        $lorems = [
            'Lorem ipsum dolor sit amet',
            'Consectetur adipiscing elit sed do',
            'Ut enim ad minim veniam',
            'Duis aute irure dolor reprehenderit',
            'Excepteur sint occaecat cupidatat non',
            'Sed ut perspiciatis unde omnis',
            'Nemo enim ipsam voluptatem quia',
        ];
        $petugas = ['John Doe', 'Jane Doe'];

        $wilayahData = [
            ['nama' => 'yogyakarta', 'kode' => 'YGY', 'bbox' => [-7.825, -7.770, 110.330, 110.390]],
            ['nama' => 'sleman', 'kode' => 'SLM', 'bbox' => [-7.760, -7.680, 110.300, 110.450]],
            ['nama' => 'bantul', 'kode' => 'BTL', 'bbox' => [-7.930, -7.860, 110.300, 110.450]],
            ['nama' => 'kulon progo', 'kode' => 'KPG', 'bbox' => [-7.950, -7.710, 110.050, 110.250]],
            ['nama' => 'gunungkidul', 'kode' => 'GKL', 'bbox' => [-8.120, -7.850, 110.450, 110.750]],
            ['nama' => 'jepara', 'kode' => 'JPR', 'bbox' => [-6.750, -6.450, 110.600, 110.900]],
            ['nama' => 'sukoharjo', 'kode' => 'SKH', 'bbox' => [-7.820, -7.620, 110.750, 110.950]],
            ['nama' => 'magelang', 'kode' => 'MGL', 'bbox' => [-7.620, -7.400, 110.100, 110.300]],
        ];

        foreach ($wilayahData as $w) {
            [$latMin, $latMax, $lngMin, $lngMax] = $w['bbox'];
            for ($n = 1; $n <= 2; $n++) {
                $lat = $latMin + (mt_rand() / mt_getrandmax()) * ($latMax - $latMin);
                $lng = $lngMin + (mt_rand() / mt_getrandmax()) * ($lngMax - $lngMin);

                ONTModel::create([
                    'kode_ont' => sprintf("SIMS-%s-%03d", $w['kode'], $n),
                    'wilayah' => $w['nama'],
                    'kecamatan' => $areas[array_rand($areas)],
                    'kelurahan' => $kelurahan[array_rand($kelurahan)],
                    'deskripsi_ont' => Str::words($lorems[array_rand($lorems)], 5, ''),
                    'foto_ont_1' => 'ont/dummy.jpg',
                    'foto_ont_2' => 'ont/dummy.jpg',
                    'foto_ont_3' => 'ont/dummy.jpg',
                    'foto_ont_4' => 'ont/dummy.jpg',
                    'foto_ont_5' => 'ont/dummy.jpg',
                    'latitude' => number_format($lat, 6, '.', ''),
                    'longitude' => number_format($lng, 6, '.', ''),
                    'nama_petugas' => $petugas[array_rand($petugas)],
                    'status' => (bool) random_int(0, 1) ? 'aktif' : 'nonaktif',
                ]);
            }
        }
    }
}
