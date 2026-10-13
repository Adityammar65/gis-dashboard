import { memo } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "../hooks/useTheme";

/**
 * Sakelar tema Terang/Gelap.
 * variant="switch" -> kontrol segmented untuk halaman Pengaturan.
 * variant="button" -> tombol ikon ringkas (legacy header, dipertahankan untuk kompatibilitas).
 * variant="login" -> ikon kecil untuk halaman login ( di atas kartu terang maupun gelap ).
 */
const ThemeToggle = memo(function ThemeToggle({ variant = "switch", className = "" }) {
    const { theme, setTheme, toggle, isDark } = useTheme();

    if (variant === "login") {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label={isDark ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
                title={isDark ? "Mode terang" : "Mode gelap"}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700 dark:border-night-700 dark:bg-night-900 dark:text-night-400 dark:hover:bg-night-800 dark:hover:text-night-200 ${className}`}
            >
                {isDark ? <FaSun size={16} /> : <FaMoon size={14} />}
            </button>
        );
    }

    if (variant === "button") {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label={isDark ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
                title={isDark ? "Mode terang" : "Mode gelap"}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 ${className}`}
            >
                {isDark ? <FaSun size={18} /> : <FaMoon size={16} />}
            </button>
        );
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div
                role="radiogroup"
                aria-label="Pilih tema tampilan"
                className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-night-800"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={theme === "light"}
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        theme === "light"
                            ? "bg-white text-gray-800 shadow-md dark:bg-night-900 dark:text-night-200"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaSun size={14} />
                    Terang
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        theme === "dark"
                            ? "bg-night-900 text-white shadow-md dark:bg-night-950 dark:ring-1 dark:ring-night-700"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaMoon size={14} />
                    Gelap
                </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-night-400">
                {isDark
                    ? "Mode gelap aktif. Pilihan tersimpan di perangkat ini."
                    : "Mode terang aktif. Pilihan tersimpan di perangkat ini."}
            </p>
        </div>
    );
});

export default ThemeToggle;
