import MainLayout from "../../Layouts/MainLayout";
import LocationPicker from "../../Components/LocationPicker";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import useBase from "../../hooks/useBase";

export default function FormTambahONT({ wilayah }) {
    const [form, setForm] = useState({
        kode_ont: "",
        wilayah: "",
        kecamatan: "",
        kelurahan: "",
        deskripsi_ont: "",
        foto_ont_1: null,
        foto_ont_2: null,
        foto_ont_3: null,
        foto_ont_4: null,
        foto_ont_5: null,
        latitude: "",
        longitude: "",
        nama_petugas: "",
        status: "",
    });
    const [kodeEdited, setKodeEdited] = useState(false);
    const placeholderKode = useMemo(() => {
        const wil = wilayah?.find((w) => w.nama_wilayah === form.wilayah);
        const kode = wil?.kode_wilayah;
        return kode ? `SIMS-${kode}-` : "SIMS-YGY-";
    }, [form.wilayah, wilayah]);
    const { settings } = usePage().props;
    const [kecamatanOptions, setKecamatanOptions] = useState([]);
    const [kelurahanOptions, setKelurahanOptions] = useState([]);
    const [kecamatanLoading, setKecamatanLoading] = useState(false);
    const [kelurahanLoading, setKelurahanLoading] = useState(false);
    const [kelurahanManual, setKelurahanManual] = useState(false);
    const [kecFocused, setKecFocused] = useState(false);
    const [kelFocused, setKelFocused] = useState(false);
    const base = useBase();
    const resolveUrl = (path) => `${base}/${path}`.replace(/\/+/g, '/');
    const levenshtein = (a, b) => {
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
        return dp[m][n];
    };
    const similarity = (a, b) => {
        const al = a.toLowerCase().trim(), bl = b.toLowerCase().trim();
        if (!al || !bl) return 0;
        if (bl.includes(al) && al.length >= 2) {
            const ratio = al.length / bl.length;
            if (ratio >= 0.7) return 1;
            if (ratio >= 0.4) return 0.85;
        }
        const dist = levenshtein(al, bl);
        return 1 - dist / Math.max(al.length, bl.length);
    };

    // Kecamatan Kelurahan

    useEffect(() => {
        const targetWilayah = form.wilayah || settings?.nama_wilayah;
        if (!targetWilayah) { setKecamatanOptions([]); return; }
        const wil = wilayah?.find((w) => w.nama_wilayah === targetWilayah);
        const kode = wil?.kode_wilayah || targetWilayah;
        if (!kode) { setKecamatanOptions([]); return; }
        let cancelled = false;
        setKecamatanLoading(true);
        fetch(resolveUrl(`api/regions/kabupaten/${kode}/kecamatan`))
            .then((r) => r.json())
            .then((j) => {
                if (cancelled) return;
                const data = Array.isArray(j?.data) ? j.data : [];
                setKecamatanOptions(data);
            })
            .catch(() => { if (!cancelled) setKecamatanOptions([]); })
            .finally(() => { if (!cancelled) setKecamatanLoading(false); });
        return () => { cancelled = true; };
    }, [form.wilayah, settings?.nama_wilayah, wilayah, base]);

    const fetchKelurahanForKecamatanName = (kecName) => {
        const opt = kecamatanOptions.find((o) => o.name.toLowerCase() === kecName.toLowerCase().trim());
        const code = opt?.code;
        if (!code) { setKelurahanManual(true); setKelurahanOptions([]); return; }
        setKelurahanLoading(true);
        fetch(resolveUrl(`api/regions/kecamatan/${code}/kelurahan`))
            .then((r) => r.json())
            .then((j) => {
                const data = Array.isArray(j?.data) ? j.data : [];
                if (data.length === 0) { setKelurahanManual(true); setKelurahanOptions([]); }
                else { setKelurahanManual(false); setKelurahanOptions(data); }
            })
            .catch(() => { setKelurahanManual(true); setKelurahanOptions([]); })
            .finally(() => setKelurahanLoading(false));
    };
    const handleKecamatanChange = (e) => {
        const val = e.target.value;
        setForm({ ...form, kecamatan: val, kelurahan: "" });
        setKelurahanOptions([]);
        setKelurahanManual(false);
        if (!val) return;
        const opt = kecamatanOptions.find((o) => o.name === val);
        const code = opt?.code;
        if (!code) { setKelurahanManual(true); return; }
        setKelurahanLoading(true);
        fetch(resolveUrl(`api/regions/kecamatan/${code}/kelurahan`))
            .then((r) => r.json())
            .then((j) => {
                const data = Array.isArray(j?.data) ? j.data : [];
                if (data.length === 0) { setKelurahanManual(true); setKelurahanOptions([]); }
                else { setKelurahanManual(false); setKelurahanOptions(data); }
            })
            .catch(() => { setKelurahanManual(true); setKelurahanOptions([]); })
            .finally(() => setKelurahanLoading(false));
    };
    const filteredKecamatan = useMemo(() => {
        const input = (form.kecamatan || "").trim();
        if (input.length < 2 || kecamatanOptions.length === 0) return [];
        if (kecamatanOptions.some((o) => o.name.toLowerCase() === input.toLowerCase())) return [];
        return kecamatanOptions.filter((opt) => similarity(input, opt.name) >= 0.7).slice(0, 6);
    }, [form.kecamatan, kecamatanOptions]);
    const filteredKelurahan = useMemo(() => {
        const input = (form.kelurahan || "").trim();
        if (input.length < 2 || kelurahanOptions.length === 0 || kelurahanManual) return [];
        if (kelurahanOptions.some((o) => o.name.toLowerCase() === input.toLowerCase())) return [];
        return kelurahanOptions.filter((opt) => similarity(input, opt.name) >= 0.7).slice(0, 6);
    }, [form.kelurahan, kelurahanOptions, kelurahanManual]);
    useEffect(() => {
        if (!form.kecamatan || kecamatanOptions.length === 0) return;
        const exact = kecamatanOptions.find((o) => o.name.toLowerCase() === form.kecamatan.toLowerCase().trim());
        if (exact && kelurahanOptions.length === 0 && !kelurahanLoading && !kelurahanManual) {
            fetchKelurahanForKecamatanName(form.kecamatan);
        }
    }, [form.kecamatan]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "kode_ont") setKodeEdited(true);
        if (name === "wilayah") {
            const wil = wilayah?.find((w) => w.nama_wilayah === value);
            const kodeWil = wil?.kode_wilayah;
            const prefix = kodeWil ? `SIMS-${kodeWil}-` : "";
            if (!kodeEdited && prefix) {
                setForm((prev) => ({ ...prev, wilayah: value, kecamatan: "", kelurahan: "", kode_ont: prefix }));
            } else {
                setForm((prev) => ({ ...prev, wilayah: value, kecamatan: "", kelurahan: "" }));
            }
            setKelurahanOptions([]);
            setKelurahanManual(false);
            setKecFocused(false);
            setKelFocused(false);
            return;
        }
        if (name === "kecamatan") {
            setForm({ ...form, kecamatan: value, kelurahan: "" });
            setKelurahanOptions([]);
            setKelurahanManual(false);
            return;
        }
        if (name === "kelurahan") {
            setForm({ ...form, kelurahan: value });
            return;
        }
        setForm({
            ...form,
            [name]: files ? files[0] : value,
        });
    };

    const setCoords = (lat, lng) => {
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(resolveUrl("simpan-ont"), form, {
            forceFormData: true,

            onError: (errors) => {
                console.log(errors);
                const raw = errors?.error || Object.values(errors || {})[0];
                const msg = Array.isArray(raw) ? raw[0] : raw;
                const display = msg || "Gagal menyimpan ONT. Periksa kembali isian form.";
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
                            Form Tambah ONT
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
                        onClick={() => window.history.back()}
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

                            {/* Kode ONT */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Kode ONT
                                </label>

                                <input
                                    name="kode_ont"
                                    type="text"
                                    value={form.kode_ont}
                                    onChange={handleChange}
                                    placeholder={placeholderKode}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                            </div>

                            {/* Wilayah */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Wilayah
                                </label>

                                <select
                                    name="wilayah"
                                    value={form.wilayah}
                                    onChange={handleChange}
                                    required
                                    className="capitalize w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                >
                                    <option value="" disabled>
                                        {wilayah?.length === 0
                                            ? "Belum ada data wilayah"
                                            : "Pilih Wilayah"}
                                    </option>

                                    {wilayah?.map((item) => (
                                        <option
                                            className="capitalize"
                                            key={item.id}
                                            value={item.nama_wilayah}
                                        >
                                            {item.nama_wilayah}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Kecamatan */}

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Kecamatan
                                </label>

                                <input
                                    name="kecamatan"
                                    type="text"
                                    value={form.kecamatan}
                                    onChange={handleChange}
                                    onFocus={() => setKecFocused(true)}
                                    onBlur={() => setTimeout(() => setKecFocused(false), 180)}
                                    placeholder={kecamatanLoading ? "Memuat kecamatan..." : "Ketik kecamatan"}
                                    required
                                    autoComplete="off"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                                {kecFocused && filteredKecamatan.length > 0 && (
                                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 shadow-lg">
                                        {filteredKecamatan.map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setForm((prev) => ({ ...prev, kecamatan: opt.name, kelurahan: "" }));
                                                    setKecFocused(false);
                                                    setKelurahanOptions([]);
                                                    setKelurahanManual(false);
                                                    setKelurahanLoading(true);
                                                    fetch(resolveUrl(`api/regions/kecamatan/${opt.code}/kelurahan`))
                                                        .then((r) => r.json())
                                                        .then((j) => {
                                                            const data = Array.isArray(j?.data) ? j.data : [];
                                                            if (data.length === 0) { setKelurahanManual(true); setKelurahanOptions([]); }
                                                            else { setKelurahanManual(false); setKelurahanOptions(data); }
                                                        })
                                                        .catch(() => { setKelurahanManual(true); setKelurahanOptions([]); })
                                                        .finally(() => setKelurahanLoading(false));
                                                }}
                                                className="w-full px-4 py-2.5 text-left capitalize text-sm hover:bg-[#AB3C3C]/10 hover:text-[#AB3C3C] transition"
                                            >
                                                <span className="font-medium">{opt.name}</span>

                                            </button>
                                        ))}
                                    </div>
                                )}
                                {kecamatanLoading && <p className="mt-1 text-[11px] text-gray-400 dark:text-night-500">Memuat kecamatan...</p>}
                            </div>

                            {/* Kelurahan */}

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Kelurahan
                                </label>

                                <input
                                    name="kelurahan"
                                    type="text"
                                    value={form.kelurahan}
                                    onChange={handleChange}
                                    onFocus={() => setKelFocused(true)}
                                    onBlur={() => setTimeout(() => setKelFocused(false), 180)}
                                    placeholder={kelurahanLoading ? "Memuat..." : kelurahanManual && kelurahanOptions.length === 0 ? "Kelurahan tidak terdeteksi – isi manual" : "Ketik kelurahan"}
                                    required
                                    autoComplete="off"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500 disabled:bg-gray-50"
                                />
                                {kelFocused && filteredKelurahan.length > 0 && (
                                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 shadow-lg">
                                        {filteredKelurahan.map((opt) => (
                                            <button
                                                key={opt.code}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setForm((prev) => ({ ...prev, kelurahan: opt.name }));
                                                    setKelFocused(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left capitalize text-sm hover:bg-[#AB3C3C]/10 hover:text-[#AB3C3C] transition"
                                            >
                                                <span className="font-medium">{opt.name}</span>

                                            </button>
                                        ))}
                                    </div>
                                )}
                                {kelurahanManual && (
                                    <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">Kelurahan tidak terdeteksi – silakan isi manual.</p>
                                )}
                                {kelurahanLoading && <p className="mt-1 text-[11px] text-gray-400 dark:text-night-500">Memuat kelurahan...</p>}
                            </div>

                            {/* Petugas */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Nama Petugas
                                </label>

                                <input
                                    name="nama_petugas"
                                    type="text"
                                    value={form.nama_petugas}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama petugas"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                />
                            </div>

                            {/* Status */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    required
                                    className="capitalize w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                >
                                    <option value="" disabled>
                                        Pilih Status
                                    </option>

                                    <option value="aktif">
                                        Aktif
                                    </option>

                                    <option value="nonaktif">
                                        Nonaktif
                                    </option>
                                </select>
                            </div>

                            {/* Lokasi */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Titik Lokasi <span className="font-normal text-gray-400 dark:text-night-500">(klik peta / cari alamat)</span>
                                </label>

                                <LocationPicker
                                    latitude={form.latitude}
                                    longitude={form.longitude}
                                    type="ont"
                                    status={form.status}
                                    onChange={setCoords}
                                />
                            </div>

                            {/* Koordinat */}

                            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-night-200">
                                        Latitude
                                    </label>

                                    <input
                                        type="text"
                                        name="latitude"
                                        value={form.latitude}
                                        onChange={handleChange}
                                        placeholder="Masukkan latitude"
                                        required
                                        className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-4 py-3 text-sm text-gray-900 dark:text-night-200 outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-night-200">
                                        Longitude
                                    </label>

                                    <input
                                        type="text"
                                        name="longitude"
                                        value={form.longitude}
                                        onChange={handleChange}
                                        placeholder="Masukkan longitude"
                                        required
                                        className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 px-4 py-3 text-sm text-gray-900 dark:text-night-200 outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                                    />
                                </div>
                            </div>

                            {/* Foto */}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                    Foto ONT
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Foto 1 */}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-night-400 mb-1">
                                            Foto 1
                                        </label>

                                        <input
                                            name="foto_ont_1"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-night-700 rounded-xl text-sm text-gray-600 dark:text-night-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 shadow-sm"
                                        />
                                    </div>

                                    {/* Foto 2 */}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-night-400 mb-1">
                                            Foto 2
                                        </label>

                                        <input
                                            name="foto_ont_2"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-night-700 rounded-xl text-sm text-gray-600 dark:text-night-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 shadow-sm"
                                        />
                                    </div>

                                    {/* Foto 3 */}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-night-400 mb-1">
                                            Foto 3
                                        </label>

                                        <input
                                            name="foto_ont_3"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-night-700 rounded-xl text-sm text-gray-600 dark:text-night-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 shadow-sm"
                                        />
                                    </div>

                                    {/* Foto 4 */}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-night-400 mb-1">
                                            Foto 4
                                        </label>

                                        <input
                                            name="foto_ont_4"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-night-700 rounded-xl text-sm text-gray-600 dark:text-night-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 shadow-sm"
                                        />
                                    </div>

                                    {/* Foto 5 */}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-night-400 mb-1">
                                            Foto 5
                                        </label>

                                        <input
                                            name="foto_ont_5"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-night-700 rounded-xl text-sm text-gray-600 dark:text-night-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deskripsi */}

                        <div className="mt-5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
                                Deskripsi ONT
                            </label>

                            <textarea
                                name="deskripsi_ont"
                                value={form.deskripsi_ont}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Masukkan deskripsi ont..."
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 rounded-xl outline-none resize-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                            />
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

