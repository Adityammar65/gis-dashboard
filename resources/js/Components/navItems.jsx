import { FaWifi, FaMap } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { LuUtilityPole } from "react-icons/lu";
import { IoMdHome } from "react-icons/io";

export const LOGOUT_CONFIRM = "Kembali ke Halaman Login?";

export const menuItems = [
    {
        label: "Beranda",
        href: "home",
        icon: <IoMdHome size={20} />,
        activePaths: ["home"],
    },
    {
        label: "Data Tiang",
        href: "data-tiang",
        icon: <LuUtilityPole size={20} />,
        activePaths: ["data-tiang", "tambah-tiang", "edit-tiang", "detail-tiang"],
    },
    {
        label: "Data ONT",
        href: "data-ont",
        icon: <FaWifi size={20} />,
        activePaths: ["data-ont", "tambah-ont", "edit-ont", "detail-ont"],
    },
    {
        label: "Data Wilayah",
        href: "wilayah",
        icon: <FaMap size={20} />,
        activePaths: ["wilayah"],
    },
    {
        label: "Peta Sebaran Aset",
        href: "peta-sebaran-aset",
        icon: <FaLocationCrosshairs size={20} />,
        activePaths: ["peta-sebaran-aset"],
    },
];

export const isActivePath = (currentPath, paths) =>
    (paths || []).some((path) => currentPath === `/${path}` || currentPath.endsWith(`/${path}`));

export const isPengaturanPath = (currentPath) =>
    currentPath === "/pengaturan" || currentPath.endsWith("/pengaturan");

export const isNotifikasiPath = (currentPath) =>
    currentPath === "/notifikasi" ||
    currentPath.endsWith("/notifikasi") ||
    currentPath.endsWith("/detail-notifikasi");
