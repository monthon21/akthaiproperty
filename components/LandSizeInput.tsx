"use client";

import { useState } from "react";
import { formatDecimalInput, landPartsTotal, parseLandParts, stripCommas } from "@/lib/format";

interface Props {
  /** total land size in square wah (ตร.วา), may contain commas */
  value: string;
  /** what was typed in each box, "ไร่-งาน-ตร.วา" (Asset.specs.landParts) */
  parts?: string;
  onChange: (totalSqw: string, parts: string) => void;
}

const boxCls =
  "w-full min-w-0 h-11 bg-black/45 border border-white/10 rounded-xl pl-3 pr-12 text-xs focus:outline-none focus:border-accent transition-all text-white";

const show = (n: number) => (n ? formatDecimalInput(String(n)) : "");

/**
 * Land size entered as ไร่ / งาน / ตร.วา. Units are never converted: 157 typed in ตร.วา stays 157 ตร.วา.
 * Reports the total in ตร.วา (for search / sorting) plus the boxes as typed.
 */
export default function LandSizeInput({ value, parts: savedParts, onChange }: Props) {
  const [parts, setParts] = useState(() => {
    const total = Number(stripCommas(value));
    if (!total) return { rai: "", ngan: "", sqw: "" };
    const saved = parseLandParts(savedParts);
    // older listings only have the total: show it in ตร.วา as it is
    const p = saved && landPartsTotal(saved) === total ? saved : { rai: 0, ngan: 0, sqw: total };
    return { rai: show(p.rai), ngan: show(p.ngan), sqw: show(p.sqw) };
  });

  const update = (key: "rai" | "ngan" | "sqw", raw: string) => {
    const next = { ...parts, [key]: formatDecimalInput(raw) };
    setParts(next);
    const num = (s: string) => Number(stripCommas(s)) || 0;
    const typed = { rai: num(next.rai), ngan: num(next.ngan), sqw: num(next.sqw) };
    const total = landPartsTotal(typed);
    onChange(total ? String(total) : "", total ? `${typed.rai}-${typed.ngan}-${typed.sqw}` : "");
  };

  const fields: { key: "rai" | "ngan" | "sqw"; unit: string; placeholder: string }[] = [
    { key: "rai", unit: "ไร่", placeholder: "0" },
    { key: "ngan", unit: "งาน", placeholder: "0" },
    { key: "sqw", unit: "ตร.วา", placeholder: "0" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {fields.map((f) => (
        <div key={f.key} className="relative">
          <input
            type="text"
            inputMode="decimal"
            placeholder={f.placeholder}
            value={parts[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            className={boxCls}
            aria-label={f.unit}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40 pointer-events-none">
            {f.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
