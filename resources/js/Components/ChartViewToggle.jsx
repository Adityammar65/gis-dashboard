import { memo } from "react";
import { FaTable, FaChartBar } from "react-icons/fa";
import useChartView from "../hooks/useChartView";

/**
 * Sakelar mode view data Simple/Detail.
 * variant="switch" -> kontrol segmented untuk halaman Pengaturan (mirip ThemeToggle).
 * variant="compact" -> pil kecil untuk header halaman (override lokal).
 */
const ChartViewToggle = memo(function ChartViewToggle({ variant = "switch", className = "", value, onChange }) {
    const global = useChartView();
    const view = value ?? global.view;
    const setView = onChange ?? global.setView;
    const isChart = view === "chart";

    if (variant === "compact") {
        return (
            <div
                role="radiogroup"
                aria-label="Pilih mode view data"
                className={`inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-night-800 ${className}`}
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={view === "table"}
                    onClick={() => setView("table")}
                    title="Tampilan simple"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        view === "table"
                            ? "bg-white text-gray-800 shadow-sm dark:bg-night-900 dark:text-night-200"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaTable size={12} />
                    <span className="max-sm:hidden">Simple</span>
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={view === "chart"}
                    onClick={() => setView("chart")}
                    title="Tampilan detail"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        view === "chart"
                            ? "bg-white text-gray-800 shadow-sm dark:bg-night-900 dark:text-night-200"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaChartBar size={12} />
                    <span className="max-sm:hidden">Detail</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div
                role="radiogroup"
                aria-label="Pilih mode view data"
                className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-night-800"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={view === "table"}
                    onClick={() => setView("table")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        view === "table"
                            ? "bg-white text-gray-800 shadow-md dark:bg-night-900 dark:text-night-200"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaTable size={14} />
                    Simple
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={view === "chart"}
                    onClick={() => setView("chart")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        view === "chart"
                            ? "bg-white text-gray-800 shadow-md dark:bg-night-900 dark:text-night-200"
                            : "text-gray-500 hover:text-gray-700 dark:text-night-400 dark:hover:text-night-200"
                    }`}
                >
                    <FaChartBar size={14} />
                    Detail
                </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-night-400">
                {isChart
                    ? "Mode detail aktif. Pilihan tersimpan di perangkat ini."
                    : "Mode simple aktif. Pilihan tersimpan di perangkat ini."}
            </p>
        </div>
    );
});

export default ChartViewToggle;
