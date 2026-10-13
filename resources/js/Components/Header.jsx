import { memo, useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaWifi, FaTimes, FaUserCircle } from "react-icons/fa";
import { LuUtilityPole } from "react-icons/lu";
import { IoMdArrowDropdown, IoMdNotifications } from "react-icons/io";
import { IoIosSettings, IoIosLogOut } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { usePage, router } from "@inertiajs/react";
import useBase, { asset } from "../hooks/useBase";

const Header = memo(function Header({ onMenu }) {
    const { url, props } = usePage();
    const unreadCount = Number(props?.unreadNotifikasi || 0);
    const username = props?.auth?.username ?? "";
    const base = useBase();

    const [query, setQuery] = useState("");
    const [asetFilter, setAsetFilter] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileBusy, setMobileBusy] = useState(false);
    const [mobileNotice, setMobileNotice] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const mobileWrapperRef = useRef(null);
    const profileRef = useRef(null);
    const wrapperRef = useRef(null);
    const abortRef = useRef(null);

    const handleSelectChange = useCallback((e) => {
        const v = e.target.value;
        if (v === "Tiang" || v === "tiang") setAsetFilter("tiang");
        else if (v === "ONT" || v === "ont") setAsetFilter("ont");
        else setAsetFilter("");
    }, []);

    const fetchSearchResults = useCallback(async (q, type, signal) => {
        const typeParam = type ? `&type=${encodeURIComponent(type)}` : "";
        const searchUrl = `${base}/api/search`.replace(/\/+/g, '/') + `?q=${encodeURIComponent(q)}${typeParam}`;
        const res = await fetch(searchUrl, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            signal,
            credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();
        return Array.isArray(data.results) ? data.results : [];
    }, [base]);

    useEffect(() => {
        if (abortRef.current) abortRef.current.abort();
        const q = query.trim();
        if (q.length < 2) {
            setResults([]);
            setOpen(false);
            setLoading(false);
            return;
        }
        const t = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            try {
                const list = await fetchSearchResults(q, asetFilter, controller.signal);
                setResults(list);
                setOpen(list.length > 0);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    setResults([]);
                    setOpen(false);
                }
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query, asetFilter, base, fetchSearchResults]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
            if (mobileWrapperRef.current && !mobileWrapperRef.current.contains(e.target)) {
                setMobileSearchOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        const escapeHandler = (e) => {
            if (e.key === "Escape") {
                setProfileOpen(false);
                setMobileSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        document.addEventListener('keydown', escapeHandler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
            document.removeEventListener('keydown', escapeHandler);
        };
    }, []);

    const handleResultClick = useCallback((item) => {
        if (!item?.href) return;
        setOpen(false);
        setMobileSearchOpen(false);
        setQuery("");
        const href = `${base}/${item.href}`.replace(/\/+/g, '/');
        router.get(href);
    }, [base]);

    const resolveRedirect = useCallback((item, asetSpecified) => {
        if (!item) return null;
        if (item.match === 'kode' || item.match === 'petugas' || asetSpecified || !item.wilayahId) {
            return item.href || null;
        }
        return `wilayah?wilayah=${item.wilayahId}`;
    }, []);

    const onMobileSubmit = useCallback(async (e) => {
        e?.preventDefault();
        const q = query.trim();
        if (q.length < 2) {
            setMobileNotice("Masukkan minimal 2 karakter");
            return;
        }
        if (mobileBusy) return;
        setMobileNotice("");
        setMobileBusy(true);
        try {
            const controller = new AbortController();
            const list = await fetchSearchResults(q, asetFilter, controller.signal);
            const top = list[0];
            if (!top) {
                setMobileNotice("Tidak ditemukan, coba kata kunci lain");
                return;
            }
            const target = resolveRedirect(top, !!asetFilter);
            if (!target) {
                setMobileNotice("Tidak ditemukan, coba kata kunci lain");
                return;
            }
            setMobileSearchOpen(false);
            setMobileNotice("");
            setQuery("");
            router.get(`${base}/${target}`.replace(/\/+/g, '/'));
        } catch (err) {
            if (err?.name !== 'AbortError') {
                setMobileNotice("Pencarian gagal, coba lagi");
            }
        } finally {
            setMobileBusy(false);
        }
    }, [query, asetFilter, base, mobileBusy, fetchSearchResults, resolveRedirect]);

    return (
        <header className="sticky top-0 z-50 flex h-18 items-center justify-between bg-gradient-to-r from-[#6F2424] to-[#AB3C3C] px-6 py-2 max-md:gap-2 max-md:px-3 max-md:h-[60px] max-md:min-h-[60px] max-md:max-h-[60px] max-md:py-0">

            {/* Logo */}

            <div className="flex items-center gap-5 max-md:gap-2">
                {onMenu && (
                    <button
                        type="button"
                        onClick={onMenu}
                        aria-label="Buka menu navigasi"
                        className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 max-md:flex"
                    >
                        <FiMenu size={20} />
                    </button>
                )}
                <div>
                    <img
                        src={asset("public/Assets/Logo.png")}
                        alt="Logo"
                        className="w-10 max-md:w-8"
                        width="40"
                        height="40"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <h1 className="text-xl font-bold text-white max-md:text-base">
                    GIS Dashboard
                </h1>
            </div>

            {/* Pencarian */}

            <div ref={wrapperRef} className="absolute left-1/2 w-[400px] -translate-x-1/2 flex gap-3 max-md:hidden">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (results.length > 0 && query.trim().length >= 2) setOpen(true);
                        }}
                        placeholder="Cari Aset..."
                        className="w-full rounded-full bg-white px-5 py-2 pr-10 text-sm text-black outline-none focus:bg-white"
                    />

                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-black transition hover:text-[#ab3c3c]" />

                    {/* Hasil Pencarian */}

                    {open && (
                        <div className="absolute left-0 top-full mt-2 w-full max-h-[320px] overflow-auto rounded-xl bg-white shadow-xl border border-gray-200 z-[100] dark:bg-night-900 dark:border-night-700">
                            {loading ? (
                                <div className="px-4 py-3 text-xs text-gray-500 dark:text-night-400">Mencari...</div>
                            ) : results.length > 0 ? (
                                results.map((item) => {
                                    const isKode = item.match === 'kode';
                                    const Icon = item.type === 'tiang' ? LuUtilityPole : FaWifi;
                                    return (
                                        <button
                                            key={`${item.type}-${item.id}-${item.match}-${item.href}`}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleResultClick(item)}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition dark:hover:bg-night-800 dark:border-night-700"
                                        >
                                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${item.type === 'tiang' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300'}`}>
                                                <Icon size={14} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-800 truncate flex items-center gap-2 dark:text-night-200">
                                                    <span className="truncate">{isKode ? item.kode : item.label}</span>
                                                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] text-white ${item.type === 'tiang' ? 'bg-blue-600' : 'bg-sky-500'}`}>{item.type.toUpperCase()}</span>
                                                    {!isKode && <span className="shrink-0 text-[10px] text-gray-400 dark:text-night-500">→ Filter</span>}
                                                    {isKode && <span className="shrink-0 text-[10px] text-gray-400 dark:text-night-500">→ Detail</span>}
                                                </p>
                                                <p className="text-[11px] text-gray-500 truncate dark:text-night-400">
                                                    {isKode ? `${item.match}: ${item.matchedValue} • ${item.label}` : `${item.match}: ${item.matchedValue}`}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : null}
                        </div>
                    )}
                </div>
                <div className="flex items-center bg-white rounded-full gap-2">
                    <select value={asetFilter === "tiang" ? "Tiang" : asetFilter === "ont" ? "ONT" : ""} onChange={handleSelectChange} className="capitalize text-xs text-gray-800 outline-none appearance-none px-3 py-2 bg-transparent">
                        <option value="">Pilih Aset</option>
                        <option value="Tiang">Tiang</option>
                        <option value="ONT">ONT</option>
                    </select>

                    <IoMdArrowDropdown className="pr-3 w-8 text-gray-600" />
                </div>
            </div>

            {/* Aksi Header */}

            <div className="flex items-center gap-2 max-md:gap-1">

                {/* Cari Mobile */}

                <div ref={mobileWrapperRef} className="relative hidden max-md:block md:hidden">
                    <button
                        type="button"
                        onClick={() => {
                            setMobileSearchOpen(!mobileSearchOpen);
                            setMobileNotice("");
                        }}
                        aria-label={mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                    >
                        {mobileSearchOpen ? <FaTimes size={16} /> : <FaSearch size={16} />}
                    </button>

                    {mobileSearchOpen && (
                        <div className="absolute right-0 top-full z-[100] mt-2 max-h-[70vh] w-[calc(100vw-6rem)] max-w-[320px] overflow-auto rounded-2xl border border-white/20 dark:border-night-700 bg-[#6F2424] dark:bg-night-900 p-3 shadow-xl">
                            <form onSubmit={onMobileSubmit}>
                                <div className="relative">
                                    <input
                                        type="search"
                                        enterKeyHint="search"
                                        value={query}
                                        disabled={mobileBusy}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setMobileNotice("");
                                        }}
                                        placeholder="Cari Aset..."
                                        className="w-full rounded-full bg-white px-4 py-2.5 pr-10 text-sm text-black outline-none disabled:opacity-70"
                                    />
                                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
                                </div>
                            </form>
                            {mobileBusy && (
                                <p className="mt-2 px-1 text-xs text-white/80">Mencari...</p>
                            )}
                            {!mobileBusy && mobileNotice && (
                                <p className="mt-2 px-1 text-xs text-white/90">{mobileNotice}</p>
                            )}
                            {!mobileBusy && !mobileNotice && (
                                <p className="mt-2 px-1 text-[11px] text-white/60">Tekan cari pada keyboard untuk menemukan aset</p>
                            )}
                            <div className="mt-2 flex items-center justify-between rounded-full bg-white px-3 py-1">
                                <select value={asetFilter === "tiang" ? "Tiang" : asetFilter === "ont" ? "ONT" : ""} onChange={handleSelectChange} className="capitalize w-full appearance-none bg-transparent px-1 py-1.5 text-xs text-gray-800 outline-none">
                                    <option value="">Pilih Aset</option>
                                    <option value="Tiang">Tiang</option>
                                    <option value="ONT">ONT</option>
                                </select>
                                <IoMdArrowDropdown className="shrink-0 text-gray-600" />
                            </div>
                        </div>
                    )}
                </div>

                <a href={`${base}/notifikasi`.replace(/\/+/g, '/')} className="relative hidden md:block max-md:shrink-0">
                    <IoMdNotifications size={50} className="px-3 text-white/65 hover:text-white transition-all duration-200 max-md:h-10 max-md:w-10 max-md:px-2 max-md:scale-100" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white max-md:h-4 max-md:min-w-4 max-md:px-0.5 max-md:text-[8px] max-md:leading-none max-md:right-1 max-md:top-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </a>

                {/* Profil */}

                <div ref={profileRef} className="relative hidden md:block max-md:shrink-0">
                    <button
                        type="button"
                        onClick={() => setProfileOpen(!profileOpen)}
                        aria-label={profileOpen ? "Tutup menu profil" : "Buka menu profil"}
                        aria-expanded={profileOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                    >
                        <FaUserCircle size={20} className="max-md:text-lg" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full z-[100] mt-2 w-56 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-white/20 bg-[#6F2424] shadow-xl">
                            <div className="truncate px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-white/60">
                                    Pengguna
                                </p>
                                <p className="mt-0.5 truncate text-sm font-semibold text-white" title={username}>
                                    {username || "-"}
                                </p>
                            </div>
                            <div className="bg-white py-1 dark:bg-night-900">
                                <a
                                    href={`${base}/pengaturan`.replace(/\/+/g, '/')}
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#AB3C3C] dark:text-night-200 dark:hover:bg-night-800"
                                >
                                    <IoIosSettings size={18} className="shrink-0 text-gray-400 dark:text-night-500" />
                                    Pengaturan Profil
                                </a>
                                <a
                                    href={`${base}/logout`.replace(/\/+/g, '/')}
                                    onClick={(e) => {
                                        if (!confirm("Kembali ke Halaman Login?")) {
                                            e.preventDefault();
                                        } else {
                                            setProfileOpen(false);
                                        }
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#AB3C3C] dark:text-night-200 dark:hover:bg-night-800"
                                >
                                    <IoIosLogOut size={18} className="shrink-0 text-gray-400 dark:text-night-500" />
                                    Keluar
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
});

export default Header;
