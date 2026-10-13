<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use App\Models\UserModel;
use Symfony\Component\HttpFoundation\Response;

class CekLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('login')) {
            // Try auto-login via remember_token cookie
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

                    return $next($request);
                }

                // Invalid token -> clear cookie
                Cookie::queue(Cookie::forget('gis_remember'));
            }

            return redirect('login');
        }

        return $next($request);
    }
}
