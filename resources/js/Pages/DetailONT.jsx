import MainLayout from "../Layouts/MainLayout";
import MapView from "../Components/MapView";
import GoogleMapsButton from "../Components/GoogleMapsButton";
import DeleteDataButton from "../Components/DeleteDataButton";
import { FaArrowLeft, FaPen } from "react-icons/fa";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import useBase from "../hooks/useBase";

export default function DetailONT({ ont }) {
    const { settings } = usePage().props;
    const base = useBase();

    const getFotoUrl = (foto) => {
        if (!foto) return null;
        return `${base}/public/storage/${foto}`.replace(/\/+/g, '/');
    };

    const images = [
        ont?.foto_ont_1,
        ont?.foto_ont_2,
        ont?.foto_ont_3,
        ont?.foto_ont_4,
        ont?.foto_ont_5,
    ].filter(Boolean);

    const [activeImage, setActiveImage] = useState(
        images.length > 0 ? getFotoUrl(images[0]) : null
    );

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="flex items-stretch justify-between gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">
                    <div className="flex-1 rounded-2xl bg-gradient-to-br text-white from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Detail ONT
                        </span>

                        <span className="mx-3 opacity-60 max-md:mx-1.5 max-md:shrink-0">
                            /
                        </span>

                        <span className="text-xs font-light capitalize opacity-90 max-md:truncate max-md:text-[11px]">
                            {ont?.wilayah ?? settings?.nama_wilayah ?? "Wilayah belum ditentukan"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        title="Kembali"
                        aria-label="Kembali"
                        className="ml-3 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-2.5 text-xs font-medium text-white shadow-md transition hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-[0.98] max-md:ml-0 max-md:rounded-lg max-md:px-4 max-md:py-4"
                    >
                        <FaArrowLeft />
                        <span className="max-md:hidden">Kembali</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4">

                        {/* Foto Utama */}

                        <div className="mb-3">
                            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-700 dark:text-night-200">
                                Foto Utama
                            </p>
                            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-night-700 shadow-sm">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={`Foto ${ont?.kode_ont ?? "ONT"}`}
                                        className="h-[330px] w-full object-cover transition duration-300 hover:scale-[1.01] max-md:h-[220px]"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="flex h-[330px] w-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 max-md:h-[220px]">
                                        <span className="text-xs text-gray-400 dark:text-night-500">
                                            Belum ada foto ONT
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Miniatur */}

                        <div className="mt-3 grid grid-cols-5 gap-3 max-md:grid-cols-3 max-md:gap-2">
                            {images.length > 0 ? (
                                images.map((image, index) => {
                                    const imageUrl = getFotoUrl(image);
                                    return (
                                        <div key={image}>
                                            <p className="mb-1.5 text-center text-[10px] font-semibold tracking-wide text-gray-600 dark:text-night-300">
                                                Foto {index + 1}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setActiveImage(imageUrl)}
                                                className={`w-full overflow-hidden rounded-xl border-2 transition shadow-sm ${activeImage === imageUrl
                                                    ? "border-sky-500 ring-2 ring-sky-100"
                                                    : "border-transparent hover:border-gray-200 hover:shadow"
                                                    }`}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`Foto ${index + 1}`}
                                                    className="h-24 w-full object-cover max-md:h-20"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-5 flex h-24 items-center justify-center rounded-xl bg-gray-50 dark:bg-night-800/60 border border-dashed border-gray-200 dark:border-night-700">
                                    <span className="text-[10px] text-gray-400 dark:text-night-500">
                                        Belum ada foto
                                    </span>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="rounded-2xl bg-white dark:bg-night-900 p-5 shadow-sm border border-gray-100 dark:border-night-700 max-md:p-4">

                        {/* Judul */}

                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-night-200">
                                    {ont?.kode_ont ?? "Data ONT"}
                                </h2>
                            </div>
                        </div>

                        {/* Informasi */}

                        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 text-xs max-sm:grid-cols-1 max-sm:gap-y-4">

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Wilayah
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    {ont?.wilayah || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Koordinat
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    Latitude: {ont?.latitude || "-"}
                                </p>
                                <p className="text-gray-600 dark:text-night-300">
                                    Longitude: {ont?.longitude || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Deskripsi ONT
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    {ont?.deskripsi_ont || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Status
                                </p>
                                <div className="mt-1 flex items-center gap-1 text-gray-600 dark:text-night-300">
                                    <span className={`h-2 w-2 rounded-full ${ont?.status?.toLowerCase() === "aktif" ? "bg-green-500" : "bg-red-500"}`} />
                                    {ont?.status || "-"}
                                </div>
                            </div>

                            {ont?.updated_by && (
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-night-200">
                                        Diperbarui oleh
                                    </p>
                                    <p className="mt-1 text-gray-600 dark:text-night-300">
                                        {ont.updated_by}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Kecamatan
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    {ont?.kecamatan || ont?.area || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Kelurahan
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    {ont?.kelurahan || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800 dark:text-night-200">
                                    Kode ONT
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-night-300">
                                    {ont?.kode_ont || "-"}
                                </p>
                            </div>

                        </div>

                        {/* Ubah */}

                        <div className="mt-5 flex flex-wrap items-center gap-2 max-sm:flex-col max-sm:items-stretch">
                            <button
                                type="button"
                                onClick={() => router.get(`${base}/edit-ont/${ont?.id}`.replace(/\/+/g, '/'))}
                                className="flex w-fit items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-xs font-medium text-white shadow-md transition hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] max-sm:w-full max-sm:justify-center"
                            >
                                <FaPen />
                                Edit Data
                            </button>

                            <GoogleMapsButton
                                latitude={ont?.latitude}
                                longitude={ont?.longitude}
                            />

                            <DeleteDataButton
                                type="ont"
                                id={ont?.id}
                                kode={ont?.kode_ont}
                                base={base}
                            />
                        </div>

                        {/* Peta */}

                        <div className="relative mt-4 h-[220px] overflow-hidden rounded-xl bg-gray-100 dark:bg-night-800 border border-gray-200 dark:border-night-700 shadow-inner">

                            <MapView
                                latitude={ont?.latitude}
                                longitude={ont?.longitude}
                                type="ont"
                                status={ont?.status}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
