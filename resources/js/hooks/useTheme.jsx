import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gis_theme";

function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") return saved;
    } catch { }
    return "light";
}

function applyTheme(theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
}

export function getStoredTheme() {
    return getInitialTheme();
}

export default function useTheme() {
    const [theme, setThemeState] = useState(getInitialTheme);
    const isDark = theme === "dark";

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
                setThemeState(e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const setTheme = useCallback((next) => {
        const value = next === "dark" ? "dark" : "light";
        setThemeState(value);
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch { }
        applyTheme(value);
    }, []);

    const toggle = useCallback(() => {
        setThemeState((prev) => {
            const value = prev === "dark" ? "light" : "dark";
            try {
                window.localStorage.setItem(STORAGE_KEY, value);
            } catch { }
            applyTheme(value);
            return value;
        });
    }, []);

    return { theme, isDark, setTheme, toggle };
}

export { STORAGE_KEY };
