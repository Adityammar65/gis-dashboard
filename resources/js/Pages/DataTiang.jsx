import MainLayout from "../Layouts/MainLayout";
import MobileDataCard from "../Components/MobileDataCard";
import { TableActions, CardActions, TableEmpty, CardEmpty } from "../Components/DataActions";

import { usePage, router } from "@inertiajs/react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FaPlus, FaFilter, FaChevronDown, FaFileExport, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { LuUtilityPole } from "react-icons/lu";
import useBase from "../hooks/useBase";

const ambilNamaBerkas = (contentDisposition, cadangan) => {
    if (!contentDisposition) return cadangan;

    const cocokUtf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    const cocokNormal = /filename="?([^";]+)"?/i.exec(contentDisposition);
    const sumber = cocokUtf8 ? cocokUtf8[1] : cocokNormal ? cocokNormal[1] : null;

    if (!sumber) return cadangan;

    try {
        return decodeURIComponent(sumber.trim());
    } catch (error) {
        return sumber.trim();
    }
};

export default function DataTiang({
    dataTiang = [],
    wilayah = [],
    filter = {},
}) {
    const { settings } = usePage().props;

    const base = useBase();
    const resolveHref = useCallback((href) => `${base}/${href}`.replace(/\/+/g, '/'), [base]);

    const [filterWilayah, setFilterWilayah] = useState(
        filter.wilayah ?? ""
    );

    const [filterStatus, setFilterStatus] = useState(
        filter.status ?? ""
    );

    const [filterKecamatan, setFilterKecamatan] = useState(filter.kecamatan ?? "");
    const [filterKelurahan, setFilterKelurahan] = useState(filter.kelurahan ?? "");

    const [openExport, setOpenExport] = useState(false);
    const [sedangExport, setSedangExport] = useState("");
    const [notifExport, setNotifExport] = useState(null);
    const [konfirmasiEkspor, setKonfirmasiEkspor] = useState(null);
    const exportRef = useRef(null);

    const [kecamatanOptions, setKecamatanOptions] = useState([]);
    const [kelurahanOptions, setKelurahanOptions] = useState([]);
    const [kecamatanLoading, setKecamatanLoading] = useState(false);
    const [kelurahanLoading, setKelurahanLoading] = useState(false);
    const [kecFocused, setKecFocused] = useState(false);
    const [kelFocused, setKelFocused] = useState(false);

    const listTiang = useMemo(() => (Array.isArray(dataTiang) ? dataTiang : (dataTiang?.data ?? [])), [dataTiang]);
    const totalTiang = useMemo(() => dataTiang?.total ?? listTiang.length, [dataTiang, listTiang]);
    const tiangAktif = useMemo(() => listTiang.filter((tiang) => tiang.status?.toLowerCase() === "aktif").length, [listTiang]);
    const tiangNonaktif = useMemo(() => listTiang.filter((tiang) => tiang.status?.toLowerCase() === "nonaktif").length, [listTiang]);

    const selectedWilayahLabel = useMemo(() => {
        if (!filterWilayah) return "Semua Wilayah";
        const found = wilayah.find((item) => String(item.id) === String(filterWilayah));
        return found ? found.nama_wilayah : "Semua Wilayah";
    }, [filterWilayah, wilayah]);

    useEffect(() => {
        if ((filter.wilayah ?? "") !== filterWilayah) {
            setFilterWilayah(filter.wilayah ?? "");
        }
    }, [filter.wilayah]);

    useEffect(() => {
        if ((filter.status ?? "") !== filterStatus) {
            setFilterStatus(filter.status ?? "");
        }
    }, [filter.status]);

    useEffect(() => {
        if ((filter.kecamatan ?? "") !== filterKecamatan) {
            setFilterKecamatan(filter.kecamatan ?? "");
        }
    }, [filter.kecamatan]);

    useEffect(() => {
        if ((filter.kelurahan ?? "") !== filterKelurahan) {
            setFilterKelurahan(filter.kelurahan ?? "");
        }
    }, [filter.kelurahan]);

    // Kecamatan

    useEffect(() => {
        if (!filterWilayah) { setKecamatanOptions([]); return; }
        const wil = wilayah.find((w) => String(w.id) === String(filterWilayah));
        const kode = wil?.kode_wilayah || "";
        if (!kode) { setKecamatanOptions([]); return; }
        let cancelled = false;
        setKecamatanLoading(true);
        // base dari useBase() modular (outer scope)
        fetch(`${base}/api/regions/kabupaten/${kode}/kecamatan`.replace(/\/+/g, '/'))
            .then((r) => r.json())
            .then((j) => {
                if (cancelled) return;
                const data = Array.isArray(j?.data) ? j.data : [];
                setKecamatanOptions(data);
            })
            .catch(() => { if (!cancelled) setKecamatanOptions([]); })
            .finally(() => { if (!cancelled) setKecamatanLoading(false); });
        return () => { cancelled = true; };
    }, [filterWilayah, wilayah]);

    useEffect(() => {
        if (!filterKecamatan) { setKelurahanOptions([]); return; }
        const opt = kecamatanOptions.find((o) => o.name.toLowerCase() === filterKecamatan.toLowerCase().trim());
        const code = opt?.code;
        if (!code) { setKelurahanOptions([]); return; }
        let cancelled = false;
        setKelurahanLoading(true);
        // base dari useBase() modular (outer scope)
        fetch(`${base}/api/regions/kecamatan/${code}/kelurahan`.replace(/\/+/g, '/'))
            .then((r) => r.json())
            .then((j) => {
                if (cancelled) return;
                const data = Array.isArray(j?.data) ? j.data : [];
                setKelurahanOptions(data);
            })
            .catch(() => { if (!cancelled) setKelurahanOptions([]); })
            .finally(() => { if (!cancelled) setKelurahanLoading(false); });
        return () => { cancelled = true; };
    }, [filterKecamatan, kecamatanOptions]);

    const filteredKecamatan = useMemo(() => {
        const q = (filterKecamatan || "").trim().toLowerCase();
        if (q.length < 1 || kecamatanOptions.length === 0) return [];
        if (kecamatanOptions.some((o) => o.name.toLowerCase() === q)) return [];
        return kecamatanOptions.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 6);
    }, [filterKecamatan, kecamatanOptions]);

    const filteredKelurahan = useMemo(() => {
        const q = (filterKelurahan || "").trim().toLowerCase();
        if (q.length < 1 || kelurahanOptions.length === 0) return [];
        if (kelurahanOptions.some((o) => o.name.toLowerCase() === q)) return [];
        return kelurahanOptions.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 6);
    }, [filterKelurahan, kelurahanOptions]);

    const handleFilter = useCallback((wilayahValue, kecamatanValue, statusValue, kelurahanValue) => {
        setFilterWilayah(wilayahValue);
        setFilterKecamatan(kecamatanValue);
        setFilterStatus(statusValue);
        setFilterKelurahan(kelurahanValue);
        router.get(
            window.location.pathname,
            {
                wilayah: wilayahValue,
                kecamatan: kecamatanValue,
                kelurahan: kelurahanValue,
                status: statusValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, []);

    // Ekspor

    useEffect(() => {
        if (!openExport && !konfirmasiEkspor) return;

        const tutupKlikLuar = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setOpenExport(false);
            }
        };

        const tutupEscape = (event) => {
            if (event.key === "Escape") {
                setOpenExport(false);
                if (!sedangExport) setKonfirmasiEkspor(null);
            }
        };

        document.addEventListener("mousedown", tutupKlikLuar);
        document.addEventListener("keydown", tutupEscape);

        return () => {
            document.removeEventListener("mousedown", tutupKlikLuar);
            document.removeEventListener("keydown", tutupEscape);
        };
    }, [openExport, konfirmasiEkspor, sedangExport]);

    useEffect(() => {
        if (!notifExport) return;

        const timer = setTimeout(() => setNotifExport(null), 6000);

        return () => clearTimeout(timer);
    }, [notifExport]);

    const handleExport = useCallback(async (format, cakupan = "halaman") => {
        if (sedangExport) return;

        const params = new URLSearchParams();

        if (filterWilayah) params.set("wilayah", filterWilayah);
        if (filterStatus) params.set("status", filterStatus);
        if (filterKecamatan) params.set("kecamatan", filterKecamatan);
        if (filterKelurahan) params.set("kelurahan", filterKelurahan);
        if (cakupan === "semua") {
            params.set("scope", "all");
        } else {
            params.set("page", String(dataTiang?.current_page ?? 1));
        }

        const url = `${resolveHref(`export/aset/tiang/${format}`)}?${params.toString()}`;

        setOpenExport(false);
        setKonfirmasiEkspor(null);
        setSedangExport(format);

        try {
            const response = await fetch(url, {
                credentials: "same-origin",
                headers: { Accept: "application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json" },
            });

            const contentType = response.headers.get("content-type") || "";

            if (!response.ok) {
                let pesan = "Export gagal. Silakan coba lagi.";

                if (contentType.includes("application/json")) {
                    const data = await response.json().catch(() => null);
                    if (data?.message) pesan = data.message;
                }

                setNotifExport({ tipe: "error", pesan });

                return;
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const namaBerkas = ambilNamaBerkas(
                response.headers.get("content-disposition"),
                `Data-Tiang.${format}`
            );

            link.href = objectUrl;
            link.download = namaBerkas;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);

            setNotifExport({ tipe: "sukses", pesan: `Berkas ${namaBerkas} berhasil diunduh.` });
        } catch (error) {
            setNotifExport({ tipe: "error", pesan: "Export gagal. Periksa koneksi internet Anda." });
        } finally {
            setSedangExport("");
        }
    }, [sedangExport, filterWilayah, filterStatus, filterKecamatan, filterKelurahan, dataTiang, resolveHref]);

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="flex items-stretch gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">

                    <div className="items-center flex-1 rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 shadow-md border border-white/10 text-white max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">

                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Data Tiang
                        </span>

                        <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">
                            /
                        </span>

                        <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                            {settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                        </span>

                    </div>

                    {/* Form */}

                    <a
                        href={resolveHref("tambah-tiang")}
                        title="Form Tiang"
                        aria-label="Form Tiang"
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] max-md:shrink-0 max-md:rounded-lg max-md:px-4 max-md:py-4 max-md:text-xs"
                    >
                        <FaPlus />
                        <span className="max-md:hidden">Form Tiang</span>
                    </a>

                    {/* Ekspor */}

                    <div ref={exportRef} className="relative max-md:shrink-0">

                        <button
                            type="button"
                            onClick={() => setOpenExport(!openExport)}
                            disabled={listTiang.length === 0}
                            title="Export"
                            aria-label="Export"
                            className="flex h-full items-center justify-center gap-2 rounded-xl bg-white dark:bg-night-800 px-4 py-2.5 text-sm font-medium text-[#6F2424] dark:text-night-200 shadow-md ring-1 ring-[#AB3C3C]/25 dark:ring-night-600 transition hover:bg-[#AB3C3C] hover:text-white hover:ring-[#AB3C3C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-night-800 disabled:hover:text-[#6F2424] dark:disabled:hover:text-night-200 disabled:hover:ring-[#AB3C3C]/25 dark:disabled:hover:ring-night-600 max-md:rounded-lg max-md:px-4 max-md:py-4 max-md:text-xs"
                        >
                            <FaFileExport />
                            <span className="max-md:hidden">Export</span>
                            <FaChevronDown className={`text-[10px] transition-transform max-md:hidden ${openExport ? "rotate-180" : ""}`} />
                        </button>

                        {openExport && (
                            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 shadow-xl max-md:right-0 max-md:w-52">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenExport(false);
                                        setKonfirmasiEkspor({ format: "pdf" });
                                    }}
                                    disabled={sedangExport !== ""}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-night-200 transition hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-700 dark:hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaFilePdf className="text-red-600 dark:text-red-300" />
                                    Export PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenExport(false);
                                        setKonfirmasiEkspor({ format: "excel" });
                                    }}
                                    disabled={sedangExport !== ""}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-night-200 transition hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-700 dark:hover:text-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaFileExcel className="text-green-600 dark:text-green-300" />
                                    Export Excel
                                </button>

                            </div>
                        )}

                    </div>

                </div>

                {/* Konfirmasi */}

                {konfirmasiEkspor && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                        onClick={() => {
                            if (!sedangExport) setKonfirmasiEkspor(null);
                        }}
                    >
                        <div
                            className="w-full max-w-sm rounded-2xl bg-white dark:bg-night-900 p-5 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                                Export {konfirmasiEkspor.format === "pdf" ? "PDF" : "Excel"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500 dark:text-night-400">
                                Halaman {dataTiang?.current_page ?? 1} dari {dataTiang?.last_page ?? 1} &bull; {listTiang.length} data halaman ini &bull; {dataTiang?.total ?? listTiang.length} total data
                            </p>

                            <p className="mt-3 text-xs text-gray-600 dark:text-night-300">
                                Cetak halaman ini saja atau semua data sesuai filter?
                            </p>

                            <div className="mt-4 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleExport(konfirmasiEkspor.format, "halaman")}
                                    disabled={sedangExport !== ""}
                                    className="w-full rounded-xl bg-[#AB3C3C] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#6F2424] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {sedangExport ? "Menyiapkan berkas..." : `Halaman Ini Saja (${listTiang.length} data)`}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleExport(konfirmasiEkspor.format, "semua")}
                                    disabled={sedangExport !== ""}
                                    className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 transition hover:bg-gray-50 dark:hover:bg-night-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Semua Data ({dataTiang?.total ?? listTiang.length} data)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setKonfirmasiEkspor(null)}
                                    disabled={sedangExport !== ""}
                                    className="w-full rounded-xl px-4 py-2 text-xs font-medium text-gray-400 dark:text-night-500 transition hover:text-gray-600 disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifikasi */}

                {notifExport && (
                    <div
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-sm ring-1 ${notifExport.tipe === "sukses"
                            ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 ring-green-200 dark:ring-green-500/30"
                            : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-500/30"
                            }`}
                    >
                        {notifExport.tipe === "sukses" ? (
                            <FaFileExcel className="shrink-0 text-green-600 dark:text-green-300" />
                        ) : (
                            <FaFilePdf className="shrink-0 text-red-600 dark:text-red-300" />
                        )}

                        <span className="flex-1">{notifExport.pesan}</span>

                        <button
                            type="button"
                            onClick={() => setNotifExport(null)}
                            className="shrink-0 rounded px-1 font-bold opacity-60 transition hover:opacity-100"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Statistik */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">

                    {/* Total Tiang */}

                    <div className="hover:scale-[1.02] transition-all duration-200 flex min-h-[136px] flex-col justify-between rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-blue-900 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 will-change-transform max-md:min-h-0 max-md:p-3.5 max-md:hover:scale-100 max-md:hover:translate-y-0">

                        <div className="flex items-start justify-between max-md:gap-2">

                            <div className="min-w-0">

                                <p className="truncate text-xs font-medium max-md:text-[11px]">
                                    TOTAL TIANG
                                </p>

                                <p className="text-sm font-light capitalize text-gray-500 dark:text-night-400 mt-1 truncate max-md:text-xs">
                                    {selectedWilayahLabel}
                                </p>

                                <h2 className="mt-1 text-2xl font-semibold max-md:text-xl">
                                    {totalTiang}
                                </h2>

                            </div>

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white max-md:h-11 max-md:w-11">
                                <LuUtilityPole className="text-2xl max-md:text-lg" />
                            </div>

                        </div>

                    </div>


                    {/* Status */}

                    <div className="flex min-h-[136px] flex-col gap-4 max-md:min-h-0 max-md:gap-3">

                        {/* Aktif */}

                        <div className="hover:scale-[1.02] transition-all shadow-sm duration-200 flex flex-1 items-center rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-emerald-600 bg-white dark:bg-night-900 px-5 hover:shadow-md hover:-translate-y-0.5 will-change-transform max-md:px-3.5 max-md:py-3 max-md:hover:scale-100 max-md:hover:translate-y-0">

                            <div className="min-w-0">

                                <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                                    TIANG AKTIF
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-gray-800 dark:text-night-200 max-md:text-lg">
                                    {tiangAktif}
                                </h2>

                            </div>

                        </div>


                        {/* Nonaktif */}

                        <div className="hover:scale-[1.02] duration-200 transition-all shadow-sm flex flex-1 items-center rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-red-500 bg-white dark:bg-night-900 px-5 hover:shadow-md hover:-translate-y-0.5 will-change-transform max-md:px-3.5 max-md:py-3 max-md:hover:scale-100 max-md:hover:translate-y-0">

                            <div className="min-w-0">

                                <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                                    TIANG NONAKTIF
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-gray-800 dark:text-night-200 max-md:text-lg">
                                    {tiangNonaktif}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Filter */}

                    <div className="min-h-[136px] rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:col-span-2 max-md:min-h-0 max-md:p-4">

                        <div className="mb-4 flex items-center gap-2">

                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-night-800/60 ring-1 ring-gray-200 dark:ring-night-700"><FaFilter className="text-gray-600 dark:text-night-300 text-xs" /></span>

                            <span className="text-[11px] font-semibold tracking-widest text-gray-600 dark:text-night-300">
                                FILTER DATA
                            </span>

                        </div>


                        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">

                            {/* Wilayah */}

                            <select
                                value={filterWilayah}
                                onChange={(e) =>
                                    handleFilter(
                                        e.target.value,
                                        filterKecamatan,
                                        filterStatus,
                                        filterKelurahan
                                    )
                                }
                                className="capitalize w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition"
                            >

                                <option value="">
                                    Semua Wilayah
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

                            </select>

                            {/* Kecamatan */}

                            <div className="relative">
                                <input
                                    type="text"
                                    value={filterKecamatan}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFilterKecamatan(v);
                                    }}
                                    onFocus={() => setKecFocused(true)}
                                    onBlur={() => setTimeout(() => setKecFocused(false), 180)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilter(filterWilayah, e.target.value, filterStatus, filterKelurahan);
                                        }
                                    }}
                                    placeholder={kecamatanLoading ? "Memuat..." : "Kecamatan"}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                                {kecFocused && filteredKecamatan.length > 0 && (
                                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-auto rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 shadow-lg">
                                        {filteredKecamatan.map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setFilterKecamatan(opt.name);
                                                    setKecFocused(false);
                                                    handleFilter(filterWilayah, opt.name, filterStatus, filterKelurahan);
                                                }}
                                                className="w-full px-3 py-2 text-left capitalize text-xs text-gray-700 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-800 transition"
                                            >
                                                {opt.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status */}

                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    handleFilter(
                                        filterWilayah,
                                        filterKecamatan,
                                        e.target.value,
                                        filterKelurahan
                                    )
                                }
                                className="capitalize w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition"
                            >

                                <option value="">
                                    Semua Status
                                </option>

                                <option value="Aktif">
                                    Aktif
                                </option>

                                <option value="Nonaktif">
                                    Nonaktif
                                </option>

                            </select>

                            {/* Kelurahan */}

                            <div className="relative">
                                <input
                                    type="text"
                                    value={filterKelurahan}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFilterKelurahan(v);
                                    }}
                                    onFocus={() => setKelFocused(true)}
                                    onBlur={() => setTimeout(() => setKelFocused(false), 180)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilter(filterWilayah, filterKecamatan, filterStatus, e.target.value);
                                        }
                                    }}
                                    placeholder={kelurahanLoading ? "Memuat..." : "Kelurahan"}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                                {kelFocused && filteredKelurahan.length > 0 && (
                                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-40 overflow-auto rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 shadow-lg">
                                        {filteredKelurahan.map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setFilterKelurahan(opt.name);
                                                    setKelFocused(false);
                                                    handleFilter(filterWilayah, filterKecamatan, filterStatus, opt.name);
                                                }}
                                                className="w-full px-3 py-2 text-left capitalize text-xs text-gray-700 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-800 transition"
                                            >
                                                {opt.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleFilter(filterWilayah, filterKecamatan, filterStatus, filterKelurahan)}
                                className="flex-1 rounded-xl bg-[#AB3C3C] px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#6F2424] transition"
                            >
                                Terapkan
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilter("", "", "", "")}
                                className="rounded-xl border border-gray-200 dark:border-night-600 bg-white dark:bg-night-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-700 transition"
                            >
                                Reset
                            </button>
                        </div>

                    </div>

                </div>


                {/* Tabel */}

                <div className="overflow-hidden rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700">

                    <div className="overflow-x-auto hidden md:block">

                        <table className="w-full min-w-[900px] border-collapse text-xs">

                            {/* Header Tabel */}

                            <thead>

                                <tr className="bg-gray-50/70 dark:bg-night-800/70 border-b border-gray-200 dark:border-night-700 text-center">

                                    <th className="w-12 px-4 py-3 font-medium">
                                        No
                                    </th>

                                    <th className="w-24 px-4 py-3 font-medium">
                                        Foto
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Nomor Tiang
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Wilayah
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Kecamatan
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Kelurahan
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Petugas Lapangan
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="w-20 px-4 py-3 font-medium">
                                        Aksi
                                    </th>

                                </tr>

                            </thead>


                            {/* Isi Tabel */}

                            <tbody className="text-center capitalize divide-y divide-gray-100 dark:divide-night-700">

                                {listTiang.length > 0 ? (

                                    listTiang.map((tiang, index) => (

                                        <tr
                                            key={tiang.id}
                                            className="border-b border-gray-100 dark:border-night-700 last:border-b-0 hover:bg-gray-50/80 dark:hover:bg-night-800/80 transition-colors"
                                        >

                                            {/* Nomor */}

                                            <td className="px-4 py-2">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>


                                            {/* Foto */}

                                            <td className="px-4 py-2.5">

                                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-night-800 ring-1 ring-gray-200 dark:ring-night-700 shadow-sm">

                                                    {tiang.foto_tiang_1 ? (

                                                        <img
                                                            src={`${base}/public/storage/${tiang.foto_tiang_1}`.replace(/\/+/g, '/')}
                                                            alt={`Foto ${tiang.kode_tiang}`}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                            width="64"
                                                            height="64"
                                                        />

                                                    ) : (

                                                        <span className="text-[10px] text-gray-400 dark:text-night-500">
                                                            Belum ada foto
                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* Kode Tiang */}

                                            <td className="px-4 py-2">

                                                {tiang.kode_tiang || (

                                                    <span className="text-gray-400 dark:text-night-500">
                                                        Belum ada data
                                                    </span>

                                                )}

                                            </td>


                                            {/* Wilayah */}

                                            <td className="px-4 py-2">
                                                {tiang.wilayah || tiang.kabupaten ? (
                                                    tiang.wilayah || tiang.kabupaten
                                                ) : (
                                                    <span className="text-gray-400 dark:text-night-500">Belum ada data</span>
                                                )}
                                            </td>

                                            {/* Kecamatan */}

                                            <td className="px-4 py-2">
                                                {tiang.kecamatan || tiang.area ? (
                                                    tiang.kecamatan || tiang.area
                                                ) : (
                                                    <span className="text-gray-400 dark:text-night-500">Belum ada data</span>
                                                )}
                                            </td>

                                            {/* Kelurahan */}

                                            <td className="px-4 py-2">
                                                {tiang.kelurahan ? (
                                                    tiang.kelurahan
                                                ) : (
                                                    <span className="text-gray-400 dark:text-night-500">-</span>
                                                )}
                                            </td>

                                            {/* Petugas */}

                                            <td className="px-4 py-2">

                                                {tiang.nama_petugas || (

                                                    <span className="text-gray-400 dark:text-night-500">
                                                        Belum ada data
                                                    </span>

                                                )}

                                            </td>


                                            {/* Status */}

                                            <td className="px-4 py-2.5">

                                                {tiang.status ? (

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/20 ${tiang.status.toLowerCase() ===
                                                            "aktif"
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    >
                                                        {tiang.status}
                                                    </span>

                                                ) : (

                                                    <span className="text-gray-400 dark:text-night-500">
                                                        Belum ada data
                                                    </span>

                                                )}

                                            </td>


                                            {/* Aksi */}

                                            <td className="px-4 py-2.5">

                                                <TableActions
                                                    type="tiang"
                                                    id={tiang.id}
                                                    kode={tiang.kode_tiang}
                                                    base={base}
                                                    detailHref={resolveHref(`detail-tiang/${tiang.id}`)}
                                                    editHref={resolveHref(`edit-tiang/${tiang.id}`)}
                                                />

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    /* Kosong */

                                    <TableEmpty colSpan="9" icon={LuUtilityPole} title="Belum ada data" hint="Data tiang belum tersedia." />

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* Mobile Card */}

                    <div className="space-y-3 p-4 md:hidden">
                        {listTiang.length > 0 ? (
                            listTiang.map((tiang, index) => (
                                <MobileDataCard
                                    key={tiang.id ?? index}
                                    title={tiang.kode_tiang}
                                    subtitle={`${tiang.wilayah || tiang.kabupaten || ""}${(tiang.kecamatan || tiang.area) ? ` • ${tiang.kecamatan || tiang.area}` : ""}`}
                                    imageSrc={tiang.foto_tiang_1 ? `${base}/public/storage/${tiang.foto_tiang_1}`.replace(/\/+/g, '/') : null}
                                    imageAlt={`Foto ${tiang.kode_tiang || "tiang"}`}
                                    status={tiang.status}
                                    meta={[
                                        { label: "Kelurahan", value: tiang.kelurahan },
                                        { label: "Petugas", value: tiang.nama_petugas },
                                    ]}
                                    actions={
                                        <CardActions
                                            type="tiang"
                                            id={tiang.id}
                                            kode={tiang.kode_tiang}
                                            base={base}
                                            detailHref={resolveHref(`detail-tiang/${tiang.id}`)}
                                            editHref={resolveHref(`edit-tiang/${tiang.id}`)}
                                        />
                                    }
                                />
                            ))
                        ) : (
                            <CardEmpty />
                        )}
                    </div>
                    {dataTiang?.links && dataTiang.links.length > 3 && (
                        <div className="flex flex-wrap gap-1.5 justify-center mt-4 pb-3 max-md:px-2">
                            {dataTiang.links.map((link, i) => (
                                <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })} className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ring-1 transition ${link.active ? 'bg-[#AB3C3C] text-white ring-[#AB3C3C]' : 'bg-white dark:bg-night-800 border border-gray-200 dark:border-night-600 text-gray-700 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-700'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </MainLayout>
    );
}
