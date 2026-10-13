<?php

namespace App\Http\Controllers;

use App\Helpers\NotifikasiHelper;
use App\Models\RequestPerubahanAkun;
use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SetelUlangKataSandiController extends Controller
{
    // Permintaan setel ulang kata sandi

    public function ajukan(Request $request)
    {
        $request->validate([
            'username' => ['required', 'string', 'exists:user,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'username.exists' => 'Username tidak ditemukan.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $username = $request->username;

        $pending = RequestPerubahanAkun::where('requested_by', $username)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return back()->withErrors([
                'Permintaan reset untuk username ini masih menunggu persetujuan admin.',
            ]);
        }

        $reset = RequestPerubahanAkun::create([
            'password_baru' => Hash::make($request->password),
            'tipe_request' => 'password_reset',
            'requested_by' => $username,
            'username_baru' => null,
            'status' => 'pending',
            'requested_ip' => $request->ip(),
        ]);

        $notif = NotifikasiHelper::kirim(
            'Reset Kata Sandi Diminta',
            'akun',
            "Permintaan reset kata sandi untuk username {$username} menunggu persetujuan.",
            $username
        );

        if ($notif) {
            $notif->update(['reset_request_id' => $reset->id]);
        }

        return back()->with('success', 'Permintaan reset terkirim. Tunggu persetujuan admin, lalu masuk dengan kata sandi baru.');
    }

    // Setujui permintaan

    public function setujui(Request $request, $id)
    {
        $reset = RequestPerubahanAkun::findOrFail($id);

        if (!$reset->isPending()) {
            return back()->withErrors(['Permintaan ini sudah ditindaklanjuti.']);
        }

        $penyetuju = $request->session()->get('username');
        $usernameAkun = $reset->requested_by;
        $jenis = $reset->tipe_request ?: 'password_reset';

        if ($penyetuju && $penyetuju === $usernameAkun) {
            return back()->withErrors(['Tidak dapat menyetujui permintaan akun sendiri.']);
        }

        $user = UserModel::where('username', $usernameAkun)->first();

        if (!$user) {
            return back()->withErrors(['Akun tidak ditemukan (mungkin sudah dihapus).']);
        }

        if ($jenis === 'username_change') {
            $userBaru = trim((string) ($reset->username_baru ?? ''));

            if ($userBaru === '' || $userBaru === $user->username) {
                return back()->withErrors(['Username baru tidak valid.']);
            }

            $sudahDipakai = UserModel::where('username', $userBaru)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($sudahDipakai) {
                return back()->withErrors(['Username baru sudah digunakan pengguna lain.']);
            }

            DB::table('user')->where('id', $user->id)->update([
                'username' => $userBaru,
                'updated_at' => now(),
            ]);

            $reset->update([
                'status' => 'approved',
                'handled_by' => $penyetuju,
                'handled_at' => now(),
            ]);

            return back()->with('success', "Username {$usernameAkun} berhasil diubah menjadi {$userBaru}.");
        }

        if (!$reset->password_baru) {
            return back()->withErrors(['Data kata sandi pada permintaan tidak valid.']);
        }

        DB::table('user')->where('id', $user->id)->update([
            'password' => $reset->password_baru,
            'remember_token' => null,
            'updated_at' => now(),
        ]);

        $reset->update([
            'status' => 'approved',
            'handled_by' => $penyetuju,
            'handled_at' => now(),
        ]);

        return back()->with('success', "Kata sandi akun {$usernameAkun} berhasil diatur ulang.");
    }

    // Tolak permintaan

    public function tolak(Request $request, $id)
    {
        $reset = RequestPerubahanAkun::findOrFail($id);

        if (!$reset->isPending()) {
            return back()->withErrors(['Permintaan ini sudah ditindaklanjuti.']);
        }

        $penyetuju = $request->session()->get('username');
        $usernameAkun = $reset->requested_by;

        if ($penyetuju && $penyetuju === $usernameAkun) {
            return back()->withErrors(['Tidak dapat menolak permintaan akun sendiri.']);
        }

        $reset->update([
            'status' => 'rejected',
            'handled_by' => $penyetuju,
            'handled_at' => now(),
        ]);

        return back()->with('success', "Permintaan akun {$usernameAkun} ditolak.");
    }
}
