
import MainLayout from "../Layouts/MainLayout";
import { FaWifi, FaChevronRight, FaMap, FaCheckDouble, FaTrash, FaUser, FaKey } from "react-icons/fa";
import { LuUtilityPole } from "react-icons/lu";
import { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import useBase from "../hooks/useBase";

const getIconByKategori = (kategori) => {
    const k = (kategori || "").toLowerCase();
    if (k === "ont") return FaWifi;
    if (k === "wilayah") return FaMap;
    return LuUtilityPole;
};

const getNotifikasiVisual = (item) => {
    const jenis = item.jenis || "";
    const kategori = (item.kategori || "").toLowerCase();

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

export default function Notifikasi({ notifikasi = [] }) {
    const { settings } = usePage().props;
    const base = useBase();

    const goDetail = (id) => {
        router.get(`${base}/detail-notifikasi/${id}`.replace(/\/+/g, '/'));
    };

    useEffect(() => {
        router.reload({ only: ['notifikasi', 'unreadNotifikasi'] });
    }, []);

    const tandaiSemuaDibaca = () => {
        router.post(`${base}/notifikasi/baca-semua`.replace(/\/+/g, '/'));
    };

    const hapusSudahDibaca = () => {
        if (
            window.confirm(
                "Apakah kamu yakin ingin menghapus semua notifikasi yang sudah dibaca? Tindakan ini tidak dapat dibatalkan."
            )
        ) {
            router.delete(`${base}/notifikasi/hapus-dibaca`.replace(/\/+/g, '/'));
        }
    };

    const renderRow = (item) => {
        const isUnread = item.status === "belum_dibaca";
        const { Icon, circle } = getNotifikasiVisual(item);
        const actor = item.updated_by || item.username || item.actor || null;
        const aksiLabel = String(item.jenis || "").includes("Ditambahkan")
            ? "Ditambahkan"
            : String(item.jenis || "").includes("Dihapus")
                ? "Dihapus"
                : String(item.jenis || "").includes("Diperbarui")
                    ? "Diperbarui"
                    : null;
        const aksiColor = aksiLabel === "Ditambahkan"
            ? "text-emerald-600 dark:text-emerald-300"
            : aksiLabel === "Dihapus"
                ? "text-rose-600 dark:text-rose-300"
                : "text-amber-600 dark:text-amber-300";

        return (
                <div
                    key={item.id}
                    className={`flex items-center gap-4 border-b border-gray-100 dark:border-night-700 px-5 py-4 transition hover:bg-gray-50/60 dark:hover:bg-night-800/60 max-md:flex-wrap max-md:gap-3 max-md:px-4 ${isUnread ? "bg-red-50/50 dark:bg-red-500/10 border-l-4 border-l-red-500" : "bg-green-50/40 dark:bg-green-500/10 border-l-4 border-l-green-500"}`}
                >
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ring-1 ring-white/40 ${circle || (isUnread
                        ? "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300"
                        : "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-300")
                        }`}
                >
                    {Icon ? (
                        <Icon size={20} />
                    ) : isUnread ? (
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
                            <span className="truncate max-w-[140px] inline-block align-bottom">{actor}</span>
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

                    {item.pesan && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-700 dark:text-night-200">
                            {String(item.pesan).split("\n")[0]}
                        </p>
                    )}

                    <p className="mt-1 text-[10px] text-gray-400 dark:text-night-500">
                        {item.created_at
                            ? new Date(item.created_at).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })
                            : "-"}
                    </p>
                </div>

                {isUnread ? (
                    <span title="Belum dibaca" className="h-2 w-2 rounded-full bg-red-500" />
                ) : (
                    <span title="Sudah dibaca" className="h-2 w-2 rounded-full bg-green-500" />
                )}

                <button
                    type="button"
                    onClick={() => goDetail(item.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-white dark:bg-night-800 px-3 py-1 text-xs font-medium text-[#992e2e] dark:text-night-200 ring-1 ring-[#AB3C3C]/20 dark:ring-night-600 shadow-sm transition hover:bg-[#AB3C3C] hover:text-white hover:ring-[#AB3C3C]"
                >
                    Lihat detail
                    <FaChevronRight size={10} />
                </button>
            </div>
        );
    };

    // Statistik

    const totalNotifikasi = notifikasi.length;

    const belumDibaca = notifikasi.filter(
        (item) => item.status === "belum_dibaca"
    ).length;

    const sudahDibaca = notifikasi.filter(
        (item) => item.status === "dibaca"
    ).length;

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="flex items-stretch gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">
                    <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 shadow-md border border-white/10 text-white max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Notifikasi
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
                        onClick={tandaiSemuaDibaca}
                        disabled={belumDibaca === 0}
                        title="Tandai semua dibaca"
                        aria-label="Tandai semua dibaca"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-night-800 px-4 py-2.5 text-sm font-medium text-[#6F2424] dark:text-night-200 shadow-md ring-1 ring-[#AB3C3C]/25 dark:ring-night-600 transition hover:bg-[#AB3C3C] hover:text-white hover:ring-[#AB3C3C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-night-800 disabled:hover:text-[#6F2424] dark:disabled:hover:text-night-200 disabled:hover:ring-[#AB3C3C]/25 dark:disabled:hover:ring-night-600 max-md:shrink-0 max-md:rounded-lg max-md:px-4 max-md:py-4 max-md:text-xs"
                    >
                        <FaCheckDouble />
                        <span className="max-md:hidden">Tandai semua dibaca</span>
                    </button>

                    <button
                        type="button"
                        onClick={hapusSudahDibaca}
                        disabled={sudahDibaca === 0}
                        title="Hapus yang dibaca"
                        aria-label="Hapus yang dibaca"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-night-800 px-4 py-2.5 text-sm font-medium text-[#6F2424] dark:text-night-200 shadow-md ring-1 ring-[#AB3C3C]/25 dark:ring-night-600 transition hover:bg-[#AB3C3C] hover:text-white hover:ring-[#AB3C3C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-night-800 disabled:hover:text-[#6F2424] dark:disabled:hover:text-night-200 disabled:hover:ring-[#AB3C3C]/25 dark:disabled:hover:ring-night-600 max-md:shrink-0 max-md:rounded-lg max-md:px-4 max-md:py-4 max-md:text-xs"
                    >
                        <FaTrash />
                        <span className="max-md:hidden">Hapus yang dibaca</span>
                    </button>
                </div>

                {/* Statistik */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">

                    {/* Total */}

                    <div className="rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-blue-600 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md transition max-md:p-3.5">
                        <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                            TOTAL NOTIFIKASI
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-night-200 max-md:text-xl">
                            {totalNotifikasi}
                        </h2>
                    </div>

                    {/* Belum Dibaca */}

                    <div className="rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-red-500 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md transition max-md:p-3.5">
                        <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                            BELUM DIBACA
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-night-200 max-md:text-xl">
                            {belumDibaca}
                        </h2>
                    </div>

                    {/* Sudah Dibaca */}

                    <div className="rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-green-600 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md transition max-md:p-3.5">
                        <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                            SUDAH DIBACA
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-night-200 max-md:text-xl">
                            {sudahDibaca}
                        </h2>
                    </div>
                </div>

                {/* Daftar */}

                <div className="rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-night-700 bg-gradient-to-r from-white to-gray-50 dark:from-night-900 dark:to-night-800/60 px-5 py-4 max-md:px-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-night-200">
                                Notifikasi Terbaru
                            </h3>

                            <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                Informasi terbaru dari sistem GIS
                            </p>
                        </div>
                    </div>

                    {/* Data */}

                    {notifikasi.length > 0 ? (
                        <>
                            {notifikasi.filter((item) => item.status === "belum_dibaca").length > 0 && (
                                <>
                                    <div className="bg-gradient-to-r from-orange-50 dark:from-orange-500/15 to-transparent px-5 py-2.5 border-y border-orange-100 dark:border-orange-500/25">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
                                            Belum dibaca
                                        </p>
                                    </div>
                                    {notifikasi
                                        .filter((item) => item.status === "belum_dibaca")
                                        .map((item) => renderRow(item))}
                                </>
                            )}

                            {notifikasi.filter((item) => item.status !== "belum_dibaca").length > 0 && (
                                <>
                                    <div className="bg-gradient-to-r from-emerald-50 dark:from-emerald-500/15 to-transparent px-5 py-2.5 border-y border-emerald-100 dark:border-emerald-500/25">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                            Sudah dibaca
                                        </p>
                                    </div>
                                    {notifikasi
                                        .filter((item) => item.status !== "belum_dibaca")
                                        .map((item) => renderRow(item))}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="px-5 py-12 text-center border border-dashed border-gray-200 dark:border-night-700 rounded-xl m-4 bg-gray-50/50 dark:bg-night-800/50">
                            <p className="text-sm text-gray-500 dark:text-night-400">
                                Belum ada notifikasi.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
