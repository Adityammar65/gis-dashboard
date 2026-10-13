<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WilayahModel;

class WilayahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $wilayah = [
            [
                'nama_wilayah' => 'yogyakarta',
                'kode_wilayah' => 'YGY'
            ],
            [
                'nama_wilayah' => 'sleman',
                'kode_wilayah' => 'SLM'
            ],
            [
                'nama_wilayah' => 'bantul',
                'kode_wilayah' => 'BTL'
            ],
            [
                'nama_wilayah' => 'kulon progo',
                'kode_wilayah' => 'KPG'
            ],
            [
                'nama_wilayah' => 'gunungkidul',
                'kode_wilayah' => 'GKL'
            ],
            [
                'nama_wilayah' => 'jepara',
                'kode_wilayah' => 'JPR'
            ],
            [
                'nama_wilayah' => 'sukoharjo',
                'kode_wilayah' => 'SKH'
            ],
            [
                'nama_wilayah' => 'magelang',
                'kode_wilayah' => 'MGL'
            ]
        ];

        foreach ($wilayah as $item) {
            WilayahModel::create($item);
        }
    }
}
