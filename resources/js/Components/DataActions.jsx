import { FaEye, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export const hapusHref = (base, type, id) => `${base}/hapus-${type}/${id}`.replace(/\/+/g, "/");

export function confirmHapus(nama, label) {
    return window.confirm(`Apakah kamu yakin ingin menghapus ${nama} ${label || ""}?`.trim());
}

// Table Actions

export function TableActions({ type = "tiang", id, kode = "", base = "", detailHref = "#", editHref = "#" }) {
    const nama = type === "ont" ? "ont" : "tiang";
    return (
        <div className="flex items-center gap-1.5">
            <a
                href={detailHref}
                className="rounded-lg bg-blue-500 px-2 py-1.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/10 transition hover:bg-blue-600 hover:shadow"
            >
                <FaEye className="text-[16px]" />
            </a>

            <a
                href={editHref}
                className="rounded-lg bg-amber-400 px-2 py-1.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/10 transition hover:bg-amber-500 hover:shadow"
            >
                <FaEdit className="text-[16px]" />
            </a>

            <button
                type="button"
                onClick={() => {
                    if (confirmHapus(`data ${nama}`, kode)) {
                        window.location.href = hapusHref(base, nama, id);
                    }
                }}
                className="rounded-lg bg-red-500 px-2 py-1.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/10 transition hover:bg-red-600 hover:shadow"
                title="Hapus Data"
            >
                <MdDelete className="text-[16px]" />
            </button>
        </div>
    );
}

// Mobile Card Action

export function CardActions({ type = "tiang", id, kode = "", base = "", detailHref = "#", editHref = "#" }) {
    const nama = type === "ont" ? "ont" : "tiang";
    return (
        <>
            <a
                href={detailHref}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-500 px-2 py-2 text-xs font-medium text-white"
            >
                <FaEye className="text-[14px]" /> Detail
            </a>
            <a
                href={editHref}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-amber-400 px-2 py-2 text-xs font-medium text-white"
            >
                <FaEdit className="text-[14px]" /> Edit
            </a>
            <button
                type="button"
                onClick={() => {
                    if (confirmHapus(`data ${nama}`, kode)) {
                        window.location.href = hapusHref(base, nama, id);
                    }
                }}
                title="Hapus Data"
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500 px-2 py-2 text-xs font-medium text-white"
            >
                <MdDelete className="text-[14px]" /> Hapus
            </button>
        </>
    );
}

// Tombol hapus

export function TableDelete({ type = "wilayah", id, name = "", base = "", title = "Hapus Data", confirmText = null }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (window.confirm(confirmText ?? `Apakah kamu yakin ingin menghapus ${type} ${name}?`.trim())) {
                    window.location.href = hapusHref(base, type, id);
                }
            }}
            className="rounded-lg bg-red-500 px-2 py-1.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/10 transition hover:bg-red-600 hover:shadow"
            title={title}
        >
            <MdDelete className="text-[16px]" />
        </button>
    );
}

// Tombol hapus mobile

export function CardDelete({ type = "wilayah", id, name = "", base = "", confirmText = null }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (window.confirm(confirmText ?? `Apakah kamu yakin ingin menghapus ${type} ${name}?`.trim())) {
                    window.location.href = hapusHref(base, type, id);
                }
            }}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500 px-2 py-2 text-xs font-medium text-white"
        >
            <MdDelete className="text-[14px]" /> Hapus
        </button>
    );
}

// Keadaan kosong tabel desktop

export function TableEmpty({ colSpan = 9, icon: Icon, title = "Belum ada data", hint = "" }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-night-800">
                        {Icon ? <Icon className="text-xl text-gray-400 dark:text-night-500" /> : null}
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-night-400">{title}</p>
                    {hint ? <p className="text-xs text-gray-400 dark:text-night-500">{hint}</p> : null}
                </div>
            </td>
        </tr>
    );
}

// Keadaan card kosong mobile

export function CardEmpty({ title = "Belum ada data" }) {
    return (
        <p className="rounded-xl border border-dashed border-gray-200 dark:border-night-700 bg-gray-50/60 dark:bg-night-800/60 py-8 text-center text-xs text-gray-400 dark:text-night-500">
            {title}
        </p>
    );
}
