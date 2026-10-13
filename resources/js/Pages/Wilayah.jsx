import MainLayout from "../Layouts/MainLayout";
import MobileDataCard from "../Components/MobileDataCard";
import { TableDelete, CardDelete, TableEmpty, CardEmpty } from "../Components/DataActions";
import { usePage, router } from "@inertiajs/react";
import { useState, useMemo, useCallback } from "react";

import { FaFilter, FaMap, FaPlus } from "react-icons/fa";
import { LuBox } from "react-icons/lu";
import useBase from "../hooks/useBase";

export default function Tiang({
    dataWilayah = { data: [], total: 0, links: [] },
    wilayah = [],
    filter = {},
}) {
    const { settings } = usePage().props;

    const base = useBase();
    const resolveHref = useCallback((href) => `${base}/${href}`.replace(/\/+/g, '/'), [base]);

    const [filterWilayah, setFilterWilayah] = useState(filter.wilayah ?? "");
    const [filterAset, setFilterAset] = useState(filter.aset ?? "");

    const listWilayah = useMemo(() => {
        if (Array.isArray(dataWilayah)) return dataWilayah;
        return dataWilayah?.data ?? [];
    }, [dataWilayah]);

    const totalWilayah = useMemo(() => {
        if (typeof dataWilayah?.total === "number") return dataWilayah.total;
        return listWilayah.length;
    }, [dataWilayah, listWilayah]);

    const totalAset = useMemo(() => {
        return listWilayah.reduce((sum, w) => {
            if (filterAset === "tiang") return sum + (w.total_tiang ?? 0);
            if (filterAset === "ont") return sum + (w.total_ont ?? 0);
            return sum + (w.total_aset ?? 0);
        }, 0);
    }, [listWilayah, filterAset]);

    const asetAktif = useMemo(() => {
        if (filterAset === "tiang" || filterAset === "ont") {
        }
        return listWilayah.reduce((sum, w) => sum + (w.aset_aktif ?? 0), 0);
    }, [listWilayah, filterAset]);

    const asetNonaktif = useMemo(() => {
        return listWilayah.reduce((sum, w) => sum + (w.aset_nonaktif ?? 0), 0);
    }, [listWilayah]);

    const namaAsetLabel = useMemo(() => {
        if (filterAset === "tiang") return "Tiang";
        if (filterAset === "ont") return "ONT";
        return "Semua Aset";
    }, [filterAset]);

    const handleFilter = useCallback((wilayahValue, asetValue) => {
        setFilterWilayah(wilayahValue);
        setFilterAset(asetValue);
        router.get(
            window.location.pathname,
            {
                wilayah: wilayahValue,
                aset: asetValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, []);

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="flex items-stretch gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">
                    <div className="items-center flex-1 rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] text-white px-4 py-3.5 shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Data Wilayah
                        </span>

                        <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">/</span>

                        <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                            {settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                        </span>
                    </div>

                    {/* Formulir */}

                    <a
                        href={resolveHref("tambah-wilayah")}
                        title="Form Wilayah"
                        aria-label="Form Wilayah"
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] max-md:shrink-0 max-md:rounded-lg max-md:px-4 max-md:py-4 max-md:text-xs"
                    >
                        <FaPlus />
                        <span className="max-md:hidden">Form Wilayah</span>
                    </a>

                </div>

                {/* Statistik */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">

                    {/* Total Wilayah */}

                    <div className="hover:scale-[1.02] transition-all duration-200 flex min-h-[136px] flex-col justify-between rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-yellow-400 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 will-change-transform max-md:min-h-0 max-md:p-3.5 max-md:hover:scale-100 max-md:hover:translate-y-0">
                        <div className="flex items-start justify-between max-md:gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium max-md:text-[11px]">
                                    TOTAL WILAYAH
                                </p>

                                <h2 className="mt-1 text-2xl font-semibold max-md:text-xl">
                                    {totalWilayah}
                                </h2>
                            </div>

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-white max-md:h-11 max-md:w-11">
                                <FaMap className="text-2xl max-md:text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Total Aset Terpetakan */}

                    <div className="hover:scale-[1.02] transition-all duration-200 flex min-h-[136px] flex-col justify-between rounded-2xl border border-gray-100 dark:border-night-700 border-t-[3px] border-t-blue-400 bg-white dark:bg-night-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 will-change-transform max-md:min-h-0 max-md:p-3.5 max-md:hover:scale-100 max-md:hover:translate-y-0">
                        <div className="flex items-start justify-between max-md:gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold tracking-widest text-gray-500 dark:text-night-400 max-md:tracking-normal">
                                    TOTAL ASET TERPETAKAN
                                </p>

                                <p className="text-xs font-medium my-1 capitalize text-gray-500 dark:text-night-400 truncate">{namaAsetLabel}</p>

                                <h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-night-200 max-md:text-xl">
                                    {totalAset}
                                </h2>

                                <div className="flex items-center gap-2 text-xs mt-2 max-md:flex-wrap max-md:gap-1.5">
                                    <span className="flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-500/15 px-2 py-0.5 ring-1 ring-green-200 dark:ring-green-500/30 max-md:gap-1 max-md:px-1.5 max-md:text-[10px]">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        Aktif {asetAktif}
                                    </span>

                                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/15 px-2 py-0.5 ring-1 ring-red-200 dark:ring-red-500/30 max-md:gap-1 max-md:px-1.5 max-md:text-[10px]">
                                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                        Nonaktif {asetNonaktif}
                                    </span>
                                </div>
                            </div>

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-400 text-white shadow-md ring-1 ring-white/10 max-md:h-11 max-md:w-11">
                                <LuBox className="text-2xl max-md:text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Filter */}

                    <div className="min-h-[136px] rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 capitalize max-md:col-span-2 max-md:min-h-0 max-md:p-4">

                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-night-800/60 ring-1 ring-gray-200 dark:ring-night-700"><FaFilter className="text-gray-600 dark:text-night-300 text-xs" /></span>

                            <span className="text-[11px] font-semibold tracking-widest text-gray-600 dark:text-night-300">
                                FILTER DATA
                            </span>
                        </div>

                        <div className="space-y-3">

                            {/* Wilayah */}

                            <select
                                value={filterWilayah}
                                onChange={(e) => handleFilter(e.target.value, filterAset)}
                                className="capitalize w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition"
                            >
                                <option value="">
                                    Semua Wilayah
                                </option>
                                {wilayah.map((item) => (
                                    <option key={item.id} value={item.id} className="capitalize">
                                        {item.nama_wilayah}
                                    </option>
                                ))}
                            </select>

                            {/* Aset */}

                            <select
                                value={filterAset}
                                onChange={(e) => handleFilter(filterWilayah, e.target.value)}
                                className="capitalize w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 text-xs font-medium text-gray-700 dark:text-night-200 outline-none focus:border-[#6F2424] focus:ring-2 focus:ring-[#AB3C3C]/10 transition"
                            >
                                <option value="">
                                    Semua Aset
                                </option>
                                <option value="tiang">
                                    Tiang
                                </option>
                                <option value="ont">
                                    ONT
                                </option>
                            </select>

                        </div>

                    </div>

                </div>

                {/* Tabel */}

                <div className="overflow-hidden rounded-2xl bg-white dark:bg-night-900 shadow-sm border border-gray-100 dark:border-night-700">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full min-w-[700px] border-collapse text-xs">

                            <thead>
                                <tr className="bg-gray-50/70 dark:bg-night-800/70 border-b border-gray-200 dark:border-night-700 text-center font-medium">
                                    <th className="w-12 px-4 py-3">
                                        No
                                    </th>

                                    <th className="w-24 px-4 py-3">
                                        Wilayah
                                    </th>

                                    <th className="px-4 py-3">
                                        Total Aset
                                    </th>

                                    <th className="px-4 py-3">
                                        Total Tiang
                                    </th>

                                    <th className="px-4 py-3">
                                        Total ONT
                                    </th>

                                    <th className="px-4 py-3">
                                        Aset Aktif
                                    </th>

                                    <th className="w-20 px-4 py-3">
                                        Aset Nonaktif
                                    </th>

                                    <th className="w-20 px-4 py-3">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="text-center capitalize divide-y divide-gray-100 dark:divide-night-700">
                                {listWilayah.length > 0 ? (
                                    listWilayah.map((row, index) => (
                                        <tr key={row.id ?? row.nama_wilayah ?? index} className="border-b border-gray-100 dark:border-night-700 last:border-b-0 hover:bg-gray-50/80 dark:hover:bg-night-800/80 transition-colors font-light">
                                            <td className="px-4 py-2">
                                                {String((dataWilayah?.from ? dataWilayah.from + index : index + 1)).padStart(2, "0")}
                                            </td>

                                            <td className="px-4 py-2">
                                                {row.nama_wilayah ?? <span className="text-gray-400 dark:text-night-500">Belum ada data</span>}
                                            </td>

                                            <td className="px-4 py-2">
                                                {row.total_aset ?? 0}
                                            </td>

                                            <td className="px-4 py-2">
                                                {row.total_tiang ?? 0}
                                            </td>

                                            <td className="px-4 py-2">
                                                {row.total_ont ?? 0}
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <span className="rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/20">
                                                    {row.aset_aktif ?? 0}
                                                </span>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/20">
                                                    {row.aset_nonaktif ?? 0}
                                                </span>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center justify-center">
                                                    <TableDelete
                                                        type="wilayah"
                                                        id={row.id}
                                                        name={row.nama_wilayah}
                                                        base={base}
                                                        title="Hapus Wilayah"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <TableEmpty colSpan="8" icon={FaMap} title="Belum ada data" hint="Data wilayah belum tersedia atau filter tidak menghasilkan data." />
                                )}
                            </tbody>

                        </table>
                    </div>

                    {/* Kartu Mobile */}

                    <div className="space-y-3 p-4 md:hidden">
                        {listWilayah.length > 0 ? (
                            listWilayah.map((row, index) => (
                                <MobileDataCard
                                    key={row.id ?? row.nama_wilayah ?? index}
                                    title={row.nama_wilayah}
                                    subtitle={`Total ${row.total_aset ?? 0} aset • Tiang ${row.total_tiang ?? 0} • ONT ${row.total_ont ?? 0}`}
                                    imageSrc={null}
                                    fallbackLabel={String(row.nama_wilayah || "W").slice(0, 1).toUpperCase()}
                                    status={null}
                                    meta={[
                                        { label: "Aktif", value: String(row.aset_aktif ?? 0) },
                                        { label: "Nonaktif", value: String(row.aset_nonaktif ?? 0) },
                                    ]}
                                    actions={
                                        <CardDelete
                                            type="wilayah"
                                            id={row.id}
                                            name={row.nama_wilayah}
                                            base={base}
                                        />
                                    }
                                />
                            ))
                        ) : (
                            <CardEmpty />
                        )}
                    </div>
                    {dataWilayah?.links && dataWilayah.links.length > 3 && (
                        <div className="flex flex-wrap gap-1.5 justify-center mt-4 pb-3 max-md:px-2">
                            {dataWilayah.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ring-1 transition ${link.active ? 'bg-[#AB3C3C] text-white ring-[#AB3C3C]' : 'bg-white dark:bg-night-800 border border-gray-200 dark:border-night-600 text-gray-700 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-700'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </MainLayout>
    );
}
