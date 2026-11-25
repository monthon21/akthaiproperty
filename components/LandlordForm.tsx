"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createLandlordAction, updateLandlordDetailsAction } from "@/lib/actions/landlord";
import { formatThaiPhone, formatNationalId, isValidThaiNationalId } from "@/lib/format";
import SavingModal from "@/components/SavingModal";
import { AddressParts, EMPTY_ADDRESS, composeThaiAddress, hasAddressParts } from "@/lib/address";
import { usePostcodeLookup } from "@/lib/usePostcodeLookup";

export interface LandlordFormValues extends AddressParts {
  name: string;
  phone: string;
  line: string;
  fullname: string;
  detailPhone: string;
  idcard: string;
  email: string;
  detailLine: string;
  address: string;
}

export const EMPTY_LANDLORD: LandlordFormValues = {
  name: "",
  phone: "",
  line: "",
  fullname: "",
  detailPhone: "",
  idcard: "",
  email: "",
  detailLine: "",
  address: "",
  ...EMPTY_ADDRESS,
};

interface Props {
  lang: string;
  /** omit for a new landlord */
  landlordId?: number;
  initial?: LandlordFormValues;
  /** properties already linked to this landlord (edit page only) */
  assets?: { id: string; code: string; title?: string | null }[];
}

/** Thai national IDs (digits only) get the x-xxxx-xxxxx-xx-x mask; passports (with letters) are left as typed */
function formatIdCard(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  return /^\d*$/.test(compact) ? formatNationalId(compact) : value;
}

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent text-white placeholder-white/25";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const labelCls = "text-xs font-bold text-white/50 block";
const sectionCls = "text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2 flex items-center";

/** Create / edit form for a landlord (property owner) — used by /manage/landlord/new and /edit/[id] */
export default function LandlordForm({ lang, landlordId, initial = EMPTY_LANDLORD, assets = [] }: Props) {
  const router = useRouter();
  const isNew = landlordId === undefined;
  const listHref = `/${lang}/manage/landlord`;

  const [form, setForm] = useState<LandlordFormValues>({
    ...initial,
    phone: formatThaiPhone(initial.phone),
    detailPhone: formatThaiPhone(initial.detailPhone),
    idcard: formatIdCard(initial.idcard),
  });
  const [status, setStatus] = useState<"saving" | "success" | null>(null);
  const [error, setError] = useState("");

  const set = (key: keyof LandlordFormValues, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const lookup = usePostcodeLookup({
    zipCode: form.postCode,
    province: form.province,
    district: form.district,
    subdistrict: form.subdistrict,
  });
  const addressPreview = composeThaiAddress(form);
  // address saved before the fields were split: shown as a reference until the new fields are filled
  const legacyAddress = !hasAddressParts(form) ? initial.address.trim() : "";

  const idDigits = form.idcard.replace(/[\s-]/g, "");
  const isThaiId = idDigits !== "" && /^\d+$/.test(idDigits);
  const idInvalid = isThaiId && idDigits.length === 13 && !isValidThaiNationalId(idDigits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อเรียกเจ้าของทรัพย์");
      return;
    }
    if (isThaiId && (idDigits.length !== 13 || idInvalid)) {
      setError(idDigits.length !== 13 ? "เลขบัตรประชาชนต้องมี 13 หลัก" : "เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบหลักสุดท้าย)");
      return;
    }

    setStatus("saving");
    const payload = {
      ...form,
      idcard: isThaiId ? idDigits : form.idcard.trim(), // national IDs are stored as plain digits
      fullname: form.fullname || form.name,
      detailPhone: form.detailPhone || form.phone,
      detailLine: form.detailLine || form.line,
    };
    const res = isNew ? await createLandlordAction(payload) : await updateLandlordDetailsAction(landlordId, payload);

    if (!res.success) {
      setStatus(null);
      setError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
    <form onSubmit={handleSubmit} className="bg-[#112240] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
      )}

      <section className="space-y-4">
        <h2 className={sectionCls}>ข้อมูลติดต่อหลัก</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>ชื่อเรียก *</label>
            <input type="text" required autoFocus={isNew} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="เช่น คุณสมชาย" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>เบอร์โทรหลัก</label>
            <input type="text" inputMode="tel" value={form.phone} onChange={(e) => set("phone", formatThaiPhone(e.target.value))} placeholder="086-888-0196" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>LINE ID</label>
            <input type="text" value={form.line} onChange={(e) => set("line", e.target.value)} placeholder="เช่น somchai_line" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={sectionCls}>
          ข้อมูลสำหรับสัญญาและเอกสาร
          <span className="ml-2 text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 normal-case tracking-normal">
            ข้อมูลลับ
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>ชื่อ-นามสกุลตามบัตร</label>
            <input type="text" value={form.fullname} onChange={(e) => set("fullname", e.target.value)} placeholder="เช่น นายสมชาย อารีย์ดี" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>เลขบัตรประชาชน / พาสปอร์ต</label>
            <input
              type="text"
              value={form.idcard}
              onChange={(e) => set("idcard", formatIdCard(e.target.value))}
              placeholder="x-xxxx-xxxxx-xx-x"
              autoComplete="off"
              className={`${inputCls} font-mono tracking-wider ${idInvalid ? "border-red-500/60" : ""}`}
            />
            {idInvalid ? (
              <p className="text-xs text-red-400">เลขบัตรไม่ถูกต้อง — ตรวจสอบอีกครั้ง</p>
            ) : isThaiId && idDigits.length === 13 ? (
              <p className="text-xs text-accent">✓ เลขบัตรถูกต้อง</p>
            ) : !isThaiId && idDigits !== "" ? (
              <p className="text-xs text-white/40">เลขพาสปอร์ต — บันทึกตามที่พิมพ์</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>เบอร์โทรสำรอง</label>
            <input type="text" inputMode="tel" value={form.detailPhone} onChange={(e) => set("detailPhone", formatThaiPhone(e.target.value))} placeholder="ถ้ามี" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>อีเมล</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="somchai@example.com" className={inputCls} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>LINE ID สำรอง</label>
            <input type="text" value={form.detailLine} onChange={(e) => set("detailLine", e.target.value)} placeholder="ถ้ามี" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={sectionCls}>ที่อยู่ตามทะเบียนบ้าน</h2>
        {legacyAddress && (
          <p className="text-xs text-white/50 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 leading-relaxed">
            <span className="font-bold text-accent">ที่อยู่เดิม:</span> {legacyAddress}
            <span className="block text-white/35 mt-1">กรอกแยกช่องด้านล่างเพื่อใช้ออกเอกสาร — เมื่อบันทึกจะใช้ข้อมูลใหม่แทน</span>
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>บ้านเลขที่</label>
            <input type="text" value={form.houseNo} onChange={(e) => set("houseNo", e.target.value)} placeholder="เช่น 99/9" className={inputCls} />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <label className={labelCls}>หมู่ที่</label>
            <input type="text" inputMode="numeric" value={form.moo} onChange={(e) => set("moo", e.target.value)} placeholder="เช่น 5" className={inputCls} />
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-3">
            <label className={labelCls}>ชื่อโครงการ / หมู่บ้าน</label>
            <input type="text" value={form.village} onChange={(e) => set("village", e.target.value)} placeholder="เช่น เดอะแกรนด์ พระราม 2" className={inputCls} />
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-3">
            <label className={labelCls}>ซอย</label>
            <input type="text" value={form.soi} onChange={(e) => set("soi", e.target.value)} placeholder="เช่น เอกชัย 1" className={inputCls} />
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-3">
            <label className={labelCls}>ถนน</label>
            <input type="text" value={form.road} onChange={(e) => set("road", e.target.value)} placeholder="เช่น เอกชัย" className={inputCls} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>รหัสไปรษณีย์</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.postCode}
              onChange={(e) => {
                const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
                setForm((f) => ({ ...f, postCode: zip, ...lookup.handleZipCodeChange(zip) }));
              }}
              placeholder="เช่น 74000"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-4">
            <label className={labelCls}>จังหวัด</label>
            {lookup.provinceOptions.length > 1 ? (
              <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, ...lookup.handleProvinceChange(e.target.value) }))} className={selectCls}>
                <option className="bg-[#112240]" value="">เลือกจังหวัด</option>
                {lookup.provinceOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="กรอกรหัสไปรษณีย์เพื่อเติมอัตโนมัติ" className={inputCls} />
            )}
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-3">
            <label className={labelCls}>อำเภอ / เขต</label>
            {lookup.districtOptions.length > 1 ? (
              <select value={form.district} onChange={(e) => setForm((f) => ({ ...f, ...lookup.handleDistrictChange(e.target.value) }))} className={selectCls}>
                <option className="bg-[#112240]" value="">เลือกอำเภอ / เขต</option>
                {lookup.districtOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" value={form.district} onChange={(e) => set("district", e.target.value)} className={inputCls} />
            )}
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-3">
            <label className={labelCls}>ตำบล / แขวง</label>
            {lookup.subdistrictOptions.length > 1 ? (
              <select value={form.subdistrict} onChange={(e) => set("subdistrict", e.target.value)} className={selectCls}>
                <option className="bg-[#112240]" value="">เลือกตำบล / แขวง</option>
                {lookup.subdistrictOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" value={form.subdistrict} onChange={(e) => set("subdistrict", e.target.value)} className={inputCls} />
            )}
          </div>
        </div>
        {addressPreview && (
          <p className="text-xs text-white/50 leading-relaxed">
            <span className="font-bold text-white/70">ที่อยู่ที่จะแสดงในเอกสาร:</span> {addressPreview}
          </p>
        )}
      </section>

      {!isNew && (
        <section className="space-y-3">
          <h2 className={sectionCls}>ทรัพย์สินของเจ้าของท่านนี้ ({assets.length})</h2>
          {assets.length === 0 ? (
            <p className="text-sm text-white/40">ยังไม่มีทรัพย์สินที่เชื่อมกับเจ้าของท่านนี้</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/${lang}/property/list/${asset.code}`}
                    target="_blank"
                    className="flex justify-between items-center gap-3 bg-black/20 border border-white/5 hover:border-accent/40 px-4 py-3 rounded-xl transition-all text-sm"
                  >
                    <span className="min-w-0">
                      <span className="font-mono font-bold text-white">รหัส {asset.code}</span>
                      {asset.title && <span className="block text-xs text-white/40 truncate">{asset.title}</span>}
                    </span>
                    <span className="text-accent text-xs font-semibold shrink-0">เปิดดู →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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
          บันทึกข้อมูล
        </button>
      </div>

      <SavingModal
        status={status}
        successTitle={isNew ? "เพิ่มเจ้าของทรัพย์สำเร็จ!" : "แก้ไขข้อมูลสำเร็จ!"}
        successText="กำลังกลับไปหน้ารายชื่อเจ้าของทรัพย์..."
      />
    </form>
  );
}
