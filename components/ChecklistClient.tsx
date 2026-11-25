"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Plus, Trash2, X, ChevronDown, AlertTriangle } from "lucide-react";
import {
  AREA_PRESETS,
  CHECKLIST_KINDS,
  ChecklistArea,
  ChecklistData,
  ChecklistItem,
  ChecklistKind,
  ItemStatus,
  STATUS_OPTIONS,
  checklistProgress,
  makeArea,
  makeItem,
} from "@/lib/checklist";
import { saveChecklistAction } from "@/lib/actions/checklist";
import { resizeImage } from "@/lib/imageResize";
import SavingModal from "@/components/SavingModal";

interface Props {
  asset: { id: string; code: string; title: string };
  initial: {
    id?: number;
    kind: ChecklistKind;
    inspectedAt: string;
    inspector: string;
    occupant: string;
    data: ChecklistData;
  };
}

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent text-white placeholder-white/25";
const labelCls = "text-xs font-bold text-white/50 block";
const cardCls = "bg-[#112240] border border-white/10 rounded-2xl shadow-xl";

const STATUS_STYLE: Record<Exclude<ItemStatus, "">, string> = {
  ok: "bg-emerald-500 border-emerald-500 text-white",
  defect: "bg-amber-500 border-amber-500 text-black",
  damaged: "bg-red-500 border-red-500 text-white",
};

/** Inspection checklist: rooms → points to check → status, photos, note */
export default function ChecklistClient({ asset, initial }: Props) {
  const [checklistId, setChecklistId] = useState(initial.id);
  const [kind, setKind] = useState<ChecklistKind>(initial.kind);
  const [inspectedAt, setInspectedAt] = useState(initial.inspectedAt);
  const [inspector, setInspector] = useState(initial.inspector);
  const [occupant, setOccupant] = useState(initial.occupant);
  const [data, setData] = useState<ChecklistData>(initial.data);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<Record<string, number>>({}); // itemId -> files in flight
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"saving" | "success" | null>(null);
  const [error, setError] = useState("");
  const [newAreaName, setNewAreaName] = useState("");

  const progress = useMemo(() => checklistProgress(data), [data]);
  const isUploading = Object.values(uploading).some((n) => n > 0);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ── state helpers ──
  const change = (fn: (d: ChecklistData) => ChecklistData) => {
    setData(fn);
    setDirty(true);
  };
  const updateArea = (areaId: string, fn: (a: ChecklistArea) => ChecklistArea) =>
    change((d) => ({ ...d, areas: d.areas.map((a) => (a.id === areaId ? fn(a) : a)) }));
  const updateItem = (areaId: string, itemId: string, patch: Partial<ChecklistItem> | ((i: ChecklistItem) => ChecklistItem)) =>
    updateArea(areaId, (a) => ({
      ...a,
      items: a.items.map((i) => (i.id === itemId ? (typeof patch === "function" ? patch(i) : { ...i, ...patch }) : i)),
    }));
  const meta = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const addArea = (name: string) => {
    const n = name.trim();
    if (!n) return;
    change((d) => ({ ...d, areas: [...d.areas, makeArea(n, AREA_PRESETS[n] ?? [])] }));
    setNewAreaName("");
  };

  const removeArea = (a: ChecklistArea) => {
    const photos = a.items.reduce((n, i) => n + i.photos.length, 0);
    if (!confirm(`ลบ “${a.name}” ทั้งห้อง?${photos ? `\n(มีรูปถ่าย ${photos} รูป)` : ""}`)) return;
    change((d) => ({ ...d, areas: d.areas.filter((x) => x.id !== a.id) }));
  };

  // ── photos ──
  const addPhotos = async (areaId: string, itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setError("");
    setUploading((u) => ({ ...u, [itemId]: (u[itemId] || 0) + list.length }));
    for (const original of list) {
      try {
        const file = await resizeImage(original);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "image");
        fd.append("folder", `checklist/${asset.code}`);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "อัปโหลดรูปไม่สำเร็จ");
        updateItem(areaId, itemId, (i) => ({ ...i, photos: [...i.photos, json.url] }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
      } finally {
        setUploading((u) => ({ ...u, [itemId]: Math.max(0, (u[itemId] || 1) - 1) }));
      }
    }
  };

  const save = async () => {
    setError("");
    setStatus("saving");
    const res = await saveChecklistAction(asset.id, { id: checklistId, kind, inspectedAt, inspector, occupant, data });
    if (!res.success) {
      setStatus(null);
      setError(res.error);
      return;
    }
    setChecklistId(res.id);
    setDirty(false);
    setStatus("success");
    setTimeout(() => setStatus(null), 1100);
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const unusedPresets = Object.keys(AREA_PRESETS).filter((p) => !data.areas.some((a) => a.name === p));

  return (
    <div className="space-y-5 pb-24">
      {/* ── Inspection info ── */}
      <section className={`${cardCls} p-5 space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>ประเภทการตรวจ</label>
            <select value={kind} onChange={(e) => meta(setKind)(e.target.value as ChecklistKind)} className={`${inputCls} appearance-none cursor-pointer`}>
              {CHECKLIST_KINDS.map((k) => (
                <option key={k.value} className="bg-[#112240]" value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>วันที่ตรวจ</label>
            <input type="date" value={inspectedAt} onChange={(e) => meta(setInspectedAt)(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>ผู้ตรวจ</label>
            <input type="text" value={inspector} onChange={(e) => meta(setInspector)(e.target.value)} placeholder="ชื่อผู้ตรวจ" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>ผู้เช่า / ผู้ซื้อ</label>
            <input type="text" value={occupant} onChange={(e) => meta(setOccupant)(e.target.value)} placeholder="ชื่อผู้เข้าอยู่" className={inputCls} />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-between items-end gap-2 mb-1.5 text-xs">
            <span className="font-bold text-white/70">
              ตรวจแล้ว {progress.done}/{progress.total} จุด
              <span className="text-white/40 font-normal"> · รูปถ่าย {progress.photos} รูป</span>
            </span>
            {progress.issues > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" /> พบปัญหา {progress.issues} จุด
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* ── Rooms / locations ── */}
      {data.areas.map((area) => {
        const done = area.items.filter((i) => i.status !== "").length;
        const isCollapsed = collapsed.has(area.id);
        return (
          <section key={area.id} className={`${cardCls} overflow-hidden`}>
            <header className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-black/20 border-b border-white/5">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => {
                    const next = new Set(c);
                    if (next.has(area.id)) next.delete(area.id);
                    else next.add(area.id);
                    return next;
                  })
                }
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "ขยาย" : "ย่อ"}
                className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              <input
                value={area.name}
                onChange={(e) => updateArea(area.id, (a) => ({ ...a, name: e.target.value }))}
                aria-label="ชื่อห้อง / ตำแหน่ง"
                className="flex-1 min-w-0 bg-transparent text-base font-black text-white focus:outline-none focus:bg-black/30 rounded-lg px-2 py-1"
              />
              <span className={`text-xs font-bold shrink-0 ${done === area.items.length && done > 0 ? "text-emerald-400" : "text-white/40"}`}>
                {done}/{area.items.length}
              </span>
              <button type="button" onClick={() => removeArea(area)} aria-label={`ลบ ${area.name}`} className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </header>

            {!isCollapsed && (
              <div className="divide-y divide-white/5">
                {area.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    uploading={uploading[item.id] || 0}
                    onChange={(patch) => updateItem(area.id, item.id, patch)}
                    onRemove={() => updateArea(area.id, (a) => ({ ...a, items: a.items.filter((i) => i.id !== item.id) }))}
                    onPhotos={(files) => addPhotos(area.id, item.id, files)}
                  />
                ))}
                <div className="px-4 sm:px-5 py-3">
                  <button
                    type="button"
                    onClick={() => updateArea(area.id, (a) => ({ ...a, items: [...a.items, makeItem("")] }))}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> เพิ่มจุดที่ตรวจ
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* ── Add room ── */}
      <section className={`${cardCls} border-dashed p-5 space-y-3`}>
        <p className={labelCls}>เพิ่มห้อง / ตำแหน่ง</p>
        {unusedPresets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unusedPresets.map((p) => (
              <button key={p} type="button" onClick={() => addArea(p)} className="h-9 px-3 rounded-full border border-white/10 bg-white/[0.03] hover:border-accent/50 hover:text-white text-xs font-bold text-white/60 cursor-pointer">
                + {p}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArea(newAreaName);
              }
            }}
            placeholder="หรือพิมพ์ชื่อเอง เช่น ห้องเก็บของ, ห้องนอน 3"
            className={inputCls}
          />
          <button type="button" onClick={() => addArea(newAreaName)} disabled={!newAreaName.trim()} className="h-11 px-5 shrink-0 rounded-xl bg-accent text-primary-dark text-sm font-black hover:bg-accent-dark disabled:opacity-40 cursor-pointer">
            เพิ่ม
          </button>
        </div>
      </section>

      {/* ── Meters, keys, note ── */}
      <section className={`${cardCls} p-5 space-y-4`}>
        <h2 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">มิเตอร์ กุญแจ และหมายเหตุ</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {(
            [
              ["เลขมิเตอร์ไฟฟ้า", data.meters.electric, (v: string) => change((d) => ({ ...d, meters: { ...d.meters, electric: v } }))],
              ["เลขมิเตอร์น้ำ", data.meters.water, (v: string) => change((d) => ({ ...d, meters: { ...d.meters, water: v } }))],
              ["กุญแจ (ดอก)", data.keys.keys, (v: string) => change((d) => ({ ...d, keys: { ...d.keys, keys: v } }))],
              ["คีย์การ์ด (ใบ)", data.keys.keycards, (v: string) => change((d) => ({ ...d, keys: { ...d.keys, keycards: v } }))],
              ["รีโมท (อัน)", data.keys.remotes, (v: string) => change((d) => ({ ...d, keys: { ...d.keys, remotes: v } }))],
            ] as const
          ).map(([label, value, onChange]) => (
            <div key={label} className="space-y-1.5">
              <label className={labelCls}>{label}</label>
              <input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>หมายเหตุรวม</label>
          <textarea rows={3} value={data.note} onChange={(e) => change((d) => ({ ...d, note: e.target.value }))} placeholder="ข้อตกลงเพิ่มเติม หรือสิ่งที่ต้องซ่อมก่อนเข้าอยู่" className="w-full px-4 py-3 bg-black/45 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent text-white placeholder-white/25 resize-y" />
        </div>
      </section>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0A192F]/95 backdrop-blur border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-white truncate">{pct}% · {progress.done}/{progress.total} จุด · {progress.photos} รูป</p>
            <p className={dirty ? "text-amber-400" : "text-white/40"}>
              {isUploading ? "กำลังอัปโหลดรูป..." : dirty ? "มีการแก้ไขที่ยังไม่ได้บันทึก" : checklistId ? "บันทึกแล้ว" : "ยังไม่เคยบันทึก"}
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={status !== null || isUploading}
            className="h-11 px-8 shrink-0 rounded-xl bg-accent text-primary-dark font-black text-sm shadow-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            บันทึก Check list
          </button>
        </div>
      </div>

      <SavingModal status={status} savingTitle="กำลังบันทึก Check list..." successTitle="บันทึก Check list แล้ว" successText="กลับมาแก้ไขหรือถ่ายรูปเพิ่มได้ทุกเมื่อ" />
    </div>
  );
}

function ItemRow({
  item,
  uploading,
  onChange,
  onRemove,
  onPhotos,
}: {
  item: ChecklistItem;
  uploading: number;
  onChange: (patch: Partial<ChecklistItem>) => void;
  onRemove: () => void;
  onPhotos: (files: FileList | null) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const needsNote = (item.status === "defect" || item.status === "damaged") && !item.note.trim();

  return (
    <div className="px-4 sm:px-5 py-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="จุดที่ตรวจ เช่น โซฟา, ประตูทางเข้า"
          aria-label="จุดที่ตรวจ"
          className="flex-1 min-w-[160px] bg-transparent text-sm font-bold text-white placeholder-white/25 focus:outline-none focus:bg-black/30 rounded-lg px-2 py-1.5"
        />
        <div className="flex gap-1.5" role="group" aria-label="สภาพ">
          {STATUS_OPTIONS.map((s) => {
            const selected = item.status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ status: selected ? "" : s.value })}
                aria-pressed={selected}
                className={`h-9 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  selected ? STATUS_STYLE[s.value] : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onRemove} aria-label={`ลบ ${item.name || "จุดนี้"}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {item.photos.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
            <a href={url} target="_blank" rel="noopener noreferrer" title="เปิดรูปเต็ม">
              <Image src={url} alt={item.name} fill sizes="80px" className="object-cover" unoptimized />
            </a>
            <button
              type="button"
              onClick={() => onChange({ photos: item.photos.filter((p) => p !== url) })}
              aria-label="ลบรูป"
              className="absolute top-1 right-1 w-6 h-6 inline-flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="w-20 h-20 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-white/15 border-t-accent animate-spin" />
          </div>
        ))}

        <button type="button" onClick={() => cameraRef.current?.click()} className="w-20 h-20 rounded-xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent flex flex-col items-center justify-center gap-1 cursor-pointer">
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-bold">ถ่ายภาพ</span>
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/10 text-white/60 flex flex-col items-center justify-center gap-1 cursor-pointer">
          <ImagePlus className="w-5 h-5" />
          <span className="text-[10px] font-bold">แนบภาพ</span>
        </button>
        {/* capture="environment" opens the rear camera on phones */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { onPhotos(e.target.files); e.target.value = ""; }} />
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onPhotos(e.target.files); e.target.value = ""; }} />
      </div>

      <input
        value={item.note}
        onChange={(e) => onChange({ note: e.target.value })}
        placeholder={needsNote ? "ระบุตำหนิ / ความเสียหายที่พบ" : "รายละเอียดเพิ่มเติม (ถ้ามี)"}
        aria-label="รายละเอียด"
        className={`w-full h-10 bg-black/30 border rounded-lg px-3 text-xs focus:outline-none focus:border-accent text-white placeholder-white/25 ${needsNote ? "border-amber-500/60" : "border-white/10"}`}
      />
    </div>
  );
}
