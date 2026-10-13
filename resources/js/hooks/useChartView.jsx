import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gis_view_mode";

function getInitialView() {
    if (typeof window === "undefined") return "table";
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "chart" || saved === "table") return saved;
    } catch { }
    return "table";
}

export function getStoredView() {
    return getInitialView();
}

export default function useChartView() {
    const [view, setViewState] = useState(getInitialView);
    const isChart = view === "chart";

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY && (e.newValue === "chart" || e.newValue === "table")) {
                setViewState(e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const setView = useCallback((next) => {
        const value = next === "chart" ? "chart" : "table";
        setViewState(value);
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch { }
    }, []);

    const toggle = useCallback(() => {
        setViewState((prev) => {
            const value = prev === "chart" ? "table" : "chart";
            try {
                window.localStorage.setItem(STORAGE_KEY, value);
            } catch { }
            return value;
        });
    }, []);

    return { view, isChart, setView, toggle };
}

export { STORAGE_KEY };
