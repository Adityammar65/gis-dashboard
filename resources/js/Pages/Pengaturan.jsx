import MainLayout from "../Layouts/MainLayout";
import ThemeToggle from "../Components/ThemeToggle";
import { AuthInput, PasswordField } from "../Components/AuthFields";
import { FaMapMarked, FaSave, FaUserCog, FaKey, FaMoon, FaCheck, FaTimes, FaUserShield } from "react-icons/fa";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";

export default function Pengaturan({ wilayah, resetRequests = [], resetHistory = [] }) {
    const { props } = usePage();
    const { settings, auth, errors = {} } = props;
    const currentUsername = auth?.username ?? "";
    const [selectedWilayah, setSelectedWilayah] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const myPending = resetRequests.filter(
        (r) => r.requested_by === currentUsername
    );
    const myPendingUsername = myPending.find((r) => (r.tipe_request ?? "password_reset") === "username_change");
    const myPendingPassword = myPending.find((r) => {
        const t = r.tipe_request ?? "password_reset";
        return t === "password_change" || t === "password_reset";
    });

    const getRequestLabel = (item) => {
        const t = item?.tipe_request ?? "password_reset";
        if (t === "username_change") return "Ubah Username";
        if (t === "password_change") return "Ubah Kata Sandi";
        return "Reset Kata Sandi";
    };

    const getRequestDetail = (item) => {
        const t = item?.tipe_request ?? "password_reset";
        if (t === "username_change" && item?.username_baru) {
            return `${item.requested_by} → ${item.username_baru}`;
        }
        if (t === "password_change") {
            return `Ubah kata sandi akun ${item.requested_by}`;
        }
        return `Reset kata sandi akun ${item.requested_by}`;
    };

    const isOwnRequest = (item) => item?.requested_by === currentUsername;

    const handleSimpan = () => {
        if (!selectedWilayah) {
            return;
        }

        router.post("update-pengaturan", {
            wilayah: selectedWilayah,
        });
    };

    const usernameValue = newUsername.trim();
    const wantsUsernameChange =
        usernameValue !== "" && usernameValue !== currentUsername && !myPendingUsername;
    const passwordFilled =
        currentPassword !== "" || newPassword !== "" || confirmPassword !== "";
    const wantsPasswordChange =
        currentPassword !== "" && newPassword !== "" && confirmPassword !== "" && !myPendingPassword;
    const canAjukan = wantsUsernameChange || wantsPasswordChange;

    const handleAjukanPermintaan = () => {
        const payload = {};
        const clearUsername = wantsUsernameChange;
        const clearPassword = wantsPasswordChange || (passwordFilled && !myPendingPassword && !wantsUsernameChange);

        if (wantsUsernameChange) {
            payload.username = usernameValue;
        }

        if (passwordFilled && !myPendingPassword) {
            payload.current_password = currentPassword;
            payload.password = newPassword;
            payload.password_confirmation = confirmPassword;
        }

        if (Object.keys(payload).length === 0) {
            return;
        }

        router.post("update-profil", payload, {
            onSuccess: () => {
                if (clearUsername) setNewUsername("");
                if (clearPassword) {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                }
            },
        });
    };

    const handleApproveReset = (item) => {
        const id = typeof item === "object" ? item.id : item;
        const label = typeof item === "object" ? getRequestDetail(item) : `akun "${item}"`;
        if (!window.confirm(`Setujui ${getRequestLabel(typeof item === "object" ? item : null)} untuk ${label}?`)) {
            return;
        }

        router.post(`reset-requests/${id}/approve`);
    };

    const handleRejectReset = (item) => {
        const id = typeof item === "object" ? item.id : item;
        const label = typeof item === "object" ? getRequestDetail(item) : `akun "${item}"`;
        if (!window.confirm(`Tolak ${getRequestLabel(typeof item === "object" ? item : null)} untuk ${label}?`)) {
            return;
        }

        router.post(`reset-requests/${id}/reject`);
    };

    const formatWaktu = (value) => {
        if (!value) return "-";
        try {
            return new Date(value).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch {
            return String(value);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 text-white shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                    <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                        Pengaturan
                    </span>

                    <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">
                        /
                    </span>

                    <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                        {settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                    </span>
                </div>

                {/* Panduan & Pintasan */}

                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-night-700 dark:bg-night-900">
                    <p className="text-xs text-gray-600 dark:text-night-300">
                        Butuh bantuan memakai halaman ini? Lihat{" "}
                        <a
                            href="panduan"
                            className="font-medium text-[#ab3c3c] transition hover:text-[#68182A] hover:underline"
                        >
                            Panduan Penggunaan
                        </a>
                        .
                    </p>
                </div>

                {/* Profil Pengguna */}

                <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4">

                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EAEA] text-[#AB3C3C] dark:bg-night-800 dark:text-night-200">
                            <FaUserCog />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Profil Pengguna
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-night-400">
                                Ajukan perubahan username dan kata sandi — berlaku setelah disetujui admin lain
                            </p>
                        </div>
                    </div>

                    {myPending.length > 0 && (
                        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
                            Permintaanmu masih menunggu persetujuan ({myPending.length}):{" "}
                            {myPending.map(getRequestDetail).join(" • ")}. Kamu tidak dapat menyetujui permintaan sendiri.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Ubah Username */}

                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-5 shadow-sm">
                            <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-night-200">
                                Username Saat Ini
                            </p>

                            <p className="truncate text-base font-bold text-gray-800 dark:text-night-200" title={currentUsername}>
                                {currentUsername || "Belum diketahui"}
                            </p>

                            <div className="mt-5">
                                <AuthInput
                                    id="username-baru"
                                    type="text"
                                    label="Username Baru"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Masukkan username baru"
                                    autoComplete="username"
                                    error={errors.username}
                                    disabled={!!myPendingUsername}
                                />
                            </div>

                            {myPendingUsername && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                    Pengajuan {myPendingUsername.username} → {myPendingUsername.username_baru} menunggu persetujuan.
                                </p>
                            )}
                        </div>

                        {/* Ubah Kata Sandi */}

                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-gray-800 dark:text-night-200">
                                <FaKey className="text-xs text-gray-400 dark:text-night-500" />
                                <p className="text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400">
                                    Ubah Kata Sandi
                                </p>
                            </div>

                            <PasswordField
                                id="sandi-saat-ini"
                                label="Kata Sandi Saat Ini"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Masukkan kata sandi saat ini"
                                autoComplete="current-password"
                                show={showCurrentPassword}
                                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                                error={errors.current_password}
                                disabled={!!myPendingPassword}
                            />

                            <div className="mt-5">
                                <PasswordField
                                    id="sandi-baru"
                                    label="Kata Sandi Baru (min. 8 karakter)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi baru"
                                    autoComplete="new-password"
                                    minLength={8}
                                    show={showNewPassword}
                                    onToggle={() => setShowNewPassword(!showNewPassword)}
                                    error={errors.password}
                                    disabled={!!myPendingPassword}
                                />
                            </div>

                            <div className="mt-5">
                                <PasswordField
                                    id="sandi-konfirmasi"
                                    label="Konfirmasi Kata Sandi Baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi kata sandi baru"
                                    autoComplete="new-password"
                                    minLength={8}
                                    show={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={!!myPendingPassword}
                                />
                            </div>

                            {myPendingPassword && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                    Pengajuan ubah kata sandi untuk {myPendingPassword.username} menunggu persetujuan.
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Satu tombol pengajuan */}

                    <div className="mt-6 flex justify-end max-md:justify-stretch">
                        <button
                            type="button"
                            onClick={handleAjukanPermintaan}
                            disabled={!canAjukan}
                            className="flex items-center gap-2 rounded-xl bg-[#ab3c3c] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#68182A] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none max-md:w-full max-md:justify-center"
                        >
                            <FaSave />
                            Ajukan Permintaan
                        </button>
                    </div>

                </div>

                {/* Tampilan */}

                <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4 dark:bg-night-900 dark:border-night-700">

                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EAEA] text-[#AB3C3C] dark:bg-night-800 dark:text-amber-300">
                            <FaMoon />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Tampilan
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-night-400">
                                Pilih tema terang atau gelap untuk dashboard GIS
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-5 shadow-sm dark:bg-night-900 dark:border-night-700">
                            <p className="mb-3 text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400">
                                Tema Aktif
                            </p>
                            <ThemeToggle variant="switch" />
                        </div>

                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-gradient-to-b from-gray-50 to-white dark:from-night-800/60 dark:to-night-900 p-5 shadow-sm dark:from-night-800/60 dark:to-night-900 dark:border-night-700">
                            <p className="mb-1 text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400">
                                Catatan
                            </p>
                            <p className="text-sm text-gray-600 dark:text-night-300">
                                Pilihan tema tersimpan otomatis di perangkat ini dan berlaku untuk semua halaman termasuk peta.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Wilayah Operasi */}

                <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4 dark:bg-night-900 dark:border-night-700">

                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EAEA] text-[#AB3C3C] dark:bg-night-800 dark:text-night-200">
                            <FaMapMarked />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Wilayah Operasi
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-night-400">
                                Tentukan wilayah operasi yang digunakan pada dashboard GIS
                            </p>
                        </div>
                    </div>

                    {/* Ubah Wilayah */}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Wilayah Aktif */}

                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-gradient-to-b from-gray-50 to-white dark:from-night-800/60 dark:to-night-900 p-5 shadow-sm">
                            <p className="mb-1 text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400">
                                Wilayah Saat Ini
                            </p>

                            <p className="text-base font-bold capitalize text-gray-800 dark:text-night-200">
                                {settings?.nama_wilayah ?? "Belum ditentukan"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                Kode: <span className="font-mono font-medium">{settings?.kode_wilayah ?? "-"}</span>
                            </p>
                        </div>

                        {/* Pilih Wilayah */}

                        <div className="rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-5 shadow-sm">
                            <label
                                htmlFor="wilayah"
                                className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400"
                            >
                                Pilih Wilayah Baru
                            </label>

                            <select
                                id="wilayah"
                                value={selectedWilayah}
                                onChange={(e) =>
                                    setSelectedWilayah(e.target.value)
                                }
                                className="capitalize w-full rounded-xl border border-gray-200 dark:border-night-700 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 bg-white dark:bg-night-900 dark:text-night-200 dark:placeholder:text-night-500 shadow-sm"
                                disabled={wilayah.length === 0}
                            >
                                {wilayah.length === 0 ? (
                                    <option value="">
                                        Belum ada data wilayah
                                    </option>
                                ) : (
                                    <>
                                        <option value="">
                                            Pilih wilayah
                                        </option>

                                        {wilayah.map((item) => (
                                            <option
                                                className="capitalize"
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nama_wilayah}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                    </div>

                    {/* Simpan */}

                    <div className="mt-6 flex justify-end max-md:justify-stretch">
                        <button
                            type="button"
                            onClick={handleSimpan}
                            disabled={!selectedWilayah}
                            className="flex items-center gap-2 rounded-xl bg-[#AB3C3C] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#8f3030] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none max-md:w-full max-md:justify-center"
                        >
                            <FaSave />
                            Simpan
                        </button>
                    </div>

                </div>

                {/* Persetujuan Permintaan Akun */}

                <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4">

                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EAEA] text-[#AB3C3C] dark:bg-night-800 dark:text-night-200">
                            <FaUserShield />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Persetujuan Permintaan Akun
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-night-400">
                                Setujui atau tolak permintaan ubah username / kata sandi dari pengguna lain ({resetRequests.length} menunggu)
                            </p>
                        </div>
                    </div>

                    {resetRequests.length > 0 ? (
                        <div className="space-y-3">
                            {resetRequests.map((item) => {
                                const own = isOwnRequest(item);
                                return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 px-4 py-3 shadow-sm max-md:flex-wrap"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-night-200" title={getRequestDetail(item)}>
                                                {getRequestDetail(item)}
                                            </p>
                                            <span className="rounded-full bg-gray-100 dark:bg-night-800 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-night-300">
                                                {getRequestLabel(item)}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-night-400">
                                            Diminta {formatWaktu(item.created_at)}
                                        </p>
                                        {own && (
                                            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                                                Permintaan sendiri — menunggu admin lain.
                                            </p>
                                        )}
                                    </div>

                                    {!own ? (
                                    <div className="flex shrink-0 items-center gap-2 max-md:w-full">
                                        <button
                                            type="button"
                                            onClick={() => handleApproveReset(item)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] max-md:py-2.5"
                                        >
                                            <FaCheck size={12} />
                                            Setujui
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRejectReset(item)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-night-600 bg-white dark:bg-night-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-night-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-night-700 active:scale-[0.98] max-md:py-2.5"
                                        >
                                            <FaTimes size={12} />
                                            Tolak
                                        </button>
                                    </div>
                                    ) : null}
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed border-gray-200 dark:border-night-700 bg-gray-50/60 dark:bg-night-800/60 py-8 text-center text-xs text-gray-400 dark:text-night-500">
                            Tidak ada permintaan yang menunggu.
                        </p>
                    )}

                    {resetHistory.length > 0 && (
                        <div className="mt-5">
                            <p className="mb-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-night-400">
                                Riwayat Terakhir
                            </p>
                            <div className="space-y-2">
                                {resetHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs max-md:flex-wrap max-md:gap-1"
                                    >
                                        <span className="truncate font-medium text-gray-700 dark:text-night-200" title={getRequestDetail(item)}>
                                            {getRequestDetail(item)}{" "}
                                            <span className="font-normal text-gray-400">({getRequestLabel(item)})</span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2 text-gray-500 dark:text-night-400">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.status === "approved" ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300"}`}>
                                                {item.status === "approved" ? "Disetujui" : "Ditolak"}
                                            </span>
                                            <span className="max-md:hidden">
                                                {item.handled_by ? `oleh ${item.handled_by}` : ""}{item.handled_at ? ` • ${formatWaktu(item.handled_at)}` : ""}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </MainLayout>
    );
}
