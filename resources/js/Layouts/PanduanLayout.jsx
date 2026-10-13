import { useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { router, usePage } from "@inertiajs/react";

export default function PanduanLayout({ children }) {
    const { auth } = usePage().props;

    const kembali = useCallback(() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
            return;
        }
        router.get(auth?.username ? "home" : "login");
    }, [auth]);

    return (
        <div className="min-h-screen bg-[#F6F4F4] font-poppins text-gray-900 transition-colors duration-200 dark:bg-night-950 dark:text-night-200">
            <div className="sticky top-0 z-40 border-b border-[#AB3C3C]/20 bg-gradient-to-br from-[#6F2424] to-[#AB3C3C] text-white shadow-md">
                <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3 max-md:px-3 max-md:py-2.5">
                    <button
                        type="button"
                        onClick={kembali}
                        aria-label="Kembali ke halaman sebelumnya"
                        title="Kembali"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-wide max-md:text-[13px]">
                            Panduan Penggunaan
                        </p>
                        <p className="truncate text-xs font-light opacity-90 max-md:text-[11px]">
                            Fungsi tiap halaman dan cara menggunakannya
                        </p>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 max-md:px-3 max-md:py-4">
                {children}
            </main>
        </div>
    );
}
