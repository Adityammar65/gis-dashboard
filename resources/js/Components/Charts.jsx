import { memo, useMemo } from "react";
import { FaChartBar } from "react-icons/fa";

export const ChartCard = memo(function ChartCard({ title, subtitle, children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-5 shadow-sm max-md:p-4 ${className}`}>
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-night-200">{title}</h3>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-night-400">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    );
});

export const ChartEmpty = memo(function ChartEmpty({ title = "Belum ada data", hint = "Penyaring tidak menghasilkan data untuk grafik." }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-night-700 bg-gray-50/60 dark:bg-night-800/60 py-10 text-center">
            <FaChartBar className="mb-2 text-2xl text-gray-300 dark:text-night-600" />
            <p className="text-xs font-semibold text-gray-600 dark:text-night-300">{title}</p>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-night-500">{hint}</p>
        </div>
    );
});

export const DonutChart = memo(function DonutChart({ data = [] }) {
    const { total, segments } = useMemo(() => {
        const items = (Array.isArray(data) ? data : []).filter((d) => (d.value ?? 0) > 0);
        const total = items.reduce((s, d) => s + (d.value ?? 0), 0);
        let acc = 0;
        const R = 54;
        const C = 2 * Math.PI * R;
        const segments = items.map((d) => {
            const frac = total > 0 ? d.value / total : 0;
            const seg = { ...d, dash: `${frac * C} ${C}`, offset: -(acc * C), frac };
            acc += frac;
            return seg;
        });
        return { total, segments, C };
    }, [data]);

    if (total === 0) return <ChartEmpty />;

    return (
        <div className="flex items-center gap-5 max-sm:flex-col max-sm:gap-4">
            <div className="relative shrink-0">
                <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Grafik donat">
                    <circle cx="70" cy="70" r="54" fill="none" strokeWidth="18" className="stroke-gray-100 dark:stroke-night-800" />
                    {segments.map((s) => (
                        <circle
                            key={s.label}
                            cx="70"
                            cy="70"
                            r="54"
                            fill="none"
                            stroke={s.color}
                            strokeWidth="18"
                            strokeDasharray={s.dash}
                            strokeDashoffset={s.offset}
                            strokeLinecap="butt"
                            transform="rotate(-90 70 70)"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-800 dark:text-night-200">{total}</span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-night-500">Total</span>
                </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="min-w-0 flex-1 truncate font-medium text-gray-700 dark:text-night-200">{s.label}</span>
                        <span className="shrink-0 font-bold text-gray-800 dark:text-night-200">{s.value}</span>
                        <span className="w-10 shrink-0 text-right text-gray-400 dark:text-night-500">
                            {Math.round(s.frac * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export const GroupedBarChart = memo(function GroupedBarChart({ data = [], limit = 8 }) {
    const { items, max, others } = useMemo(() => {
        const rows = (Array.isArray(data) ? data : [])
            .map((d) => ({
                label: String(d.label ?? "Lainnya"),
                tiang: d.tiang ?? 0,
                ont: d.ont ?? 0,
                total: (d.tiang ?? 0) + (d.ont ?? 0),
            }))
            .filter((d) => d.total > 0)
            .sort((a, b) => b.total - a.total);
        const items = rows.slice(0, limit);
        const rest = rows.slice(limit);
        const others = rest.reduce((s, d) => s + d.total, 0);
        const max = items.reduce((m, d) => Math.max(m, d.tiang, d.ont), 0);
        return { items, max, others };
    }, [data, limit]);

    if (items.length === 0) return <ChartEmpty />;

    return (
        <div>
            <div className="mb-3 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-night-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#1e3a8a" }} />
                    Tiang
                </span>
                <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-night-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#0ea5e9" }} />
                    ONT
                </span>
            </div>
            <div className="space-y-3">
                {items.map((d) => (
                    <div key={d.label}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                            <span className="min-w-0 flex-1 truncate font-medium capitalize text-gray-700 dark:text-night-200" title={d.label}>
                                {d.label}
                            </span>
                            <span className="shrink-0 font-bold text-gray-800 dark:text-night-200">{d.total}</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-night-800">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: max > 0 ? `${Math.max(4, (d.tiang / max) * 100)}%` : "0%", background: "#1e3a8a" }}
                                    />
                                </div>
                                <span className="w-10 shrink-0 text-right text-[11px] text-gray-500 dark:text-night-400">{d.tiang}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-night-800">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: max > 0 ? `${Math.max(4, (d.ont / max) * 100)}%` : "0%", background: "#0ea5e9" }}
                                    />
                                </div>
                                <span className="w-10 shrink-0 text-right text-[11px] text-gray-500 dark:text-night-400">{d.ont}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {others > 0 && (
                <p className="mt-3 text-[11px] text-gray-400 dark:text-night-500">+ {others} data pada wilayah lainnya</p>
            )}
        </div>
    );
});

export const HBarChart = memo(function HBarChart({ data = [], limit = 8 }) {
    const { items, max, others } = useMemo(() => {
        const sorted = [...(Array.isArray(data) ? data : [])]
            .filter((d) => (d.value ?? 0) > 0)
            .sort((a, b) => b.value - a.value);
        const items = sorted.slice(0, limit);
        const rest = sorted.slice(limit);
        const others = rest.reduce((s, d) => s + (d.value ?? 0), 0);
        const max = items.length > 0 ? items[0].value : 0;
        return { items, max, others };
    }, [data, limit]);

    if (items.length === 0) return <ChartEmpty />;

    return (
        <div className="space-y-3">
            {items.map((d) => (
                <div key={d.label}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="min-w-0 flex-1 truncate font-medium capitalize text-gray-700 dark:text-night-200" title={d.label}>
                            {d.label}
                        </span>
                        <span className="shrink-0 font-bold text-gray-800 dark:text-night-200">{d.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-night-800">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: max > 0 ? `${Math.max(4, (d.value / max) * 100)}%` : "0%", background: d.color || "#AB3C3C" }}
                        />
                    </div>
                </div>
            ))}
            {others > 0 && (
                <p className="text-[11px] text-gray-400 dark:text-night-500">+ {others} data pada wilayah/kategori lainnya</p>
            )}
        </div>
    );
});
