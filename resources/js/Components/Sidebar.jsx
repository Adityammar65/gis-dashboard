import { memo, useMemo } from "react";
import { IoIosLogOut, IoIosSettings } from "react-icons/io";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePage } from "@inertiajs/react";
import { menuItems, isActivePath, isPengaturanPath, LOGOUT_CONFIRM } from "./navItems";
import { useResolveHref } from "../hooks/useBase";

const Sidebar = memo(function Sidebar({ isOpen, onToggle }) {
    const { url } = usePage();
    const currentPath = useMemo(() => url.split('?')[0], [url]);
    const resolveHref = useResolveHref();

    const confirmLogout = (e) => {
        if (!confirm(LOGOUT_CONFIRM)) {
            e.preventDefault();
        }
    };

    return (
        <aside
            className={`
                gis-rail
                fixed h-screen top-15 left-0 z-40
                bg-slate-100 dark:bg-night-900 dark:border-r dark:border-night-700
                transition-all duration-300
                ${isOpen ? "w-64" : "w-20"}
            `}
        >

            {/* Navigasi */}

            <nav className="relative z-10 space-y-2 px-3 py-5">

                {/* Atas */}

                <div className="contents">

                    {menuItems.map((item) => {
                        const isActive = isActivePath(currentPath, item.activePaths);

                        return (
                            <div
                                key={item.href}
                                className={`
                                group relative flex items-center gap-3
                                rounded-xl px-3 py-3
                                text-sm font-medium
                                cursor-pointer
                                transition-all duration-200
                                ${isActive
                                        ? "bg-[#AB3C3C] text-white shadow-md shadow-[#AB3C3C]/20"
                                        : "text-[#992e2e] hover:bg-[#F3DADA] hover:text-[#AB3C3C] dark:text-night-300 dark:hover:bg-night-800 dark:hover:text-white"
                                    }
                                ${!isOpen ? "justify-center" : ""}
                            `}
                            >

                                {/* Penanda */}

                                {isActive && (
                                    <span
                                        className="
                                        absolute left-0
                                        h-7 w-1
                                        rounded-r-full
                                        bg-white
                                    "
                                    />
                                )}

                                <span
                                    className="
                                    shrink-0
                                    transition-transform duration-200
                                    group-hover:scale-110
                                "
                                >
                                    {item.icon}
                                </span>

                                {isOpen && (
                                    <a
                                        href={resolveHref(item.href)}
                                        className="flex-1 whitespace-nowrap"
                                    >
                                        {item.label}
                                    </a>
                                )}
                            </div>
                        );
                    })}

                    {/* Pemisah + Alihan (selalu sejajar) */}

                    <div className="relative overflow-visible py-2">
                        <hr className="border-0 border-t-2 border-[#AB3C3C]/50 rounded-full dark:border-night-700" />
                        {onToggle && (
                            <button
                                type="button"
                                onClick={onToggle}
                                aria-label={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
                                aria-expanded={isOpen}
                                title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
                                className="
                                absolute left-full top-1/2 z-20
                                -ml-1 flex h-8 w-8 -translate-y-1/2
                                items-center justify-center
                                rounded-full bg-[#ab3c3c] text-white shadow-lg
                                transition-all duration-300
                                hover:scale-105 hover:bg-[#8f3030]
                            "
                            >
                                {isOpen ? (
                                    <FiChevronLeft size={20} />
                                ) : (
                                    <FiChevronRight size={20} />
                                )}
                            </button>
                        )}
                    </div>

                </div>

                {/* Bawah */}

                <div className="contents">

                    {/* Pengaturan */}

                    <div
                        className={`
        group flex items-center gap-3
        rounded-xl px-3 py-3
        text-sm font-medium
        cursor-pointer
        transition-all duration-200
        ${isPengaturanPath(currentPath)
                                ? "bg-[#AB3C3C] text-white shadow-md shadow-[#AB3C3C]/20"
                                : "text-[#992e2e] hover:bg-[#F3DADA] hover:text-[#AB3C3C] dark:text-night-300 dark:hover:bg-night-800 dark:hover:text-white"
                            }
        ${!isOpen ? "justify-center" : ""}
    `}
                    >
                        {isPengaturanPath(currentPath) && (
                            <span
                                className="
                absolute left-0
                h-7 w-1
                rounded-r-full
                bg-white
            "
                            />
                        )}

                        <IoIosSettings
                            size={20}
                            className="
            shrink-0
            transition-transform duration-200
            group-hover:rotate-45
        "
                        />

                        {isOpen && (
                            <a
                                href={resolveHref("pengaturan")}
                                className="flex-1 whitespace-nowrap"
                            >
                                Pengaturan
                            </a>
                        )}
                    </div>

                    {/* Keluar */}

                    <div
                        className="
                        group flex items-center gap-3
                        rounded-xl px-3 py-3
                        text-sm font-medium
                        text-[#992e2e] dark:text-night-300
                        cursor-pointer
                        transition-all duration-200
                        hover:bg-[#F3DADA]
                        hover:text-[#AB3C3C]
                        dark:hover:bg-night-800 dark:hover:text-white
                    "
                    >
                        <IoIosLogOut
                            size={20}
                            className="
                            shrink-0
                            transition-transform duration-200
                            group-hover:translate-x-1
                        "
                        />

                        {isOpen && (
                            <a
                                href={resolveHref("logout")}
                                className="flex-1"
                                onClick={confirmLogout}
                            >
                                Keluar
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            <div
                className="
                    pointer-events-none
                    absolute bottom-0 left-0
                    h-72 w-full
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute -bottom-20 -left-24
                        h-52 w-80
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />

                <div
                    className="
                        absolute -bottom-16 -left-20
                        h-48 w-72
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />

                <div
                    className="
                        absolute -bottom-12 -left-16
                        h-44 w-64
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />

                <div
                    className="
                        absolute -bottom-8 -left-12
                        h-40 w-56
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />

                <div
                    className="
                        absolute bottom-0 -left-8
                        h-32 w-48
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />

                <div
                    className="
                        absolute bottom-8 left-10
                        h-20 w-32
                        rounded-[50%]
                        border-2 border-[#AB3C3C]/10
                        rotate-[-18deg]
                    "
                />
            </div>
        </aside>
    );
});

export default Sidebar;
