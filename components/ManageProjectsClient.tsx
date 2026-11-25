"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RowActionsMenu from "@/components/RowActionsMenu";
import { deleteProjectTemplateAction } from "@/lib/actions/project-template";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";

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

export default function ManageProjectsClient({ initialTemplates }: Props) {
  const { lang = "th" } = useParams<{ lang: string }>();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  return (
    <div className="space-y-6">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {templates.length === 0 ? "ยังไม่มีโครงการในระบบ" : `${templates.length} โครงการ`}
        </p>
        <Link
          href={`/${lang}/manage/projects/new`}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary-dark text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-accent/10 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มโครงการ
        </Link>
      </div>

      {/* ── Template list ── */}
      {templates.length === 0 ? (
        <div className="border-2 border-dashed border-white/10 rounded-2xl py-16 flex flex-col items-center gap-4 text-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
          <p className="text-sm font-semibold">ยังไม่มีข้อมูลโครงการ</p>
          <p className="text-xs text-center leading-relaxed">กด “เพิ่มโครงการ” เพื่อสร้างเทมเพลตโครงการใหม่<br />ที่จะ auto-fill พิกัดและสถานที่ใกล้เคียงในฟอร์มเพิ่มทรัพย์</p>
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
                <RowActionsMenu
                  label={`เมนูจัดการ ${t.name}`}
                  actions={[
                    expandedId === t.id
                      ? { label: "Hide", Icon: EyeOff, onSelect: () => setExpandedId(null) }
                      : { label: "View", Icon: Eye, onSelect: () => setExpandedId(t.id) },
                    { label: "Edit", Icon: Edit, href: `/${lang}/manage/projects/edit/${t.id}` },
                    { label: "Trash", Icon: Trash2, danger: true, disabled: deletingId === t.id, hint: deletingId === t.id ? "กำลังลบ..." : undefined, onSelect: () => handleDelete(t.id) },
                  ]}
                />
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
    </div>
  );
}
