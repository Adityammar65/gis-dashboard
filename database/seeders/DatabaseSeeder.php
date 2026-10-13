<?php

namespace Database\Seeders;

use App\Models\UserModel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Isi basis data aplikasi.
     */
    public function run(): void
    {
        // UserModel::factory(10)->create();
        $this->call([
            UserSeeder::class,
            WilayahSeeder::class,
            TiangSeeder::class,
            OntSeeder::class,
        ]);
    }
}
