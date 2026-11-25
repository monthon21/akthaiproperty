"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createDealAction, deleteDealAction, DealRow } from "@/lib/actions/deal";
import { DATE_LOCALE, formatDecimalInput, formatNumber, formatThaiPhone } from "@/lib/format";

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent text-white placeholder-white/25";
const labelCls = "text-xs font-bold text-white/50 block";

const DATE = new Intl.DateTimeFormat(DATE_LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const emptyDraft = () => ({ kind: "sale" as "sale" | "rent", assetCode: "", customerName: "", customerPhone: "", price: "", commission: "", closedAt: today(), note: "" });

/** Closed sales / rentals of one agent: totals, list, and a small form to record a new one */
export default function UserDealHistory({ userId, initialDeals, ready }: { userId: number; initialDeals: DealRow[]; ready: boolean }) {
  const [deals, setDeals] = useState(initialDeals);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof ReturnType<typeof emptyDraft>, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const sum = (pick: (d: DealRow) => number | null, kind?: "sale" | "rent") =>
    deals.filter((d) => !kind || d.kind === kind).reduce((n, d) => n + (pick(d) ?? 0), 0);

  const add = async () => {
    setError("");
    setBusy(true);
    const res = await createDealAction(userId, draft);
    setBusy(false);
    if (!res.success) return setError(res.error);
    setDeals((prev) => [res.deal, ...prev].sort((a, b) => b.closedAt.localeCompare(a.closedAt)));
    setDraft(emptyDraft());
    setAdding(false);
  };

  const remove = async (deal: DealRow) => {
    if (!confirm(`ลบรายการปิดดีลทรัพย์ ${deal.assetCode} (${DATE.format(new Date(deal.closedAt))}) ?`)) return;
    setBusy(true);
    const res = await deleteDealAction(deal.id);
    setBusy(false);
    if (!res.success) return setError(res.error || "ลบรายการไม่สำเร็จ");
    setDeals((prev) => prev.filter((d) => d.id !== deal.id));
  };

  if (!ready) {
    return (
      <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 leading-relaxed">
        ยังใช้งานส่วนนี้ไม่ได้ — ต้องเพิ่มตารางดีลในฐานข้อมูลก่อน (รัน <code className="font-mono">npx prisma db push</code> แล้วเปิด dev server ใหม่)
      </p>
    );
  }

  const stats = [
    { label: "ปิดดีลทั้งหมด", value: `${deals.length} ดีล`, sub: `ขาย ${deals.filter((d) => d.kind === "sale").length} · เช่า ${deals.filter((d) => d.kind === "rent").length}` },
    { label: "มูลค่าขายรวม", value: `${formatNumber(sum((d) => d.price, "sale"))} บาท`, sub: "เฉพาะดีลขาย" },
    { label: "ค่านายหน้ารวม", value: `${formatNumber(sum((d) => d.commission))} บาท`, sub: "ขายและเช่า" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-black/20 border border-white/5 rounded-xl px-4 py-3">
            <p className="text-[11px] font-bold text-white/40">{s.label}</p>
            <p className="text-lg font-black text-accent leading-tight mt-1">{s.value}</p>
            <p className="text-[11px] text-white/30">{s.sub}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

      {adding ? (
        <div className="bg-black/20 border border-accent/30 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-2">
              <span className={labelCls}>ประเภท</span>
              <div className="grid grid-cols-2 gap-2">
                {(["sale", "rent"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set("kind", k)}
                    className={`h-11 rounded-xl border-2 text-sm font-black cursor-pointer transition-all ${
                      draft.kind === k ? "bg-accent border-accent text-primary-dark" : "border-white/15 text-white/60 hover:border-accent/50"
                    }`}
                  >
                    {k === "sale" ? "ขาย" : "เช่า"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelCls}>รหัสทรัพย์ *</label>
              <input value={draft.assetCode} onChange={(e) => set("assetCode", e.target.value)} placeholder="เช่น 26046" className={`${inputCls} font-mono`} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelCls}>วันที่ปิดดีล *</label>
              <input type="date" value={draft.closedAt} onChange={(e) => set("closedAt", e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-3">
              <label className={labelCls}>{draft.kind === "sale" ? "ราคาขายที่ตกลง (บาท)" : "ค่าเช่าต่อเดือน (บาท)"}</label>
              <input inputMode="numeric" value={draft.price} onChange={(e) => set("price", formatDecimalInput(e.target.value))} className={inputCls} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-3">
              <label className={labelCls}>ค่านายหน้าที่ได้รับ (บาท)</label>
              <input inputMode="numeric" value={draft.commission} onChange={(e) => set("commission", formatDecimalInput(e.target.value))} className={inputCls} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-3">
              <label className={labelCls}>{draft.kind === "sale" ? "ผู้ซื้อ" : "ผู้เช่า"}</label>
              <input value={draft.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="ชื่อ-นามสกุล" className={inputCls} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-3">
              <label className={labelCls}>เบอร์โทรลูกค้า</label>
              <input inputMode="tel" value={draft.customerPhone} onChange={(e) => set("customerPhone", formatThaiPhone(e.target.value))} placeholder="08x-xxx-xxxx" className={inputCls} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-6">
              <label className={labelCls}>หมายเหตุ</label>
              <input value={draft.note} onChange={(e) => set("note", e.target.value)} placeholder="เช่น สัญญาเช่า 1 ปี, โอนวันที่..." className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setAdding(false); setError(""); }} disabled={busy} className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 cursor-pointer">
              ยกเลิก
            </button>
            <button type="button" onClick={add} disabled={busy} className="h-10 px-6 rounded-xl bg-accent text-primary-dark text-xs font-black hover:bg-accent-dark disabled:opacity-50 cursor-pointer">
              {busy ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>
          </div>
          <p className="text-[11px] text-white/40">รายการนี้บันทึกทันทีเมื่อกด “บันทึกรายการ” ไม่ต้องกด Save ของหน้า</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มรายการปิดการขาย
        </button>
      )}

      {deals.length === 0 ? (
        <p className="text-sm text-white/40">ยังไม่มีประวัติการปิดการขาย</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#233554]/50 text-white/50 text-xs">
              <tr>
                <th className="px-4 py-3 font-bold">วันที่ปิด</th>
                <th className="px-4 py-3 font-bold">ประเภท</th>
                <th className="px-4 py-3 font-bold">ทรัพย์</th>
                <th className="px-4 py-3 font-bold">ลูกค้า</th>
                <th className="px-4 py-3 font-bold text-right">ราคา</th>
                <th className="px-4 py-3 font-bold text-right">ค่านายหน้า</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02]" title={d.note || undefined}>
                  <td className="px-4 py-3 text-white/70">{DATE.format(new Date(d.closedAt))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${d.kind === "sale" ? "text-accent bg-accent/10 border-accent/30" : "text-sky-300 bg-sky-500/10 border-sky-500/30"}`}>
                      {d.kind === "sale" ? "ขาย" : "เช่า"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-white">{d.assetCode}</span>
                    {d.assetTitle && <span className="block text-xs text-white/40 max-w-[260px] truncate">{d.assetTitle}</span>}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {d.customerName || "-"}
                    {d.customerPhone && <span className="block text-xs text-white/40">{d.customerPhone}</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {d.price !== null ? formatNumber(d.price) : "-"}
                    {d.price !== null && d.kind === "rent" && <span className="text-xs text-white/40"> /เดือน</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-accent font-bold">{d.commission !== null ? formatNumber(d.commission) : "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(d)} disabled={busy} title="ลบรายการ" aria-label="ลบรายการ" className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
