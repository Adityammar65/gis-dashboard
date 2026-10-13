import { useState, useMemo } from "react";
import { FaChevronDown, FaWifi } from "react-icons/fa";
import { LuUtilityPole } from "react-icons/lu";
import { usePage } from "@inertiajs/react";

import MainLayout from "../Layouts/MainLayout";
import MapView from "../Components/MapView";

const normalizeStatus = (status) => String(status || "").toLowerCase();

export default function Peta() {
    const { settings, tiang = [], ont = [], wilayah: wilayahList = [] } = usePage().props;
    const [assetType, setAssetType] = useState("Semua");
    const [status, setStatus] = useState("Semua");
    const [wilayah, setWilayah] = useState("Semua");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) return false;
        return true;
    });

    const wilayahOptions = useMemo(
        () => (Array.isArray(wilayahList) ? wilayahList.map((w) => w.nama_wilayah).filter(Boolean) : []),
        [wilayahList]
    );

    const matchesScope = (item) => {
        if (status !== "Semua" && normalizeStatus(item.status) !== normalizeStatus(status)) return false;
        if (wilayah !== "Semua" && String(item.wilayah || "") !== wilayah) return false;
        return true;
    };

    const totalTiang = useMemo(() => tiang.filter(matchesScope).length, [tiang, status, wilayah]);
    const totalOnt = useMemo(() => ont.filter(matchesScope).length, [ont, status, wilayah]);

    const markers = useMemo(() => {
        const tiangMarkers = (assetType === "Semua" || assetType === "Tiang")
            ? tiang.filter(matchesScope).map((t) => ({
                id: t.id,
                type: "tiang",
                kode: t.kode_tiang,
                status: t.status,
                wilayah: t.wilayah,
                kecamatan: t.kecamatan ?? t.area,
                kelurahan: t.kelurahan,
                area: t.area,
                latitude: t.latitude,
                longitude: t.longitude,
            }))
            : [];
        const ontMarkers = (assetType === "Semua" || assetType === "ONT")
            ? ont.filter(matchesScope).map((o) => ({
                id: o.id,
                type: "ont",
                kode: o.kode_ont,
                status: o.status,
                wilayah: o.wilayah,
                kecamatan: o.kecamatan ?? o.area,
                kelurahan: o.kelurahan,
                area: o.area,
                latitude: o.latitude,
                longitude: o.longitude,
            }))
            : [];
        return [...tiangMarkers, ...ontMarkers];
    }, [tiang, ont, assetType, status, wilayah]);

    // Pusat Wilayah

    const wilayahCenter = useMemo(() => {
        if (wilayah === "Semua") return null;
        const all = [...tiang, ...ont].filter((it) => String(it.wilayah || "") === wilayah);
        const coords = all
            .map((it) => {
                const latStr = String(it.latitude ?? "").trim().replace(",", ".");
                const lngStr = String(it.longitude ?? "").trim().replace(",", ".");
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                if (!isFinite(lat) || !isFinite(lng)) return null;
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
                if (latStr === "" || lngStr === "") return null;
                return [lat, lng];
            })
            .filter(Boolean);
        if (coords.length === 0) return null;
        let sumLat = 0, sumLng = 0;
        for (const [lat, lng] of coords) { sumLat += lat; sumLng += lng; }
        return [sumLat / coords.length, sumLng / coords.length];
    }, [wilayah, tiang, ont]);

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 text-white shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                    <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                        Peta Sebaran Aset
                    </span>

                    <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">/</span>

                    <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                        {settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                    </span>
                </div>

                <div className="gis-map-wrap relative h-[calc(100vh-180px)] min-h-[500px] overflow-hidden rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700 max-md:h-[68vh] max-md:min-h-[360px]">

                    {/* Peta */}

                    <div className="absolute inset-0 z-0">
                        <MapView markers={markers} wilayah={wilayah} wilayahCenter={wilayahCenter} />
                    </div>

                    <div className="absolute left-4 top-4 z-10 max-md:left-2 max-md:top-2 max-md:max-w-[calc(100vw-6rem)]">
                        <div className="rounded-xl bg-white/90 dark:bg-night-900/90 px-4 py-3 shadow-lg backdrop-blur-md border border-white/60 dark:border-night-700">

                            <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Legenda
                            </h2>

                            {/* Legenda */}

                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-800 dark:text-night-200 max-md:flex-wrap max-md:gap-2 max-md:text-[11px]">

                                <span className="flex items-center gap-2">
                                    <span className="text-white p-2.5 rounded-full bg-blue-900" ></span>
                                    Tiang
                                </span>

                                <span className="flex items-center gap-2">
                                    <FaWifi size={20} className="text-white p-1 rounded-full bg-sky-500" />
                                    ONT
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="p-2.5 rounded-full bg-green-500" />
                                    Aktif
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="p-2.5 rounded-full bg-red-500" />
                                    Nonaktif
                                </span>

                            </div>
                        </div>
                    </div>

                    <div className="gis-mobile-filter absolute right-4 top-4 z-10 w-[280px] max-w-[calc(100vw-2rem)] space-y-3 max-md:right-2 max-md:top-auto max-md:bottom-2 max-md:w-[calc(100vw-5rem)] max-md:max-w-[260px]">

                        {/* Filter */}

                        <div className="rounded-xl bg-white/90 dark:bg-night-900/90 px-3.5 py-4 shadow-lg backdrop-blur-md border border-white/60 dark:border-night-700 max-md:px-3 max-md:py-3">

                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-bold tracking-wide text-gray-800 dark:text-night-200">
                                    FILTER
                                </h2>

                                {/* Alihan */}

                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                    aria-label={mobileFilterOpen ? "Sembunyikan filter" : "Tampilkan filter"}
                                    className="hidden rounded-lg bg-gray-100 dark:bg-night-800 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:text-night-200 max-md:flex max-md:items-center max-md:gap-1 md:hidden"
                                >
                                    {mobileFilterOpen ? "Tutup" : "Buka"}
                                    <FaChevronDown className={`text-[10px] transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
                                </button>
                            </div>

                            <div className={`${mobileFilterOpen ? "" : "max-md:hidden"} md:block`}>

                                <div className="grid grid-cols-3 gap-2">

                                    {[
                                        { label: "Semua", icon: null, active: "bg-gray-900 dark:bg-night-200 text-white dark:text-night-900 border-gray-900 dark:border-night-200 shadow", idle: "bg-white dark:bg-night-800 text-gray-700 dark:text-night-200 border-gray-300 dark:border-night-600 hover:bg-gray-50 dark:hover:bg-night-700" },
                                        { label: "Tiang", icon: LuUtilityPole, active: "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow", idle: "bg-white dark:bg-night-800 text-[#1e3a8a] dark:text-blue-300 border-[#1e3a8a]/30 hover:bg-blue-50 dark:hover:bg-blue-500/15" },
                                        { label: "ONT", icon: FaWifi, active: "bg-sky-500 text-white border-sky-500 shadow", idle: "bg-white dark:bg-night-800 text-sky-600 dark:text-sky-300 border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/15" },
                                    ].map(({ label, icon: Icon, active, idle }) => {
                                        const isActive = assetType === label;
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => setAssetType(label)}
                                                className={`h-8 rounded-md border px-2 text-[10px] font-semibold transition flex items-center justify-center gap-1 ${isActive ? active : idle}`}
                                            >
                                                {Icon && <Icon size={11} />}
                                                {label}
                                            </button>
                                        );
                                    })}

                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3">

                                    {/* Status */}

                                    <div className="relative">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className={`capitalize h-8 w-full appearance-none rounded-md border bg-white dark:bg-night-900 pl-6 pr-7 text-[10px] font-medium text-gray-700 dark:text-night-200 outline-none transition ${status === "Aktif" ? "border-green-500 bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300" : status === "Nonaktif" ? "border-red-500 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300" : "border-gray-300 dark:border-night-600 hover:bg-gray-50 dark:hover:bg-night-800"}`}
                                        >
                                            <option>Semua</option>
                                            <option>Aktif</option>
                                            <option>Nonaktif</option>
                                        </select>
                                        <span className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${status === "Aktif" ? "bg-green-500" : status === "Nonaktif" ? "bg-red-500" : "bg-gray-400"}`} />
                                        <FaChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] opacity-60" />
                                    </div>

                                    {/* Wilayah */}

                                    <div className="relative">
                                        <select
                                            value={wilayah}
                                            onChange={(e) => setWilayah(e.target.value)}
                                            className="capitalize h-8 w-full appearance-none rounded-md border border-gray-300 dark:border-night-600 bg-white dark:bg-night-900 px-2 pr-6 text-[10px] font-medium text-gray-700 dark:text-night-200 outline-none hover:bg-gray-50 dark:hover:bg-night-800"
                                        >
                                            <option value="Semua">Semua</option>
                                            {wilayahOptions.map((nama) => (
                                                <option key={nama} value={nama}>
                                                    {nama}
                                                </option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] opacity-60" />
                                    </div>

                                </div>

                                {/* Statistik */}

                                <div className="mt-3 grid grid-cols-3 gap-2.5">

                                    <div className="flex h-[56px] flex-col items-center justify-center rounded-xl border border-[#1e3a8a]/20 bg-blue-50 dark:bg-blue-500/15 shadow-sm">
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#1e3a8a] dark:text-blue-300">
                                            <LuUtilityPole size={12} /> {totalTiang}
                                        </span>
                                        <span className="text-[10px] font-medium text-[#1e3a8a]/70 dark:text-blue-300/70">
                                            Tiang
                                        </span>
                                    </div>

                                    <div className="flex h-[56px] flex-col items-center justify-center rounded-xl border border-sky-500/20 bg-sky-50 dark:bg-sky-500/15 shadow-sm">
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-300">
                                            <FaWifi size={12} /> {totalOnt}
                                        </span>
                                        <span className="text-[10px] font-medium text-sky-600/70 dark:text-sky-300/70">
                                            ONT
                                        </span>
                                    </div>

                                    <div className="flex h-[56px] flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800/60 shadow-sm">
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-night-200">
                                            {markers.length}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-night-400">
                                            Tampil
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </MainLayout>
    );
}

