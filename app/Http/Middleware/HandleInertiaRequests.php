<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = Cache::remember('settings', 3600, function () {
            $path = storage_path('app/settings.json');
            if (!file_exists($path)) return [];
            return json_decode(file_get_contents($path), true) ?? [];
        });

        return [
            ...parent::share($request),

            'settings' => $settings,

            'auth' => [
                'username' => fn() => $request->session()->get('username'),
            ],

            'errors' => fn() => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->toArray()
                : (object) [],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'message' => fn() => $request->session()->get('message'),
            ],

            'unreadNotifikasi' => fn() => \App\Models\NotifikasiModel::where('status', 'belum_dibaca')->count(),
        ];
    }
}
