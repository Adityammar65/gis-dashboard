<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\NotifikasiHelper;
use App\Models\RequestPerubahanAkun;
use App\Models\UserModel;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AutentikasiController extends Controller
{
    // Login

    public function ProsesLogin(Request $request)
    {

        // Validasi

        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        // Cari Username

        $user = UserModel::where('username', $request->username)->first();

        // Cek Username dan Password

        if (!$user || !Hash::check($request->password, $user->password))
            return back()->withErrors([
                'Username atau Password Salah'
            ]);

        $request->session()->regenerate();

        $request->session()->put([
            'login' => true,
            'user_id' => $user->id,
            'username' => $user->username
        ]);

        // Remember Me via database

        if ($request->boolean('remember')) {
            $plainToken = Str::random(60);
            $user->forceFill([
                'remember_token' => hash('sha256', $plainToken),
            ])->save();

            $cookieValue = $user->id . '|' . $plainToken;

            Cookie::queue(
                'gis_remember',
                $cookieValue,
                60 * 24 * 30, // Maks 30 Hari
                null,
                null,
                false,
                true,
                false,
                'lax'
            );
        } else {
            if ($user->remember_token) {
                $user->forceFill(['remember_token' => null])->save();
            }
            Cookie::queue(Cookie::forget('gis_remember'));
        }

        return redirect('home');
    }

    // Logout

    public function Keluar(Request $request)
    {
        if ($request->session()->has('user_id')) {
            $user = UserModel::find($request->session()->get('user_id'));
            if ($user && $user->remember_token) {
                $user->forceFill(['remember_token' => null])->save();
            }
        }

        if ($request->cookie('gis_remember')) {
            $parts = explode('|', $request->cookie('gis_remember'), 2);
            if (count($parts) === 2) {
                $user = UserModel::find($parts[0]);
                if ($user && $user->remember_token === hash('sha256', $parts[1])) {
                    $user->forceFill(['remember_token' => null])->save();
                }
            }
        }

        Cookie::queue(Cookie::forget('gis_remember'));

        $request->session()->flush();

        $request->session()->regenerate();

        return redirect('login');
    }

    // Pengajuan perubahan username

    public function perbaruiUser(Request $request)
    {
        $idUser = $request->session()->get('user_id');
        $user = $idUser ? UserModel::find($idUser) : null;

        if (!$user) {
            return back()->withErrors(['Sesi pengguna tidak ditemukan. Silakan masuk kembali.']);
        }

        $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('user', 'username')->ignore($user->id),
            ],
        ], [
            'username.unique' => 'Username sudah digunakan.',
        ]);

        $userBaru = trim($request->username);
        $userSaatIni = $user->username;

        if ($userBaru === $userSaatIni) {
            return back()->withErrors(['username' => 'Username baru sama dengan username saat ini.']);
        }

        $menunggu = RequestPerubahanAkun::where('status', 'pending')
            ->where('tipe_request', 'username_change')
            ->where('requested_by', $userSaatIni)
            ->exists();

        if ($menunggu) {
            return back()->withErrors([
                'Permintaan ubah username untuk akun ini masih menunggu persetujuan admin.',
            ]);
        }

        $reset = RequestPerubahanAkun::create([
            'password_baru' => null,
            'tipe_request' => 'username_change',
            'requested_by' => $userSaatIni,
            'username_baru' => $userBaru,
            'status' => 'pending',
            'requested_ip' => $request->ip(),
        ]);

        $notif = NotifikasiHelper::kirim(
            'Ubah Username Diminta',
            'akun',
            "Permintaan ubah username {$userSaatIni} → {$userBaru} menunggu persetujuan.",
            $userSaatIni
        );

        if ($notif) {
            $notif->update(['reset_request_id' => $reset->id]);
        }

        return redirect()
            ->back()
            ->with('success', 'Permintaan ubah username terkirim. Tunggu persetujuan admin sebelum berlaku.');
    }

    // Pengajuan perubahan password

    public function perbaruiKataSandi(Request $request)
    {
        $idUser = $request->session()->get('user_id');
        $user = $idUser ? UserModel::find($idUser) : null;

        if (!$user) {
            return back()->withErrors(['Sesi pengguna tidak ditemukan. Silakan masuk kembali.']);
        }

        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['Password saat ini salah.']);
        }

        $userSaatIni = $user->username;

        $menunggu = RequestPerubahanAkun::where('status', 'pending')
            ->whereIn('tipe_request', ['password_change', 'password_reset'])
            ->where('requested_by', $userSaatIni)
            ->exists();

        if ($menunggu) {
            return back()->withErrors([
                'Permintaan ubah kata sandi untuk akun ini masih menunggu persetujuan admin.',
            ]);
        }

        $reset = RequestPerubahanAkun::create([
            'password_baru' => Hash::make($request->password),
            'tipe_request' => 'password_change',
            'requested_by' => $userSaatIni,
            'username_baru' => null,
            'status' => 'pending',
            'requested_ip' => $request->ip(),
        ]);

        $notif = NotifikasiHelper::kirim(
            'Ubah Kata Sandi Diminta',
            'akun',
            "Permintaan ubah kata sandi untuk username {$userSaatIni} menunggu persetujuan.",
            $userSaatIni
        );

        if ($notif) {
            $notif->update(['reset_request_id' => $reset->id]);
        }

        return redirect()
            ->back()
            ->with('success', 'Permintaan ubah kata sandi terkirim. Tunggu persetujuan admin sebelum berlaku.');
    }

    // Pengajuan perubahan akun total

    public function perbaruiProfil(Request $request)
    {
        $idUser = $request->session()->get('user_id');
        $user = $idUser ? UserModel::find($idUser) : null;

        if (!$user) {
            return back()->withErrors(['Sesi pengguna tidak ditemukan. Silakan masuk kembali.']);
        }

        $userSaatIni = $user->username;
        $userBaru = trim((string) $request->input('username', ''));
        $inginUser = $userBaru !== '' && $userBaru !== $userSaatIni;

        $kataSandiSaatIni = (string) $request->input('current_password', '');
        $password = (string) $request->input('password', '');
        $konfirmasiKataSandi = (string) $request->input('password_confirmation', '');
        $inginKataSandi = $kataSandiSaatIni !== '' || $password !== '' || $konfirmasiKataSandi !== '';

        if (!$inginUser && !$inginKataSandi) {
            return back()->withErrors(['Tidak ada perubahan yang diajukan.']);
        }

        if ($inginUser) {
            $request->validate([
                'username' => [
                    'required',
                    'string',
                    'min:3',
                    'max:255',
                    Rule::unique('user', 'username')->ignore($user->id),
                ],
            ], [
                'username.unique' => 'Username sudah digunakan.',
            ]);

            $menungguUser = RequestPerubahanAkun::where('status', 'pending')
                ->where('tipe_request', 'username_change')
                ->where('requested_by', $userSaatIni)
                ->exists();

            if ($menungguUser) {
                return back()->withErrors([
                    'Permintaan ubah username untuk akun ini masih menunggu persetujuan admin.',
                ]);
            }
        }

        if ($inginKataSandi) {
            $request->validate([
                'current_password' => ['required', 'string'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            if (!Hash::check($kataSandiSaatIni, $user->password)) {
                return back()->withErrors(['Password saat ini salah.']);
            }

            $menungguKataSandi = RequestPerubahanAkun::where('status', 'pending')
                ->whereIn('tipe_request', ['password_change', 'password_reset'])
                ->where('requested_by', $userSaatIni)
                ->exists();

            if ($menungguKataSandi) {
                return back()->withErrors([
                    'Permintaan ubah kata sandi untuk akun ini masih menunggu persetujuan admin.',
                ]);
            }
        }

        $dibuat = [];

        if ($inginUser) {
            $reset = RequestPerubahanAkun::create([
                'password_baru' => null,
                'tipe_request' => 'username_change',
                'requested_by' => $userSaatIni,
                'username_baru' => $userBaru,
                'status' => 'pending',
                'requested_ip' => $request->ip(),
            ]);

            $notif = NotifikasiHelper::kirim(
                'Ubah Username Diminta',
                'akun',
                "Permintaan ubah username {$userSaatIni} → {$userBaru} menunggu persetujuan.",
                $userSaatIni
            );

            if ($notif) {
                $notif->update(['reset_request_id' => $reset->id]);
            }

            $dibuat[] = 'username';
        }

        if ($inginKataSandi) {
            $reset = RequestPerubahanAkun::create([
                'password_baru' => Hash::make($password),
                'tipe_request' => 'password_change',
                'requested_by' => $userSaatIni,
                'username_baru' => null,
                'status' => 'pending',
                'requested_ip' => $request->ip(),
            ]);

            $notif = NotifikasiHelper::kirim(
                'Ubah Kata Sandi Diminta',
                'akun',
                "Permintaan ubah kata sandi untuk username {$userSaatIni} menunggu persetujuan.",
                $userSaatIni
            );

            if ($notif) {
                $notif->update(['reset_request_id' => $reset->id]);
            }

            $dibuat[] = 'kata sandi';
        }

        return redirect()
            ->back()
            ->with('success', 'Permintaan ubah ' . implode(' dan ', $dibuat) . ' terkirim. Tunggu persetujuan admin sebelum berlaku.');
    }
}
