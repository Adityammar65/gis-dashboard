import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { FaMapMarkerAlt, FaSearch, FaSpinner } from "react-icons/fa";
import { buildTypeIcon, parseCoord } from "./mapMarker";

const DEFAULT_CENTER = [-7.717, 110.355];

function ClickSetter({ onPick }) {
    const map = useMap();
    useEffect(() => {
        const handler = (e) => onPick(e.latlng.lat, e.latlng.lng);
        map.on("click", handler);
        return () => map.off("click", handler);
    }, [map, onPick]);
    return null;
}

function FlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 16, { duration: 0.8 });
    }, [map, center]);
    return null;
}

export default function LocationPicker({ latitude, longitude, onChange, type = "tiang", status = null }) {
    const lat = parseCoord(latitude);
    const lng = parseCoord(longitude);
    const hasPos = lat !== null && lng !== null;
    const initialPos = hasPos ? [lat, lng] : DEFAULT_CENTER;
    const [pendingPos, setPendingPos] = useState(initialPos);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchNote, setSearchNote] = useState("");
    const timer = useRef(null);
    const cache = useRef(new Map());

    useEffect(() => {
        if (hasPos) setPendingPos([lat, lng]);
    }, [lat, lng]);

    const emit = (la, ln) => {
        onChange?.(Number(la.toFixed(6)), Number(ln.toFixed(6)));
    };

    const doSearch = async (q) => {
        const key = q.trim().toLowerCase();
        if (!key || key.length < 3) {
            setResults([]);
            setSearchNote("");
            return;
        }
        if (cache.current.has(key)) {
            setResults(cache.current.get(key));
            setSearchNote("");
            setOpen(true);
            return;
        }
        setSearching(true);
        setSearchNote("");
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=id&q=${encodeURIComponent(q)}`,
                { headers: { Accept: "application/json" } }
            );
            if (res.status === 429) {
                setResults([]);
                setSearchNote("Lagi banyak yang mencari, coba lagi sebentar ya…");
                setOpen(true);
                return;
            }
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            if (cache.current.size > 50) cache.current.clear();
            cache.current.set(key, list);
            setResults(list);
            setSearchNote(list.length === 0 ? "Alamat tidak ketemu, coba kata kunci lain atau klik langsung di peta ya." : "");
            setOpen(true);
        } catch {
            setResults([]);
            setSearchNote("Koneksi pencarian lagi bermasalah, coba lagi sebentar ya.");
            setOpen(true);
        } finally {
            setSearching(false);
        }
    };

    const onQueryChange = (v) => {
        setQuery(v);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => doSearch(v), 500);
    };

    useEffect(() => () => timer.current && clearTimeout(timer.current), []);

    const flyTarget = useMemo(() => pendingPos, [pendingPos]);

    const markerIcon = useMemo(() => buildTypeIcon(type), [type]);

    return (
        <div className="relative z-0 isolate space-y-2">
            <div className="relative z-20">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-night-500" size={13} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    placeholder="Cari alamat… cth: Malioboro, Sleman"
                    className="w-full rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 py-2.5 pl-9 pr-9 text-sm text-gray-900 dark:text-night-200 outline-none focus:border-[#AB3C3C] focus:ring-2 focus:ring-[#AB3C3C]/10 transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-night-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-night-500">
                    {searching ? <FaSpinner className="animate-spin" size={13} /> : null}
                </span>
                {open && (results.length > 0 || searchNote) && (
                    <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 dark:border-night-700 bg-white dark:bg-night-900 shadow-lg">
                        {searchNote && results.length === 0 && (
                            <li className="px-3 py-2 text-xs text-gray-500 dark:text-night-400">{searchNote}</li>
                        )}
                        {results.map((r) => (
                            <li key={r.place_id}>
                                <button
                                    type="button"
                                    onMouseDown={() => {
                                        setPendingPos([parseFloat(r.lat), parseFloat(r.lon)]);
                                        setQuery(r.display_name.split(",").slice(0, 2).join(","));
                                        setOpen(false);
                                    }}
                                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-night-800"
                                >
                                    <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#AB3C3C]" size={12} />
                                    <span className="line-clamp-2 text-gray-700 dark:text-night-200">{r.display_name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="relative z-0 isolate overflow-hidden rounded-xl border border-gray-200 dark:border-night-700 shadow-sm">
                <MapContainer center={initialPos} zoom={hasPos ? 16 : 12} scrollWheelZoom={true} className="relative z-0 h-[300px] w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />
                    <ClickSetter onPick={(la, ln) => setPendingPos([la, ln])} />
                    <FlyTo center={flyTarget} />
                    <Marker
                        position={pendingPos}
                        icon={markerIcon}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const p = e.target.getLatLng();
                                setPendingPos([p.lat, p.lng]);
                            },
                        }}
                    />
                </MapContainer>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => emit(pendingPos[0], pendingPos[1])}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-night-600 bg-white dark:bg-night-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-night-200 shadow-sm hover:bg-gray-50 dark:hover:bg-night-700"
                >
                    <FaMapMarkerAlt size={12} />
                    Tentukan Lokasi
                </button>
                <span className="rounded-lg bg-gray-50 dark:bg-night-800/60 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-night-300 ring-1 ring-gray-200 dark:ring-night-700">
                    {`${pendingPos[0].toFixed(6)}, ${pendingPos[1].toFixed(6)}`}
                </span>
            </div>
            {searchNote && (
                <p className="text-xs text-gray-500 dark:text-night-400">{searchNote}</p>
            )}
        </div>
    );
}
