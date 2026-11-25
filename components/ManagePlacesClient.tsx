"use client";

import { useMemo, useState } from "react";
import { Edit, Trash2, MapPin, Plus, X } from "lucide-react";
import { postCode as POSTCODES } from "@/lib/postcode";
import { parseLatLng } from "@/lib/geo";
import MapPickerModal from "@/components/MapPickerModal";
import RowActionsMenu from "@/components/RowActionsMenu";
import {
  createPlaceAction,
  updatePlaceAction,
  togglePlaceActiveAction,
  deletePlaceAction,
  PlaceInput,
} from "@/lib/actions/place";

export interface PlaceRow {
  id: number;
  placeNameTH: string;
  placeNameEN: string | null;
  location: string | null;
  province: string | null;
  postCode: string | null;
  isActive: boolean;
}

const EMPTY_FORM: Required<PlaceInput> = {
  placeNameTH: "",
  placeNameEN: "",
  location: "",
  province: "",
  postCode: "",
  isActive: true,
};

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white";
const labelCls = "text-[10px] font-bold text-white/40 uppercase tracking-widest block";

/** Accepts a Google Maps link, an <iframe>, or "lat,lng" and returns a link to open */
function mapHref(location: string) {
  const iframe = location.match(/src=["']([^"']+)["']/);
  if (iframe) return iframe[1];
  if (/^https?:\/\//.test(location)) return location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function ManagePlacesClient({ initialPlaces }: { initialPlaces: PlaceRow[] }) {
  const [places, setPlaces] = useState<PlaceRow[]>(initialPlaces);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const withCoords = places.filter((p) => parseLatLng(p.location)).length;

  // Fixed running number by creation order (id asc)
  const regNo = useMemo(() => {
    const map = new Map<number, number>();
    [...places].sort((a, b) => a.id - b.id).forEach((p, i) => map.set(p.id, i + 1));
    return map;
  }, [places]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return places
      .filter((p) => (statusFilter === "all" ? true : statusFilter === "active" ? p.isActive : !p.isActive))
      .filter((p) =>
        !q ||
        p.placeNameTH.toLowerCase().includes(q) ||
        p.placeNameEN?.toLowerCase().includes(q) ||
        p.province?.toLowerCase().includes(q) ||
        p.postCode?.includes(q)
      )
      .sort((a, b) => a.id - b.id);
  }, [places, search, statusFilter]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: PlaceRow) => {
    setEditingId(p.id);
    setForm({
      placeNameTH: p.placeNameTH,
      placeNameEN: p.placeNameEN || "",
      location: p.location || "",
      province: p.province || "",
      postCode: p.postCode || "",
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handlePostCode = (value: string) => {
    const code = value.replace(/\D/g, "").slice(0, 5);
    setForm((prev) => {
      const next = { ...prev, postCode: code };
      if (code.length === 5) {
        const match = POSTCODES.find((r) => r.postcode === code);
        if (match) next.province = match.province;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.placeNameTH.trim()) {
      setMessage({ type: "error", text: "กรุณากรอกชื่อสถานที่ (ไทย)" });
      return;
    }
    setSaving(true);
    const res = editingId ? await updatePlaceAction(editingId, form) : await createPlaceAction(form);
    setSaving(false);
    if (!res.success || !res.place) {
      setMessage({ type: "error", text: res.error || "บันทึกไม่สำเร็จ" });
      return;
    }
    const saved = res.place as PlaceRow;
    setPlaces((prev) => (editingId ? prev.map((p) => (p.id === editingId ? saved : p)) : [...prev, saved]));
    setMessage({ type: "ok", text: editingId ? "แก้ไขสถานที่เรียบร้อย" : "เพิ่มสถานที่เรียบร้อย" });
    setShowModal(false);
  };

  const handleToggle = async (p: PlaceRow) => {
    setPlaces((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
    const res = await togglePlaceActiveAction(p.id, !p.isActive);
    if (!res.success) {
      setPlaces((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: p.isActive } : x)));
      setMessage({ type: "error", text: res.error || "เปลี่ยนสถานะไม่สำเร็จ" });
    }
  };

  const handleDelete = async (p: PlaceRow) => {
    if (!confirm(`ลบ "${p.placeNameTH}" ?\n(ทรัพย์ที่บันทึกชื่อนี้ไว้แล้วจะไม่ถูกลบ)`)) return;
    const res = await deletePlaceAction(p.id);
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "ลบไม่สำเร็จ" });
      return;
    }
    setPlaces((prev) => prev.filter((x) => x.id !== p.id));
    setMessage({ type: "ok", text: `ลบ "${p.placeNameTH}" แล้ว` });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-xl px-5 py-3 text-xs font-bold flex justify-between items-center ${
            message.type === "ok" ? "bg-accent/10 border border-accent/30 text-accent" : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100" aria-label="ปิด">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 space-y-1.5">
          <label className={labelCls}>
            ค้นหา (Search) · มีพิกัดแล้ว {withCoords}/{places.length} แห่ง
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ชื่อไทย / อังกฤษ / จังหวัด / รหัสไปรษณีย์"
            className={inputCls}
          />
        </div>
        <div className="md:w-44 space-y-1.5">
          <label className={labelCls}>สถานะ (Status)</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={`${inputCls} appearance-none cursor-pointer`}
          >
            <option className="bg-[#112240]" value="all">ทั้งหมด ({places.length})</option>
            <option className="bg-[#112240]" value="active">เปิดใช้งาน ({places.filter((p) => p.isActive).length})</option>
            <option className="bg-[#112240]" value="inactive">ปิดใช้งาน ({places.filter((p) => !p.isActive).length})</option>
          </select>
        </div>
        <button
          onClick={openNew}
          className="h-11 px-6 bg-accent hover:bg-accent-dark text-primary-dark text-xs font-black rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> เพิ่มสถานที่
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-white/50 font-bold uppercase tracking-wider">
                <th className="px-5 py-4 text-center w-16">ลำดับ</th>
                <th className="px-5 py-4">ชื่อสถานที่ (TH)</th>
                <th className="px-5 py-4">ชื่อสถานที่ (EN)</th>
                <th className="px-5 py-4">จังหวัด</th>
                <th className="px-5 py-4">รหัสไปรษณีย์</th>
                <th className="px-5 py-4 text-center">พิกัด</th>
                <th className="px-5 py-4 text-center">ใช้งาน</th>
                <th className="px-5 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-white/40">
                    {places.length === 0 ? "ยังไม่มีสถานที่ — กด “เพิ่มสถานที่” เพื่อเริ่มต้น" : "ไม่พบสถานที่ที่ค้นหา"}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-white/5 transition-colors ${p.isActive ? "" : "opacity-50"}`}>
                    <td className="px-5 py-4 text-center text-white/50 font-mono">{regNo.get(p.id)}</td>
                    <td className="px-5 py-4 font-bold text-white">{p.placeNameTH}</td>
                    <td className="px-5 py-4 text-white/70">{p.placeNameEN || "-"}</td>
                    <td className="px-5 py-4 text-white/70">{p.province || "-"}</td>
                    <td className="px-5 py-4 text-white/70 font-mono">{p.postCode || "-"}</td>
                    <td className="px-5 py-4 text-center">
                      {p.location && !parseLatLng(p.location) ? (
                        <span className="text-[10px] text-amber-400" title="อ่านพิกัดไม่ได้ — กดแก้ไขแล้วเลือกบนแผนที่">⚠</span>
                      ) : p.location ? (
                        <a
                          href={mapHref(p.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex text-accent hover:text-white transition-colors"
                          title="เปิดแผนที่"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-white/20">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(p)}
                        role="switch"
                        aria-checked={p.isActive}
                        title={p.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors cursor-pointer ${p.isActive ? "bg-accent" : "bg-white/15"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${p.isActive ? "left-4.5" : "left-0.5"}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <RowActionsMenu
                          label={`เมนูจัดการ ${p.placeNameTH}`}
                          actions={[
                            ...(p.location && parseLatLng(p.location) ? [{ label: "Map", Icon: MapPin, href: mapHref(p.location), newTab: true }] : []),
                            { label: "Edit", Icon: Edit, onSelect: () => openEdit(p) },
                            { label: "Trash", Icon: Trash2, danger: true, onSelect: () => handleDelete(p) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MapPickerModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        initialValue={form.location}
        onConfirm={(coords) => setForm((f) => ({ ...f, location: `${coords.lat},${coords.lng}` }))}
      />

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => !saving && setShowModal(false)}>
          <div className="w-full max-w-lg bg-[#112240] border border-white/10 rounded-2xl p-7 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black">{editingId ? "แก้ไขสถานที่" : "เพิ่มสถานที่ใหม่"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer" aria-label="ปิด">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>ชื่อสถานที่ (ไทย) *</label>
              <input className={inputCls} value={form.placeNameTH} onChange={(e) => setForm({ ...form, placeNameTH: e.target.value })} placeholder="e.g. เซ็นทรัลพระรามสอง" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>ชื่อสถานที่ (อังกฤษ)</label>
              <input className={inputCls} value={form.placeNameEN} onChange={(e) => setForm({ ...form, placeNameEN: e.target.value })} placeholder="e.g. Central Rama 2" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>พิกัด / ลิงก์ Google Maps</label>
              <div className="flex gap-2">
                <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. 13.6636, 100.4377 หรือ https://maps.app.goo.gl/..." />
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="h-11 px-4 shrink-0 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" /> เลือกบนแผนที่
                </button>
              </div>
              {form.location.trim() && (
                <p className={`text-[11px] ${parseLatLng(form.location) ? "text-accent" : "text-white/40"}`}>
                  {parseLatLng(form.location)
                    ? "✓ อ่านพิกัดได้ — ใช้จับคู่สถานที่ใกล้เคียงอัตโนมัติ"
                    : /goo\.gl/.test(form.location)
                      ? "ลิงก์ย่อ — ระบบจะแปลงเป็นพิกัดให้ตอนบันทึก"
                      : "⚠ อ่านพิกัดไม่ได้ — ใช้ “เลือกบนแผนที่” หรือใส่เป็น lat, lng"}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>รหัสไปรษณีย์</label>
                <input className={inputCls} inputMode="numeric" value={form.postCode} onChange={(e) => handlePostCode(e.target.value)} placeholder="e.g. 10150" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>จังหวัด</label>
                <input className={inputCls} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="กรอกรหัสไปรษณีย์เพื่อเติมอัตโนมัติ" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-xs text-white/70">เปิดใช้งาน (แสดงให้เลือกในฟอร์มเพิ่มทรัพย์)</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-5 h-11 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/70 cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving} className="px-8 h-11 bg-accent text-primary-dark rounded-xl text-xs font-black tracking-widest uppercase hover:bg-accent-dark disabled:opacity-50 cursor-pointer">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
