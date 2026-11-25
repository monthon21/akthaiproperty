"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { postCode as POSTCODES } from "@/lib/postcode";
import { searchPlacesAction, createPlaceAction, PlaceOption } from "@/lib/actions/place";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** "เซ็นทรัลพระรามสอง (Central Rama 2)" — same convention as existing nearby-place names */
export function placeLabel(p: PlaceOption) {
  return p.placeNameEN ? `${p.placeNameTH} (${p.placeNameEN})` : p.placeNameTH;
}

/**
 * Place name input with suggestions from the Place master table (active only).
 * Free text is still allowed for places that aren't in the list yet.
 */
export default function PlaceNameInput({ value, onChange, placeholder, className }: Props) {
  const [options, setOptions] = useState<PlaceOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);
  const [showAdd, setShowAdd] = useState(false);
  const listId = useId();

  // Debounced search while the dropdown is open
  useEffect(() => {
    if (!open) return;
    const q = value.trim();
    if (!q) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      const res = await searchPlacesAction(q);
      if (id !== reqId.current) return; // a newer search started
      setOptions(res);
      setHighlight(0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [value, open]);

  // Close when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const select = (p: PlaceOption) => {
    onChange(placeLabel(p));
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter with no match: open "add new place" instead of submitting the asset form
    if (e.key === "Enter" && open && value.trim() && !loading && options.length === 0) {
      e.preventDefault();
      setOpen(false);
      setShowAdd(true);
      return;
    }
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(options[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && value.trim() !== "";
  const typed = value.trim();
  const exactMatch = options.some(
    (p) => p.placeNameTH === typed || p.placeNameEN?.toLowerCase() === typed.toLowerCase() || placeLabel(p) === typed
  );

  const openAdd = () => {
    setOpen(false);
    setShowAdd(true);
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder ?? "พิมพ์เพื่อค้นหาสถานที่..."}
        onChange={(e) => {
          onChange(e.target.value);
          setLoading(true);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className={className}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-[#0A192F] border border-white/15 rounded-lg shadow-2xl py-1"
        >
          {loading && options.length === 0 ? (
            <li className="px-3 py-2.5 text-[11px] text-white/40">กำลังค้นหา...</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2.5 text-[11px] text-white/40">ไม่พบในรายชื่อสถานที่</li>
          ) : (
            options.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(p);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`px-3 py-2 cursor-pointer flex justify-between items-center gap-3 ${i === highlight ? "bg-accent/15" : ""}`}
              >
                <span className="text-xs text-white truncate">
                  {p.placeNameTH}
                  {p.placeNameEN && <span className="text-white/40"> · {p.placeNameEN}</span>}
                </span>
                {p.province && <span className="text-[10px] text-white/40 shrink-0">{p.province}</span>}
              </li>
            ))
          )}
          {!loading && !exactMatch && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                openAdd();
              }}
              className="px-3 py-2.5 cursor-pointer border-t border-white/10 mt-1 text-xs font-bold text-accent hover:bg-accent/10 flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span className="truncate">เพิ่ม “{typed}” เป็นสถานที่ใหม่</span>
            </li>
          )}
        </ul>
      )}
      {showAdd &&
        createPortal(
          <AddPlaceModal
            initialName={typed}
            onClose={() => setShowAdd(false)}
            onCreated={(p) => {
              onChange(placeLabel(p));
              setShowAdd(false);
            }}
          />,
          document.body
        )}
    </div>
  );
}

const fieldCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white";
const labelCls = "text-[10px] font-bold text-white/40 uppercase tracking-widest block";

/** Quick "add a new place" dialog — saves to the Place master table */
function AddPlaceModal({
  initialName,
  onClose,
  onCreated,
}: {
  initialName: string;
  onClose: () => void;
  onCreated: (p: PlaceOption) => void;
}) {
  // Typed text like "ชื่อไทย (English)" is split into the two name fields
  const m = initialName.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  const [form, setForm] = useState({
    placeNameTH: m ? m[1] : initialName,
    placeNameEN: m ? m[2] : "",
    postCode: "",
    province: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePostCode = (v: string) => {
    const code = v.replace(/\D/g, "").slice(0, 5);
    const match = code.length === 5 ? POSTCODES.find((r) => r.postcode === code) : undefined;
    setForm((f) => ({ ...f, postCode: code, province: match ? match.province : f.province }));
  };

  const save = async () => {
    if (!form.placeNameTH.trim()) {
      setError("กรุณากรอกชื่อสถานที่ (ไทย)");
      return;
    }
    setSaving(true);
    setError("");
    const res = await createPlaceAction({ ...form, isActive: true });
    setSaving(false);
    if (!res.success || !res.place) {
      setError(res.error || "บันทึกไม่สำเร็จ");
      return;
    }
    onCreated(res.place);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 text-white"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        className="w-full max-w-md bg-[#112240] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
      >
        <div>
          <h3 className="text-base font-black">เพิ่มสถานที่ใหม่</h3>
          <p className="text-[11px] text-white/40 mt-1">บันทึกลงรายชื่อสถานที่ ครั้งต่อไปพิมพ์ค้นหาแล้วเลือกได้เลย</p>
        </div>
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-1.5">
          <label className={labelCls}>ชื่อสถานที่ (ไทย) *</label>
          <input className={fieldCls} value={form.placeNameTH} onChange={(e) => setForm({ ...form, placeNameTH: e.target.value })} autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>ชื่อสถานที่ (อังกฤษ)</label>
          <input className={fieldCls} value={form.placeNameEN} onChange={(e) => setForm({ ...form, placeNameEN: e.target.value })} placeholder="e.g. Central Rama 2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelCls}>รหัสไปรษณีย์</label>
            <input className={fieldCls} inputMode="numeric" value={form.postCode} onChange={(e) => handlePostCode(e.target.value)} placeholder="e.g. 10150" />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>จังหวัด</label>
            <input className={fieldCls} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>พิกัด / ลิงก์ Google Maps</label>
          <input className={fieldCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="ไม่บังคับ" />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={saving} className="px-5 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/70 cursor-pointer">
            ยกเลิก
          </button>
          <button type="button" onClick={save} disabled={saving} className="px-6 h-10 bg-accent text-primary-dark rounded-xl text-xs font-black tracking-widest uppercase hover:bg-accent-dark disabled:opacity-50 cursor-pointer">
            {saving ? "กำลังบันทึก..." : "บันทึกและเลือก"}
          </button>
        </div>
      </div>
    </div>
  );
}
