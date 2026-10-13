import { useMemo, useCallback } from "react";

// Single source of truth for first-segment routes (lowercased).
// Must cover every entry in routes/web.php so the subfolder detector
// never mistakes a real route (e.g. tambah-wilayah) for a base prefix.
export const KNOWN_ROUTES = [
    "home",
    "data-tiang",
    "data-ont",
    "wilayah",
    "peta-sebaran-aset",
    "peta",
    "tambah-tiang",
    "tambah-ont",
    "tambah-wilayah",
    "edit-tiang",
    "edit-ont",
    "detail-tiang",
    "detail-ont",
    "detail-notifikasi",
    "notifikasi",
    "pengaturan",
    "panduan",
    "login",
    "logout",
    "lupa-password",
    "proses-login",
    "reset-request",
    "reset-requests",
    "simpan-tiang",
    "simpan-ont",
    "simpan-wilayah",
    "update-tiang",
    "update-ont",
    "update-pengaturan",
    "update-profil",
    "hapus-tiang",
    "hapus-ont",
    "hapus-wilayah",
    "export",
    "api",
];

// Non-hook version: safe to call inside fetch callbacks / event handlers.
export function getBase() {
    if (typeof window === "undefined") return "";
    const seg = window.location.pathname.split("/").filter(Boolean)[0];
    if (!seg) return "";
    if (KNOWN_ROUTES.includes(seg.toLowerCase())) return "";
    return `/${seg}`;
}

export function resolvePath(href = "") {
    return `${getBase()}/${href}`.replace(/\/+/g, "/");
}

export function asset(path = "") {
    return `${getBase()}/${path}`.replace(/\/+/g, "/");
}

// Modular routing hook, same API other pages already use:
//   const base = useBase();
//   const resolveHref = useResolveHref();
export default function useBase() {
    return useMemo(() => getBase(), []);
}

export function useResolveHref() {
    const base = useBase();
    return useCallback((href = "") => `${base}/${href}`.replace(/\/+/g, "/"), [base]);
}
