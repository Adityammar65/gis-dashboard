import PanduanLayout from "../Layouts/PanduanLayout";

const BAGIAN = [
    {
        id: "masuk",
        judul: "Masuk & Akun",
        fungsi: "Masuk untuk mengakses seluruh fitur. Akun bawaan: admin / password.",
        langkah: [
            "Isi Username dan Password, lalu tekan Masuk.",
            "Centang Ingat Saya agar tetap masuk otomatis di perangkat ini selama 30 hari.",
            "Lupa kata sandi? Ajukan lewat tautan di bawah form, berlaku setelah disetujui admin.",
        ],
    },
    {
        id: "beranda",
        judul: "Beranda",
        fungsi: "Ringkasan angka aset, peta pratinjau wilayah operasi, dan 5 pembaruan terbaru.",
        langkah: [
            "Baca 4 kartu: total Tiang, total ONT (rincian Aktif/Nonaktif), cakupan wilayah, dan persentase berkoordinat.",
            "Bila muncul ajakan memilih wilayah, tentukan dulu wilayah operasi di Pengaturan.",
        ],
    },
    {
        id: "data",
        judul: "Data Tiang & Data ONT",
        fungsi: "Tabel 15 baris per halaman untuk melihat, menambah, mengubah, menghapus, dan mengekspor aset.",
        langkah: [
            "Saring dengan wilayah, status, kecamatan, kelurahan, atau kolom pencarian.",
            "Tambah: kode terisi otomatis (SIMS-kode-wilayah-nomor); isi area, deskripsi, koordinat via klik peta atau pencarian alamat, 5 foto, petugas, dan status.",
            "Ubah: foto tiap slot bisa dibiarkan, diganti, atau dikosongkan.",
            "Hapus: konfirmasi dialog; data dan fotonya terhapus permanen.",
            "Ekspor PDF/Excel mengikuti penyaring aktif: halaman ini atau semua data.",
        ],
    },
    {
        id: "wilayah",
        judul: "Data Wilayah",
        fungsi: "Rekapitulasi per wilayah serta pendaftaran wilayah baru.",
        langkah: [
            "Tiap baris menampilkan total Tiang, ONT, aset, aktif, dan nonaktif.",
            "Tambah wilayah dengan nama dan kode yang unik.",
            "Wilayah yang masih punya aset tidak dapat dihapus.",
        ],
    },
    {
        id: "peta",
        judul: "Peta Sebaran Aset",
        fungsi: "Lokasi seluruh aset berkoordinat pada peta layar penuh.",
        langkah: [
            "Saring jenis (Tiang/ONT), status (hijau = Aktif, merah = Nonaktif), dan wilayah.",
            "Klik pin untuk ringkasan dan tautan detail; gunakan tombol Buka di Google Maps pada halaman detail.",
        ],
    },
    {
        id: "notifikasi",
        judul: "Notifikasi",
        fungsi: "Pemberitahuan tiap tambah/ubah/hapus data dan tiap permintaan reset akun.",
        langkah: [
            "Baris berpenanda merah berarti belum dibaca; otomatis terbaca saat detailnya dibuka.",
            "Setujui/tolak permintaan reset langsung dari Detail Notifikasi terkait.",
            "Gunakan Tandai semua dibaca dan Hapus yang dibaca untuk merapikan daftar.",
        ],
    },
    {
        id: "pengaturan",
        judul: "Pengaturan",
        fungsi: "Wilayah operasi, profil akun, persetujuan reset, dan tema tampilan.",
        langkah: [
            "Pilih wilayah operasi — memengaruhi Beranda, awalan kode aset, dan acuan kecamatan.",
            "Ubah username/kata sandi hanya berlaku setelah disetujui admin lain.",
            "Tema Terang/Gelap tersimpan di perangkat ini saja.",
        ],
    },
];

export default function Panduan() {
    return (
        <PanduanLayout>
            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-night-700 dark:bg-night-900 max-md:p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-night-200">
                        Daftar Isi
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {BAGIAN.map((b) => (
                            <a
                                key={b.id}
                                href={`#${b.id}`}
                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-[#F3DADA] hover:text-[#AB3C3C] dark:bg-night-800 dark:text-night-200 dark:hover:bg-night-700"
                            >
                                {b.judul}
                            </a>
                        ))}
                    </div>
                </div>

                {BAGIAN.map((b) => (
                    <section
                        key={b.id}
                        id={b.id}
                        className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-night-700 dark:bg-night-900 max-md:p-4"
                    >
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-night-200">
                            {b.judul}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-night-300">
                            {b.fungsi}
                        </p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-gray-600 dark:text-night-300">
                            {b.langkah.map((s) => (
                                <li key={s}>{s}</li>
                            ))}
                        </ol>
                    </section>
                ))}
            </div>
        </PanduanLayout>
    );
}
