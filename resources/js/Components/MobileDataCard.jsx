/* Kartu Mobile */

export default function MobileDataCard({
    title,
    subtitle,
    imageSrc,
    imageAlt = "Foto aset",
    fallbackLabel = "Belum ada foto",
    status,
    meta = [],
    actions = null,
}) {
    const statusLower = String(status || "").toLowerCase();
    const statusColor =
        statusLower === "aktif"
            ? "bg-green-500"
            : statusLower === "nonaktif"
                ? "bg-red-500"
                : "bg-gray-400";

    return (
        <div className="gis-mobile-card rounded-2xl border border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-night-800 ring-1 ring-gray-200 dark:ring-night-700">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={imageAlt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <span className="px-1 text-center text-[10px] text-gray-400 dark:text-night-500">
                            {fallbackLabel}
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold capitalize text-gray-800 dark:text-night-200">
                        {title || "Belum ada data"}
                    </p>
                    {subtitle && (
                        <p className="mt-0.5 truncate text-xs capitalize text-gray-500 dark:text-night-400">
                            {subtitle}
                        </p>
                    )}
                    {status ? (
                        <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium capitalize text-white shadow-sm ring-1 ring-white/20 ${statusColor}`}
                        >
                            {status}
                        </span>
                    ) : null}
                </div>
            </div>

            {meta.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-night-700 pt-3 text-xs">
                    {meta.map((m, i) => (
                        <div key={i} className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-night-500">
                                {m.label}
                            </p>
                            <p className="mt-0.5 truncate capitalize text-gray-700 dark:text-night-200">
                                {m.value || "-"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {actions && (
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 dark:border-night-700 pt-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
