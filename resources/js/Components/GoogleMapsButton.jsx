import { useMemo } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function GoogleMapsButton({
    latitude,
    longitude,
    label = "Buka di Google Maps",
    className = "",
}) {
    const gmapsUrl = useMemo(() => {
        const parse = (v) => {
            if (v === null || v === undefined || v === "") return null;
            const n = parseFloat(String(v).trim().replace(",", "."));
            if (isNaN(n) || !isFinite(n)) return null;
            return n;
        };
        const lat = parse(latitude);
        const lng = parse(longitude);
        if (lat === null || lng === null) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }, [latitude, longitude]);

    const baseClass =
        "flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium ring-1 transition active:scale-[0.98] max-sm:w-full max-sm:justify-center";

    if (!gmapsUrl) {
        return (
            <button
                type="button"
                disabled
                title="Koordinat tidak tersedia"
                aria-disabled="true"
                className={`${baseClass} cursor-not-allowed bg-gray-50 dark:bg-night-800/60 text-gray-400 dark:text-night-500 ring-gray-200 dark:ring-night-700 opacity-60 ${className}`.trim()}
            >
                <FaExternalLinkAlt />
                {label}
            </button>
        );
    }

    return (
        <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className={`${baseClass} bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:shadow-sm ${className}`.trim()}
        >
            <FaExternalLinkAlt />
            {label}
        </a>
    );
}
