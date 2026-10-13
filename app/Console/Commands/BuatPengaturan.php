<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class BuatPengaturan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settings:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate default settings.json';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $path = storage_path('app/settings.json');

        if (File::exists($path)) {
            $this->warn('settings.json sudah ada.');
            return self::SUCCESS;
        }

        $settings = [
            'id' => 1,
            'nama_wilayah' => 'yogyakarta',
            'kode_wilayah' => 'YGY',
        ];

        File::put(
            $path,
            json_encode(
                $settings,
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            )
        );

        $this->info('settings.json berhasil dibuat.');
        $this->line("Wilayah default: {$settings['nama_wilayah']} ({$settings['kode_wilayah']})");

        return self::SUCCESS;
    }
}
