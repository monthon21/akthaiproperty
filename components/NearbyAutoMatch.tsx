"use client";

import { useEffect, useRef, useState } from "react";
import { findNearbyPlacesAction, NearbyPlace } from "@/lib/actions/place";
import { parseLatLng } from "@/lib/geo";
import { placeLabel } from "@/components/PlaceNameInput";

export interface AssetPlaceRow {
  id: string;
  type: "distance" | "time";
  value: string;
  unit: string;
  placeName: string;
}

interface Props {
  /** the asset's Google Maps field (embed URL / lat,lng) */
  googleMap: string;
  places: AssetPlaceRow[];
  onChange: (places: AssetPlaceRow[]) => void;
}

const RADIUS_OPTIONS = [3, 5, 10, 15, 20];

function km(n: number) {
  return (Math.round(n * 10) / 10).toString();
}

/** Merge nearby places into the list: add new ones, fill distance on existing empty rows. */
function merge(prev: AssetPlaceRow[], found: NearbyPlace[]) {
  const next = [...prev];
  let added = 0;
  for (const p of found) {
    const name = placeLabel(p);
    const existing = next.findIndex((r) => r.placeName.trim() === name);
    if (existing >= 0) {
      const r = next[existing];
      if (!r.value) next[existing] = { ...r, type: "distance", value: km(p.distanceKm), unit: "km" };
      continue;
    }
    next.push({ id: `auto-${p.id}-${Date.now()}`, type: "distance", value: km(p.distanceKm), unit: "km", placeName: name });
    added++;
  }
  // drop blank placeholder rows once real suggestions arrive
  return { list: added > 0 ? next.filter((r) => r.placeName.trim() !== "") : next, added };
}

/**
 * Matches the asset's coordinates against the Place master list.
 * Runs automatically whenever the coordinates change (not on first load of an existing asset),
 * and on demand with the button.
 */
export default function NearbyAutoMatch({ googleMap, places: current, onChange }: Props) {
  const [radius, setRadius] = useState(15);
  const [status, setStatus] = useState<{ tone: "ok" | "info"; text: string } | null>(null);
  const [running, setRunning] = useState(false);
  const lastCoords = useRef<string | null>(null);
  const initialized = useRef(false);

  const coords = parseLatLng(googleMap);
  const coordsKey = coords ? `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}` : null;

  const run = async (r = radius) => {
    if (!coords) return;
    setRunning(true);
    const { places, withCoords } = await findNearbyPlacesAction(coords.lat, coords.lng, r);
    setRunning(false);
    if (places.length === 0) {
      setStatus({
        tone: "info",
        text:
          withCoords === 0
            ? "ยังไม่มีสถานที่ที่ระบุพิกัด — ใส่พิกัดที่หน้า “จัดการสถานที่” ก่อน"
            : `ไม่พบสถานที่ในรัศมี ${r} กม. (มีสถานที่ที่ระบุพิกัดแล้ว ${withCoords} แห่ง)`,
      });
      return;
    }
    const { list, added } = merge(current, places);
    onChange(list);
    setStatus({
      tone: "ok",
      text: added > 0
        ? `เพิ่มสถานที่ใกล้เคียงอัตโนมัติ ${added} แห่ง (รัศมี ${r} กม.)`
        : `พบ ${places.length} แห่งในรัศมี ${r} กม. — มีอยู่ในรายการแล้วทั้งหมด`,
    });
  };

  // Auto-run when the coordinates change
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      lastCoords.current = coordsKey; // existing asset: don't touch its saved list on load
      return;
    }
    if (!coordsKey || coordsKey === lastCoords.current) return;
    lastCoords.current = coordsKey;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsKey]);

  return (
    <div className="flex flex-col gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] text-white/60 flex-1 min-w-[200px]">
          {coords
            ? "📍 จับคู่สถานที่ใกล้เคียงจากพิกัดทรัพย์อัตโนมัติ (ระยะทางเส้นตรงโดยประมาณ)"
            : "📍 ใส่พิกัดทรัพย์ (Google Map) แล้วระบบจะเติมสถานที่ใกล้เคียงให้อัตโนมัติ"}
        </span>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="h-8 bg-black/45 border border-white/10 rounded-lg px-2 text-[11px] text-white cursor-pointer focus:outline-none focus:border-accent"
          aria-label="รัศมี"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} className="bg-[#112240]" value={r}>
              ไม่เกิน {r} กม.
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => run()}
          disabled={!coords || running}
          className="h-8 px-3 rounded-lg text-[11px] font-bold bg-accent text-primary-dark hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {running ? "กำลังค้นหา..." : "ค้นหาสถานที่ใกล้เคียง"}
        </button>
      </div>
      {status && (
        <p className={`text-[11px] font-semibold ${status.tone === "ok" ? "text-accent" : "text-white/50"}`}>{status.text}</p>
      )}
    </div>
  );
}
