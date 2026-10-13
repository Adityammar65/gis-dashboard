import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { memo, useMemo, useEffect, useState } from "react";
import { buildDivIcon, parseCoord, isValidLatLng } from "./mapMarker";
import useTheme from "../hooks/useTheme";
import useBase from "../hooks/useBase";

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 1) {
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
        } else if (points.length === 1) {
            map.setView(points[0], Math.max(map.getZoom(), 13));
        }
    }, [map, points]);
    return null;
}

function RecenterWilayah({ wilayah, wilayahCenter }) {
    const map = useMap();
    useEffect(() => {
        if (wilayah && wilayah !== "Semua" && Array.isArray(wilayahCenter) && wilayahCenter.length === 2) {
            const lat = parseFloat(wilayahCenter[0]);
            const lng = parseFloat(wilayahCenter[1]);
            if (!isNaN(lat) && !isNaN(lng) && isValidLatLng(lat, lng)) {
                map.flyTo([lat, lng], 14, { duration: 1.0 });
            }
        }
    }, [wilayah, wilayahCenter, map]);
    return null;
}

// Koordinat

function LiveCoords() {
    const map = useMap();
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        const onMouseMove = (e) => {
            setCoords([e.latlng.lat, e.latlng.lng]);
        };
        const onMove = () => {
            const c = map.getCenter();
            setCoords((prev) => prev ?? [c.lat, c.lng]);
        };
        map.on("mousemove", onMouseMove);
        map.on("move", onMove);
        const c = map.getCenter();
        setCoords([c.lat, c.lng]);
        return () => {
            map.off("mousemove", onMouseMove);
            map.off("move", onMove);
        };
    }, [map]);

    if (!coords) return null;
    return (
        <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: "none" }}>
            <div className="leaflet-control leaflet-bar !m-0 !border-0 !bg-transparent !shadow-none" style={{ marginLeft: 12, marginBottom: 12 }}>
                <div className="rounded-md bg-white/90 px-3 py-1.5 text-[11px] font-medium text-gray-800 shadow backdrop-blur-sm border border-gray-200 dark:bg-night-900/90 dark:text-night-200 dark:border-night-700">
                    {coords[0].toFixed(6)} | {coords[1].toFixed(6)}
                </div>
            </div>
        </div>
    );
}

const MapView = memo(function MapView({ latitude, longitude, markers = null, wilayah = "Semua", wilayahCenter = null, type = null, status = null }) {
    const { isDark } = useTheme();
    const singlePosition = useMemo(() => {
        const lat = parseCoord(latitude);
        const lng = parseCoord(longitude);
        if (isValidLatLng(lat, lng)) return [lat, lng];
        return [-7.7956, 110.3695];
    }, [latitude, longitude]);

    const singleIcon = useMemo(() => {
        const t = String(type || "").toLowerCase() === "ont" ? "ont" : "tiang";
        const s = String(status || "").toLowerCase();
        return buildDivIcon(t, s);
    }, [type, status]);

    const validMarkers = useMemo(() => {
        if (!Array.isArray(markers)) return null;
        return markers
            .map((m) => {
                const lat = parseCoord(m.latitude);
                const lng = parseCoord(m.longitude);
                if (!isValidLatLng(lat, lng)) return null;
                const type = String(m.type || "").toLowerCase() === "ont" ? "ont" : "tiang";
                const status = String(m.status || "").toLowerCase();
                return { ...m, type, status, position: [lat, lng] };
            })
            .filter(Boolean);
    }, [markers]);

    const fitPoints = useMemo(
        () => (validMarkers || []).map((m) => m.position),
        [validMarkers]
    );

    const initialCenter = validMarkers
        ? (fitPoints.length > 0 ? fitPoints[0] : [-7.7956, 110.3695])
        : singlePosition;

    const base = useBase();

    const focusPin = (e) => {
        document.querySelectorAll(".gis-pin-active").forEach((el) => el.classList.remove("gis-pin-active"));
        e.target.getElement()?.classList.add("gis-pin-active");
    };

    const unfocusPin = (e) => {
        e.target.getElement()?.classList.remove("gis-pin-active");
    };

    return (
        <MapContainer
            center={initialCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full rounded-lg"
            updateWhenIdle={true}
            keepBuffer={2}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />

            {validMarkers ? (
                <>
                    {wilayah && wilayah !== "Semua" && Array.isArray(wilayahCenter) && wilayahCenter.length === 2 ? (
                        <RecenterWilayah wilayah={wilayah} wilayahCenter={wilayahCenter} />
                    ) : (
                        <FitBounds points={fitPoints} />
                    )}
                    {validMarkers.map((m) => (
                        <Marker
                            key={`${m.type}-${m.id}`}
                            position={m.position}
                            icon={buildDivIcon(m.type, m.status)}
                            eventHandlers={{
                                click: focusPin,
                                popupclose: unfocusPin,
                            }}
                        >
                            <Popup>
                                <div style={{ minWidth: 185 }}>
                                    <p style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#e9d5d5" : "#111827", letterSpacing: "0.02em", marginBottom: 4 }}>
                                        {m.kode || (m.type === "ont" ? "ONT" : "Tiang")}
                                    </p>
                                    <p style={{ fontSize: 12.5, color: isDark ? "#c9a9a9" : "#1f2937", fontWeight: 600, textTransform: "capitalize", marginBottom: 3 }}>
                                        {m.type} &middot;{" "}
                                        <span style={{ color: m.status === "aktif" ? "#4ade80" : m.status === "nonaktif" ? "#f87171" : (isDark ? "#c9a9a9" : "#1f2937"), textTransform: "capitalize" }}>
                                            {m.status || "-"}
                                        </span>
                                    </p>
                                    <p style={{ fontSize: 12.5, color: isDark ? "#c9a9a9" : "#1f2937", fontWeight: 500, textTransform: "capitalize", marginBottom: 3 }}>
                                        {m.wilayah ? m.wilayah : "-"}
                                        {m.kecamatan ? ` / ${m.kecamatan}` : (m.area ? ` / ${m.area}` : "")}
                                        {m.kelurahan ? ` / ${m.kelurahan}` : ""}
                                    </p>
                                    <p style={{ fontSize: 11.5, color: isDark ? "#e9d5d5" : "#111827", fontWeight: 600, marginBottom: 6 }}>
                                        {m.position[0].toFixed(6)}, {m.position[1].toFixed(6)}
                                    </p>
                                    <a
                                        href={`${base}/detail-${m.type}/${m.id}`.replace(/\/+/g, "/")}
                                        style={{ fontSize: 12, color: "#ab3c3c", fontWeight: 700, textDecoration: "none" }}
                                    >
                                        Lihat detail →
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </>
            ) : (
                <Marker
                    position={singlePosition}
                    icon={singleIcon}
                    eventHandlers={{
                        click: focusPin,
                        popupclose: unfocusPin,
                    }}
                />
            )}
            <LiveCoords />
        </MapContainer>
    );
});

export default MapView;
