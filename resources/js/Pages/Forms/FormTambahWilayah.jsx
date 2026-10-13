import MainLayout from "../../Layouts/MainLayout";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import useBase from "../../hooks/useBase";

export default function FormTambahWilayah() {
    const { settings } = usePage().props;
    const base = useBase();
    const resolveUrl = (path) => `${base}/${path}`.replace(/\/+/g, '/');
    const [form, setForm] = useState({
        nama_wilayah: "",
        kode_wilayah: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleBack = () => {
        router.get(resolveUrl("wilayah"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(resolveUrl("simpan-wilayah"), form, {
            onError: (errors) => {
                console.log(errors);
                const raw = errors?.error || Object.values(errors || {})[0];
                const msg = Array.isArray(raw) ? raw[0] : raw;
                const display = msg || "Gagal menyimpan wilayah. Periksa kembali isian form.";
                window.dispatchEvent(new CustomEvent("layout:error", { detail: display }));
            },
        });
    };

    return (
        <MainLayout>
            <div className="space-y-4">

                {/* Header */}

                <div className="flex items-stretch justify-between gap-4 max-md:flex-row max-md:items-stretch max-md:gap-2">
                    <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] px-4 py-3.5 text-white shadow-md border border-white/10 max-md:flex max-md:min-w-0 max-md:items-center max-md:rounded-xl max-md:px-3 max-md:py-2.5">
                        <span className="text-sm font-semibold tracking-wide max-md:shrink-0 max-md:text-[13px] max-md:whitespace-nowrap">
                            Form Tambah Wilayah
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
                        <FaArrowLeft size={14} />
                        <span className="max-md:hidden">Kembali</span>
                    </button>
                </div>

                {/* Formulir */}

                <div className="bg-white dark:bg-night-900 rounded-2xl shadow-sm border border-gray-100 dark:border-night-700 p-6 md:p-7 max-md:p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Nama Wilayah */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Nama Wilayah
                                </label>

                                <input
                                    name="nama_wilayah"
                                    type="text"
                                    value={form.nama_wilayah}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama wilayah"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500 capitalize"
                                />
                            </div>

                            {/* Kode Wilayah */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Kode Wilayah
                                </label>

                                <input
                                    name="kode_wilayah"
                                    type="text"
                                    value={form.kode_wilayah}
                                    onChange={handleChange}
                                    placeholder="Masukkan kode wilayah"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                            </div>

                        </div>

                        {/* Simpan */}

                        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-night-700 max-md:flex-col-reverse max-md:items-stretch">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-green-700 active:scale-[0.98] transition max-md:w-full max-md:justify-center"
                            >
                                <FaSave size={14} />
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
