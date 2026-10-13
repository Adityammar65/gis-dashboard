import MainLayout from "../Layouts/MainLayout";
import { FaArrowLeft, FaWifi, FaMap, FaUser, FaKey, FaCheck, FaTimes } from "react-icons/fa";
import { LuUtilityPole } from "react-icons/lu";
import { useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import useBase from "../hooks/useBase";

const getIconByKategori = (kategori) => {
    const k = (kategori || "").toLowerCase();
    if (k === "ont") return FaWifi;
    if (k === "wilayah") return FaMap;
    return LuUtilityPole;
};

const getNotifikasiVisual = (item) => {
    const jenis = item?.jenis || "";
    const kategori = (item?.kategori || "").toLowerCase();

    if (jenis.includes("Ditambahkan")) {
        return {
            Icon: getIconByKategori(kategori),
            circle: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-300",
        };
    }
    if (jenis.includes("Diperbarui")) {
        return {
            Icon: getIconByKategori(kategori),
            circle: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-300",
        };
    }
    if (jenis.includes("Dihapus")) {
        return {
            Icon: getIconByKategori(kategori),
            circle: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300",
        };
    }
    if (jenis.includes("Reset")) {
        return {
            Icon: FaKey,
            circle: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
        };
    }
    return { Icon: null, circle: "" };
};

const parsePesan = (pesan = "") => {
    const lines = String(pesan || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { summary: "-", changes: [], details: [] };
    const summary = lines[0];
    const changes = [];
    const details = [];
    let mode = null;

    for (const line of lines.slice(1)) {
        if (/^perubahan/i.test(line)) { mode = "changes"; continue; }
        if (/^detail data/i.test(line) || /^data yang dihapus/i.test(line)) { mode = "details"; continue; }
        if (/^tidak ada perubahan/i.test(line)) { mode = null; continue; }
        if (!line.startsWith("-")) continue;
        const body = line.replace(/^-\s*/, "");
        const arrowIdx = body.indexOf("→");
        if (arrowIdx !== -1) {
            const field = body.slice(0, body.indexOf(":")).trim();
            const [oldVal, newVal] = body.split("→").map((s) => {
                const part = s.trim();
                return part.includes(":") ? part.slice(part.indexOf(":") + 1).trim() : part;
            });
            changes.push({ field, oldVal, newVal });
        } else if (body.includes(":")) {
            const idx = body.indexOf(":");
            details.push({ field: body.slice(0, idx).trim(), value: body.slice(idx + 1).trim() });
        } else if (mode === "changes") {
            changes.push({ field: body, oldVal: "-", newVal: "-" });
        } else {
            details.push({ field: "-", value: body });
        }
    }

    return { summary, changes, details };
};

export default function DetailNotifikasi({ notifikasi, resetRequest = null }) {
    const { settings, auth } = usePage().props;
    const item = useMemo(() => (Array.isArray(notifikasi) ? notifikasi[0] : notifikasi) || null, [notifikasi]);
    const { Icon, circle } = getNotifikasiVisual(item || {});
    const { summary, changes, details } = useMemo(() => parsePesan(item?.pesan), [item]);
    const belumDibaca = item?.status === "belum_dibaca";
    const actor = item?.updated_by || item?.username || item?.actor || null;
    const aksiLabel = String(item?.jenis || "").includes("Ditambahkan")
        ? "Ditambahkan"
        : String(item?.jenis || "").includes("Dihapus")
            ? "Dihapus"
            : String(item?.jenis || "").includes("Diperbarui")
                ? "Diperbarui"
                : null;
    const aksiColor = aksiLabel === "Ditambahkan"
        ? "text-emerald-600 dark:text-emerald-300"
        : aksiLabel === "Dihapus"
            ? "text-rose-600 dark:text-rose-300"
            : "text-amber-600 dark:text-amber-300";
    const base = useBase();
    const handleBack = () => {
        router.get(`${base}/notifikasi`.replace(/\/+/g, '/'));
    };

    const requestType = resetRequest?.tipe_request ?? "password_reset";
    const requestLabel =
        requestType === "username_change"
            ? "Ubah Username"
            : requestType === "password_change"
              ? "Ubah Kata Sandi"
              : "Reset Kata Sandi";
    const requestDetail =
        requestType === "username_change" && resetRequest?.username_baru
            ? `${resetRequest.requested_by} → ${resetRequest.username_baru}`
            : `akun "${resetRequest?.requested_by}"`;
    const currentUsername = auth?.username ?? null;
    const isOwnRequest = resetRequest
        ? resetRequest.requested_by === currentUsername
        : false;

    const handleApproveReset = () => {
        if (!resetRequest) return;
        if (!window.confirm(`Setujui ${requestLabel} untuk ${requestDetail}?`)) {
            return;
        }

        router.post(`${base}/reset-requests/${resetRequest.id}/approve`.replace(/\/+/g, '/'));
    };

    const handleRejectReset = () => {
        if (!resetRequest) return;
        if (!window.confirm(`Tolak ${requestLabel} untuk ${requestDetail}?`)) {
            return;
        }

        router.post(`${base}/reset-requests/${resetRequest.id}/reject`.replace(/\/+/g, '/'));
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

                <div className="flex items-stretch justify-between gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">
                    <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 text-white shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Detail Notifikasi
                        </span>

                        <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">
                            /
                        </span>

                        <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                            {settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleBack}
                        title="Kembali"
                        aria-label="Kembali"
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-2.5 text-xs font-medium text-white shadow-md transition hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-[0.98] max-md:rounded-lg max-md:px-4 max-md:py-4"
                    >
                        <FaArrowLeft />
                        <span className="max-md:hidden">Kembali</span>
                    </button>
                </div>

                {!item ? (
                    <div className="rounded-2xl bg-white dark:bg-night-900 px-5 py-10 text-center shadow-sm border border-gray-100 dark:border-night-700">
                        <p className="text-sm text-gray-500 dark:text-night-400">
                            Data notifikasi tidak ditemukan.
                        </p>
                    </div>
                ) : (
                    <>

                        {/* Ringkasan */}

                        <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-night-900 px-5 py-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:flex-col max-md:items-start max-md:gap-3 max-md:px-4">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ring-1 ring-white/40 ${circle || (belumDibaca
                                    ? "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300"
                                    : "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-300")
                                    }`}
                            >
                                {Icon ? (
                                    <Icon size={20} />
                                ) : belumDibaca ? (
                                    "⚠"
                                ) : (
                                    "✓"
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-night-200">
                                    {item.jenis}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                    {item.kategori}
                                </p>
                                {actor ? (
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-night-400">
                                        <FaUser size={9} className="shrink-0 text-gray-400 dark:text-night-500" />
                                        <span className="truncate max-w-[200px] inline-block align-bottom">{actor}</span>
                                        {aksiLabel && (
                                            <span className={`ml-1 shrink-0 text-[10px] font-semibold ${aksiColor}`}>
                                                {aksiLabel}
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400 dark:text-night-500">
                                        <FaUser size={9} className="shrink-0 text-gray-300 dark:text-night-500" />
                                        <span className="truncate">Tidak tercatat (data lama)</span>
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-700 dark:text-night-200">
                                    {summary}
                                </p>
                                <p className="mt-1 text-[10px] text-gray-400 dark:text-night-500">
                                    {item.created_at
                                        ? new Date(item.created_at).toLocaleString("id-ID", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })
                                        : "-"}
                                </p>
                            </div>

                            {belumDibaca && (
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                            )}
                        </div>

                        {/* Persetujuan Reset Kata Sandi */}

                        {resetRequest && (
                            <div className="rounded-2xl bg-white dark:bg-night-900 px-5 py-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:px-4">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8EAEA] text-[#AB3C3C] dark:bg-night-800 dark:text-night-200">
                                        <FaKey />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                            Persetujuan {requestLabel}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-night-400">
                                            {requestType === "username_change" && resetRequest.username_baru ? (
                                                <>Akun <span className="font-semibold text-gray-700 dark:text-night-200">{resetRequest.requested_by} → {resetRequest.username_baru}</span> • diminta {formatWaktu(resetRequest.created_at)}</>
                                            ) : (
                                                <>Akun <span className="font-semibold text-gray-700 dark:text-night-200">{resetRequest.requested_by}</span> • diminta {formatWaktu(resetRequest.created_at)}</>
                                            )}
                                        </p>
                                    </div>
                                    <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${resetRequest.status === "pending" ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" : resetRequest.status === "approved" ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300"}`}>
                                        {resetRequest.status === "pending" ? "Menunggu" : resetRequest.status === "approved" ? "Disetujui" : "Ditolak"}
                                    </span>
                                </div>

                                {resetRequest.status === "pending" ? (
                                    isOwnRequest ? (
                                        <p className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
                                            Permintaan sendiri — menunggu admin lain untuk menyetujui.
                                        </p>
                                    ) : (
                                    <div className="flex items-center gap-2 max-md:flex-col max-md:items-stretch">
                                        <button
                                            type="button"
                                            onClick={handleApproveReset}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
                                        >
                                            <FaCheck size={12} />
                                            Setujui {requestLabel}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRejectReset}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-night-600 bg-white dark:bg-night-800 px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-night-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-night-700 active:scale-[0.98]"
                                        >
                                            <FaTimes size={12} />
                                            Tolak
                                        </button>
                                    </div>
                                    )
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-night-400">
                                        {resetRequest.handled_by ? `Ditindaklanjuti oleh ${resetRequest.handled_by}` : ""}
                                        {resetRequest.handled_at ? ` • ${formatWaktu(resetRequest.handled_at)}` : ""}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Perubahan */}

                        {changes.length > 0 && (
                            <div className="rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700 overflow-hidden">
                                <div className="border-b border-gray-100 dark:border-night-700 bg-gradient-to-r from-white to-gray-50 dark:from-night-900 dark:to-night-800/60 px-5 py-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-night-200">
                                        Perubahan ({changes.length})
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                        Daftar field yang berubah beserta nilai lama dan baru
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-gray-50/70 dark:bg-night-800/70 border-b border-gray-100 dark:border-night-700 text-left text-gray-500 dark:text-night-400">
                                                <th className="px-5 py-3 font-medium">Field</th>
                                                <th className="px-5 py-3 font-medium">Nilai Lama</th>
                                                <th className="px-5 py-3 font-medium">Nilai Baru</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-night-700">
                                            {changes.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-night-800/60 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-night-200">
                                                        {row.field}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600 dark:text-night-300">
                                                        {row.oldVal}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600 dark:text-night-300">
                                                        {row.newVal}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Detail */}

                        {details.length > 0 && (
                            <div className="rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700 overflow-hidden">
                                <div className="border-b border-gray-100 dark:border-night-700 bg-gradient-to-r from-white to-gray-50 dark:from-night-900 dark:to-night-800/60 px-5 py-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-night-200">
                                        Detail Data
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                        Snapshot data pada notifikasi ini
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-5 text-xs sm:grid-cols-2">
                                    {details.map((row, idx) => (
                                        <div key={idx} className="rounded-xl bg-gray-50/70 dark:bg-night-800/70 px-3 py-2.5 border border-gray-100 dark:border-night-700">
                                            <p className="font-semibold text-gray-800 dark:text-night-200">
                                                {row.field}
                                            </p>
                                            <p className="mt-1 break-words text-gray-600 dark:text-night-300">
                                                {row.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {changes.length === 0 && details.length === 0 && (
                            <div className="rounded-2xl bg-white dark:bg-night-900 px-5 py-10 text-center shadow-sm border border-gray-100 dark:border-night-700">
                                <p className="text-sm text-gray-500 dark:text-night-400">
                                    Tidak ada rincian perubahan pada notifikasi ini.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
