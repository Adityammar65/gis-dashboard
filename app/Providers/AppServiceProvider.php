<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('settings', function () {
            return Cache::remember('settings', 3600, function () {
                $path = storage_path('app/settings.json');
                if (!file_exists($path)) return [];
                $json = file_get_contents($path);
                return json_decode($json, true) ?? [];
            });
        });
    }
}
