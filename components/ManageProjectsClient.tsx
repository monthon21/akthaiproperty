"use client";

import { useState, useRef, useEffect } from "react";
import {
  createProjectTemplateAction,
  updateProjectTemplateAction,
  deleteProjectTemplateAction,
} from "@/lib/actions/project-template";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import MapPickerModal from "@/components/MapPickerModal";

interface TemplatePlace {
  id?: number;
  placeName: string;
  distance?: string;
  travelTime?: string;
  sortOrder?: number;
  _localId: string; // for React key
  type: "distance" | "time";
  value: string;
  unit: string;
}

interface Template {
  id: number;
  name: string;
  googleMap: string | null;
  places: {
    id: number;
    placeName: string;
    distance: string | null;
    travelTime: string | null;
    sortOrder: number;
  }[];
}

interface Props {
  initialTemplates: Template[];
}

function placesToFormState(places: Template["places"]): TemplatePlace[] {
  return places.map((p) => {
    let type: "distance" | "time" = "distance";
    let value = "";
    let unit = "km";
    if (p.distance) {
      type = "distance";
      const parts = p.distance.split(" ");
      value = parts[0] || "";
      unit = parts[1] || "km";
    } else if (p.travelTime) {
      type = "time";
      const parts = p.travelTime.split(" ");
      value = parts[0] || "";
      unit = parts[1] || "นาที";
    }
    return {
      id: p.id,
      placeName: p.placeName,
      type,
      value,
      unit,
      sortOrder: p.sortOrder,
      _localId: `existing-${p.id}`,
    };
  });
}

function emptyForm() {
  return { name: "", googleMap: "" };
}

export default function ManageProjectsClient({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [places, setPlaces] = useState<TemplatePlace[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Place helpers ──────────────────────────────────────────────────────
  const addPlace = () => {
    setPlaces((prev) => [
      ...prev,
      { _localId: Date.now().toString(), placeName: "", type: "distance", value: "", unit: "km" },
    ]);
  };

  const updatePlace = (localId: string, field: keyof TemplatePlace, val: string) => {
    setPlaces((prev) =>
      prev.map((p) => {
        if (p._localId !== localId) return p;
        const updated = { ...p, [field]: val };
        if (field === "type") {
          updated.unit = val === "distance" ? "km" : "นาที";
          updated.value = "";
        }
        return updated;
      })
    );
  };

  const removePlace = (localId: string) => {
    setPlaces((prev) => prev.filter((p) => p._localId !== localId));
  };

  // ── Open modal ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setPlaces([]);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (t: Template) => {
    setEditingId(t.id);
    setForm({ name: t.name, googleMap: t.googleMap || "" });
    setPlaces(placesToFormState(t.places));
    setFormError("");
    setShowModal(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("กรุณาระบุชื่อโครงการ"); return; }
    setIsSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      googleMap: form.googleMap || undefined,
      places: places.filter((p) => p.placeName.trim()).map((p, idx) => ({
        placeName: p.placeName.trim(),
        distance: p.type === "distance" && p.value ? `${p.value} ${p.unit}` : undefined,
        travelTime: p.type === "time" && p.value ? `${p.value} ${p.unit}` : undefined,
        sortOrder: idx,
      })),
    };

    const res = editingId
      ? await updateProjectTemplateAction(editingId, payload)
      : await createProjectTemplateAction(payload);

    setIsSaving(false);

    if (!res.success) {
      setFormError(res.error || "เกิดข้อผิดพลาด");
      return;
    }

    // Update local state
    const saved = res.template as Template;
    setTemplates((prev) =>
      editingId
        ? prev.map((t) => (t.id === editingId ? saved : t))
        : [...prev, saved].sort((a, b) => a.name.localeCompare(b.name, "th"))
    );
    setShowModal(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบโครงการนี้? (สถานที่ใกล้เคียงที่บันทึกไว้จะถูกลบด้วย)")) return;
    setDeletingId(id);
    const res = await deleteProjectTemplateAction(id);
    setDeletingId(null);
    if (res.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert("เกิดข้อผิดพลาดในการลบ: " + res.error);
    }
  };

  // ── Input styles ──────────────────────────────────────────────────────
  const inputCls = "w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent transition-all text-white";
  const selectCls = "w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent text-white appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {templates.length === 0 ? "ยังไม่มีโครงการในระบบ" : `${templates.length} โครงการ`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary-dark text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-accent/10 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มโครงการ
        </button>
      </div>

      {/* ── Template list ── */}
      {templates.length === 0 ? (
        <div className="border-2 border-dashed border-white/10 rounded-2xl py-16 flex flex-col items-center gap-4 text-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
          <p className="text-sm font-semibold">ยังไม่มีข้อมูลโครงการ</p>
          <p className="text-xs text-center leading-relaxed">กด "เพิ่มโครงการ" เพื่อสร้างเทมเพลตโครงการใหม่<br />ที่จะ auto-fill พิกัดและสถานที่ใกล้เคียงในฟอร์มเพิ่มทรัพย์</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="bg-[#112240] border border-white/10 rounded-2xl overflow-hidden transition-all">
              {/* Card header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{t.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${t.googleMap ? "text-accent bg-accent/10" : "text-white/30 bg-white/5"}`}>
                      {t.googleMap ? "✓ มีพิกัด" : "ไม่มีพิกัด"}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {t.places.length > 0 ? `${t.places.length} สถานที่ใกล้เคียง` : "ไม่มีสถานที่"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pr-2">
                  <button
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    title={expandedId === t.id ? "ซ่อน" : "ดูรายละเอียด"}
                    className="p-1.5 text-white/30 hover:text-white transition-colors cursor-pointer"
                  >
                    {expandedId === t.id ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    title="แก้ไข"
                    className="p-1.5 text-white/30 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    title="ลบ"
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {deletingId === t.id ? (
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === t.id && (
                <div className="border-t border-white/5 px-5 py-4 bg-black/20 space-y-4">
                  {t.googleMap && (
                    <div className="rounded-xl overflow-hidden h-28 border border-white/10">
                      <iframe
                        src={t.googleMap.includes("output=embed") || t.googleMap.includes("openstreetmap") ? t.googleMap : `https://maps.google.com/maps?q=${encodeURIComponent(t.googleMap)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        width="100%" height="100%" className="border-0 grayscale opacity-70" loading="lazy" title="Map"
                      />
                    </div>
                  )}
                  {t.places.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">สถานที่ใกล้เคียง</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {t.places.map((p) => (
                          <div key={p.id} className="flex justify-between items-center px-3 py-2 bg-black/30 border border-white/5 rounded-xl">
                            <span className="text-xs text-white truncate">{p.placeName}</span>
                            <span className="text-[10px] text-accent font-bold ml-2 shrink-0">
                              {p.distance || p.travelTime || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-4xl bg-[#0D1B2E] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#112240]/80 shrink-0">
              <div>
                <h2 className="text-sm font-bold text-white">
                  {editingId ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {editingId ? "แก้ไขข้อมูลเทมเพลตโครงการ" : "เทมเพลตจะถูกใช้ auto-fill ในฟอร์มเพิ่มทรัพย์"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-xs">
                  {formError}
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ชื่อโครงการ *</label>
                <input
                  type="text"
                  placeholder="e.g. The Grand Rama 2, ไอดีโอ สุขุมวิท..."
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Google Map / Coordinates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">พิกัดโครงการ (Project Coordinates)</label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 hover:border-accent/40 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    ตั้งค่าพิกัด
                  </button>
                </div>

                {form.googleMap ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <div className="h-32 w-full">
                      <iframe
                        src={form.googleMap.includes("output=embed") || form.googleMap.includes("openstreetmap") ? form.googleMap : `https://maps.google.com/maps?q=${encodeURIComponent(form.googleMap)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        width="100%" height="100%" className="border-0 grayscale opacity-80" loading="lazy" title="Map Preview"
                      />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-black/70 px-3 py-1.5">
                      <span className="text-[10px] text-accent font-bold flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ตั้งค่าพิกัดแล้ว
                      </span>
                      <button type="button" onClick={() => setShowMapPicker(true)} className="text-[9px] text-white/50 hover:text-accent transition-colors uppercase tracking-widest font-bold">แก้ไข</button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="w-full h-20 border-2 border-dashed border-white/10 hover:border-accent/30 rounded-xl bg-black/20 hover:bg-accent/5 flex flex-col items-center justify-center gap-2 transition-all group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/20 group-hover:text-accent/50 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span className="text-[10px] text-white/30 group-hover:text-accent/60 font-semibold transition-colors">คลิกเพื่อตั้งค่าพิกัดโครงการ</span>
                  </button>
                )}
                <details className="group">
                  <summary className="text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors select-none list-none flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 transition-transform group-open:rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    กรอก URL / iframe code โดยตรง
                  </summary>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="e.g. 13.7563, 100.5018 หรือ iframe embed code"
                      value={form.googleMap}
                      onChange={(e) => setForm((prev) => ({ ...prev, googleMap: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </details>
              </div>

              {/* Nearby Places */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">สถานที่ใกล้เคียง (Nearby Places)</label>
                  <button
                    type="button"
                    onClick={addPlace}
                    className="flex items-center gap-1 text-[10px] font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    เพิ่มรายการ
                  </button>
                </div>

                {places.length === 0 ? (
                  <p className="text-xs text-white/30 italic text-center py-3">ยังไม่มีสถานที่ใกล้เคียง กด "เพิ่มรายการ" เพื่อระบุ</p>
                ) : (
                  <div className="space-y-2.5">
                    {places.map((p) => (
                      <div key={p._localId} className="grid grid-cols-12 gap-2 items-start bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="col-span-3 space-y-1">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">ประเภท</label>
                          <select
                            value={p.type}
                            onChange={(e) => updatePlace(p._localId, "type", e.target.value)}
                            className={selectCls + " h-9"}
                          >
                            <option className="bg-[#112240]" value="distance">ระยะทาง</option>
                            <option className="bg-[#112240]" value="time">ระยะเวลา</option>
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">ตัวเลข</label>
                          <input type="number" placeholder="5" value={p.value} onChange={(e) => updatePlace(p._localId, "value", e.target.value)} className={inputCls + " h-9"} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">หน่วย</label>
                          <select value={p.unit} onChange={(e) => updatePlace(p._localId, "unit", e.target.value)} className={selectCls + " h-9"}>
                            {p.type === "distance" ? (
                              <>
                                <option className="bg-[#112240]" value="m">m</option>
                                <option className="bg-[#112240]" value="km">km</option>
                              </>
                            ) : (
                              <>
                                <option className="bg-[#112240]" value="นาที">นาที</option>
                                <option className="bg-[#112240]" value="ชั่วโมง">ชั่วโมง</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">ชื่อสถานที่</label>
                          <input type="text" placeholder="e.g. เซ็นทรัล, BTS อโศก" value={p.placeName} onChange={(e) => updatePlace(p._localId, "placeName", e.target.value)} className={inputCls + " h-9"} />
                        </div>
                        <div className="col-span-1 flex justify-end mt-5">
                          <button type="button" onClick={() => removePlace(p._localId)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#112240]/60 shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 h-9 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">ยกเลิก</button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 h-9 text-xs font-black uppercase tracking-widest bg-accent hover:bg-accent/90 text-primary-dark rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent/10"
              >
                {isSaving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "สร้างโครงการ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Map Picker Modal ── */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialValue={form.googleMap}
        onConfirm={(_coords, embedUrl) => {
          setForm((prev) => ({ ...prev, googleMap: embedUrl }));
        }}
      />
    </div>
  );
}
