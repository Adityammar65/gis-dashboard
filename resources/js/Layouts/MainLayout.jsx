import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { Header, Sidebar, MobileDrawer } from "../Components";
import { FiX } from "react-icons/fi";
import { usePage } from "@inertiajs/react";

export const LayoutErrorContext = createContext(null);

export function useLayoutError() {
    const ctx = useContext(LayoutErrorContext);
    if (!ctx) {
        throw new Error("useLayoutError must be used within <MainLayout>");
    }
    return ctx;
}

export default function MainLayout({ children, errorMessage }) {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) return false;
        return true;
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    const { url } = usePage();
    const { errors, flash } = usePage().props;

    const showError = useCallback((msg) => {
        if (!msg) return;

        if (Array.isArray(msg)) msg = msg[0];
        else if (typeof msg === "object") {
            const vals = Object.values(msg);
            msg = vals[0];
            if (Array.isArray(msg)) msg = msg[0];
        }
        setDismissed(false);
        setLocalError(String(msg));
    }, []);

    const clearError = useCallback(() => {
        setLocalError(null);
        setDismissed(true);
    }, []);

    useEffect(() => {
        if (errors || flash?.error || flash?.message || flash?.success || errorMessage) {
            setDismissed(false);
        }
    }, [errors, flash, errorMessage]);

    useEffect(() => {
        setDrawerOpen(false);
    }, [url]);

    useEffect(() => {
        const handler = (e) => showError(e.detail);
        window.addEventListener("layout:error", handler);
        return () => window.removeEventListener("layout:error", handler);
    }, [showError]);

    useEffect(() => {
        if (!localError) return;
        const t = setTimeout(() => setLocalError(null), 3000);
        return () => clearTimeout(t);
    }, [localError]);

    const inertiaError = Object.values(errors || {})?.[0];
    const flashError = flash?.error || flash?.message || null;
    const flashSuccess = flash?.success || null;

    const resolvedError = dismissed
        ? localError
        : errorMessage || localError || inertiaError || flashError || null;

    const displayError = Array.isArray(resolvedError)
        ? resolvedError[0]
        : resolvedError;

    useEffect(() => {
        if (!displayError) return;
        const t = setTimeout(() => {
            clearError();
        }, 3000);
        return () => clearTimeout(t);
    }, [displayError, clearError]);

    useEffect(() => {
        if (!flashSuccess || dismissed || displayError) return;
        const t = setTimeout(() => setDismissed(true), 3000);
        return () => clearTimeout(t);
    }, [flashSuccess, dismissed, displayError]);

    return (
        <LayoutErrorContext.Provider value={{ error: displayError, showError, setError: showError, clearError }}>
            <div className="relative min-h-screen bg-[#F6F4F4] font-poppins text-gray-900 transition-colors duration-200 max-md:overflow-x-clip dark:bg-night-950 dark:text-night-200">
                {displayError && (
                    <div className="fixed left-1/2 top-5 z-[99999] -translate-x-1/2 max-md:w-[calc(100vw-2rem)] max-md:max-w-md">
                        <div className="flex items-center gap-3 rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white shadow-lg">
                            <span>{displayError}</span>
                            <button
                                type="button"
                                onClick={clearError}
                                className="rounded p-0.5 hover:bg-white/20"
                                aria-label="Close error"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {!displayError && !dismissed && flashSuccess && (
                    <div className="fixed left-1/2 top-5 z-[99999] -translate-x-1/2 max-md:w-[calc(100vw-2rem)] max-md:max-w-md">
                        <div className="flex items-center gap-3 rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white shadow-lg">
                            <span>{flashSuccess}</span>
                            <button
                                type="button"
                                onClick={clearError}
                                className="rounded p-0.5 hover:bg-white/20"
                                aria-label="Close success"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Sidebar */}

                <div className="max-md:hidden">
                    <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
                </div>

                {/* Mobile Drawer */}

                <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

                {/* Header */}

                <Header onMenu={() => setDrawerOpen(true)} />

                {/* Isi */}

                <main
                    className={`min-h-[calc(100vh-72px)] bg-[#F6F4F4] p-6
                    transition-all duration-300 dark:bg-night-950
                    max-md:p-4 max-md:min-w-0 max-md:ml-0 max-md:min-h-[calc(100vh-60px)]
                    ${isOpen ? "ml-64" : "ml-20"}`}
                >
                    {children}
                </main>
            </div>
        </LayoutErrorContext.Provider>
    );
}
