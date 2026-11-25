"use client";

import { useState } from "react";
import { formatDecimalInput, splitLandSize, stripCommas, SQW_PER_NGAN, SQW_PER_RAI } from "@/lib/format";

interface Props {
  /** total land size in square wah (ตร.วา), may contain commas */
  value: string;
  onChange: (totalSqw: string) => void;
}

const boxCls =
  "w-full min-w-0 h-11 bg-black/45 border border-white/10 rounded-xl pl-3 pr-12 text-xs focus:outline-none focus:border-accent transition-all text-white";

/** Land size entered as ไร่ / งาน / ตร.วา, reported back as total ตร.วา */
export default function LandSizeInput({ value, onChange }: Props) {
  const [parts, setParts] = useState(() => {
    const total = Number(stripCommas(value));
    if (!total) return { rai: "", ngan: "", sqw: "" };
    const p = splitLandSize(total);
    return { rai: p.rai ? String(p.rai) : "", ngan: p.ngan ? String(p.ngan) : "", sqw: p.sqw ? String(p.sqw) : "" };
  });

  const update = (key: "rai" | "ngan" | "sqw", raw: string) => {
    const next = { ...parts, [key]: formatDecimalInput(raw) };
    setParts(next);
    const num = (s: string) => Number(stripCommas(s)) || 0;
    const total = num(next.rai) * SQW_PER_RAI + num(next.ngan) * SQW_PER_NGAN + num(next.sqw);
    onChange(total ? String(Math.round(total * 100) / 100) : "");
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
