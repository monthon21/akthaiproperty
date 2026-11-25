"use client";

import { AssetSpecs, SpecField } from "@/lib/assetSpecs";
import { formatDecimalInput } from "@/lib/format";

interface Props {
  title: string;
  subtitle?: string;
  fields: SpecField[];
  specs: AssetSpecs;
  onChange: (specs: AssetSpecs) => void;
}

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white";

/** Admin form inputs for a group of Asset.specs fields (Thai labels) */
export default function SpecFieldsGroup({ title, subtitle, fields, specs, onChange }: Props) {
  const set = (key: string, value: string) => onChange({ ...specs, [key]: value });

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
        {title}
        {subtitle && <span className="text-white/20">/ {subtitle}</span>}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div key={f.key} className={`space-y-1.5 ${f.input === "textarea" ? "md:col-span-2" : ""}`}>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
              {f.label.th}
              {f.unit ? ` (${f.unit.th})` : ""}
            </label>
            {f.input === "select" ? (
              <select
                value={specs[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                <option className="bg-[#112240]" value="">ไม่ระบุ</option>
                {f.options?.map((o) => (
                  <option key={o.value} className="bg-[#112240]" value={o.value}>
                    {o.label.th}
                  </option>
                ))}
              </select>
            ) : f.input === "textarea" ? (
              <textarea
                rows={3}
                placeholder={f.placeholder}
                value={specs[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent transition-all text-white resize-y"
              />
            ) : (
              <input
                type="text"
                inputMode={f.input === "number" ? "decimal" : undefined}
                placeholder={f.placeholder}
                value={f.input === "number" ? formatDecimalInput(specs[f.key] || "") : specs[f.key] || ""}
                onChange={(e) => set(f.key, f.input === "number" ? formatDecimalInput(e.target.value) : e.target.value)}
                className={inputCls}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
