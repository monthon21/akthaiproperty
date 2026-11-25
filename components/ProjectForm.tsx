"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Navigation } from "lucide-react";
import PlaceNameInput from "@/components/PlaceNameInput";
import NearbyAutoMatch from "@/components/NearbyAutoMatch";
import MapPickerModal from "@/components/MapPickerModal";
import SavingModal from "@/components/SavingModal";
import FormSectionNav, { FormSection } from "@/components/FormSectionNav";
import { createProjectTemplateAction, updateProjectTemplateAction } from "@/lib/actions/project-template";

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

export interface ProjectTemplateValue {
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


function placesToFormState(places: ProjectTemplateValue["places"]): TemplatePlace[] {
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

const FORM_SECTIONS: FormSection[] = [
  { id: "sec-project", label: "Project", title: "ชื่อโครงการ", Icon: Building2 },
  { id: "sec-location", label: "Location", title: "พิกัดโครงการ", Icon: MapPin },
  { id: "sec-places", label: "Nearby", title: "สถานที่ใกล้เคียง", Icon: Navigation },
];

const inputCls = "w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent transition-all text-white";
const selectCls = "w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent text-white appearance-none cursor-pointer";

/** Create / edit form for a project template — used by /manage/projects/new and /edit/[id] */
export default function ProjectForm({ lang, template }: { lang: string; template?: ProjectTemplateValue }) {
  const router = useRouter();
  const editingId = template?.id ?? null;
  const listHref = `/${lang}/manage/projects`;

  const [form, setForm] = useState({ name: template?.name || "", googleMap: template?.googleMap || "" });
  const [places, setPlaces] = useState<TemplatePlace[]>(template ? placesToFormState(template.places) : []);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [status, setStatus] = useState<"saving" | "success" | null>(null);
  const [formError, setFormError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("กรุณาระบุชื่อโครงการ");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFormError("");
    setStatus("saving");

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
    const res = editingId ? await updateProjectTemplateAction(editingId, payload) : await createProjectTemplateAction(payload);

    if (!res.success) {
      setStatus(null);
      setFormError(res.error || "เกิดข้อผิดพลาด");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStatus("success");
    setTimeout(() => {
      router.push(listHref);
      router.refresh();
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-6 items-start">
      <FormSectionNav sections={FORM_SECTIONS} onSave={(e) => e.currentTarget.form?.requestSubmit()} saving={status !== null} />

      <div className="bg-[#112240] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
        {formError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{formError}</p>
        )}

        <section id="sec-project" className="scroll-mt-32">
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
        </section>

        <section id="sec-location" className="scroll-mt-32">
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
        </section>

        <section id="sec-places" className="scroll-mt-32">
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

          {/* match the project's coordinates against the Place master list */}
          <NearbyAutoMatch
            subject="โครงการ"
            googleMap={form.googleMap}
            places={places.map((p) => ({ id: p._localId, type: p.type, value: p.value, unit: p.unit, placeName: p.placeName }))}
            onChange={(rows) =>
              setPlaces((prev) =>
                rows.map((r) => ({ ...prev.find((p) => p._localId === r.id), _localId: r.id, type: r.type, value: r.value, unit: r.unit, placeName: r.placeName }))
              )
            }
          />

          {places.length === 0 ? (
            <p className="text-xs text-white/30 italic text-center py-3">ยังไม่มีสถานที่ใกล้เคียง กด “เพิ่มรายการ” เพื่อระบุ</p>
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
                    <PlaceNameInput placeholder="พิมพ์เพื่อค้นหา เช่น เซ็นทรัล" value={p.placeName} onChange={(v) => updatePlace(p._localId, "placeName", v)} className={inputCls + " h-9"} />
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
        </section>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
          <Link
            href={listHref}
            className="px-6 h-11 inline-flex items-center bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white/70 hover:text-white transition-all"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={status !== null}
            className="px-10 h-11 bg-accent text-primary-dark rounded-xl font-black text-sm hover:bg-accent-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {editingId ? "บันทึกการแก้ไข" : "สร้างโครงการ"}
          </button>
        </div>
      </div>

      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialValue={form.googleMap}
        onConfirm={(_coords, embedUrl) => {
          setForm((prev) => ({ ...prev, googleMap: embedUrl }));
        }}
      />
      <SavingModal
        status={status}
        successTitle={editingId ? "แก้ไขโครงการสำเร็จ!" : "สร้างโครงการสำเร็จ!"}
        successText="กำลังกลับไปหน้ารายการโครงการ..."
      />
    </form>
  );
}
