"use client";

import { useState } from "react";
import Image from "next/image";
import { updateMyProfileAction, AgentProfileInput } from "@/lib/actions/profile";
import { usePostcodeLookup } from "@/lib/usePostcodeLookup";
import {
  formatNationalId,
  formatThaiDate,
  formatThaiPhone,
  isValidThaiNationalId,
} from "@/lib/format";
import SavingModal from "@/components/SavingModal";
import { PROFILE_SAVE_BUTTON_ID } from "@/components/ProfileShortcutNav";
import SignaturePad from "@/components/SignaturePad";

export type AgentProfileValues = Required<{ [K in keyof AgentProfileInput]: string }>;

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white";
const labelCls = "text-[10px] font-bold text-white/40 uppercase tracking-widest block";

const PREFIXES = ["นาย", "นาง", "นางสาว"];
const POSITIONS = ["ผู้ช่วยขาย", "ตัวแทนขาย", "ผู้จัดการฝ่ายขาย", "เจ้าของกิจการ"];
const BANKS = [
  "ธนาคารกสิกรไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงเทพ",
  "ธนาคารกรุงไทย",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารทหารไทยธนชาต (ttb)",
  "ธนาคารออมสิน",
  "ธนาคารยูโอบี",
  "ธนาคารซีไอเอ็มบี ไทย",
  "ธนาคารเกียรตินาคินภัทร",
];

function Field({ label, hint, children, span2 }: { label: string; hint?: React.ReactNode; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1.5 ${span2 ? "md:col-span-2" : ""}`}>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 scroll-mt-32">
      <h3 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
        {title}
        {subtitle && <span className="text-white/30 normal-case tracking-normal font-normal ml-2">{subtitle}</span>}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </section>
  );
}

function ageFrom(iso: string) {
  if (!iso) return null;
  const b = new Date(`${iso}T00:00:00`);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--;
  return age;
}

/** Sales assistant / agent details used on rental & sale documents */
export default function AgentProfileForm({ initial }: { initial: AgentProfileValues }) {
  const [form, setForm] = useState<AgentProfileValues>({
    ...initial,
    nationalId: formatNationalId(initial.nationalId),
    phone: formatThaiPhone(initial.phone),
  });
  const [status, setStatus] = useState<"saving" | "success" | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [drawingSignature, setDrawingSignature] = useState(false);

  const set = (key: keyof AgentProfileValues, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const lookup = usePostcodeLookup({
    zipCode: form.postCode,
    province: form.province,
    district: form.district,
    subdistrict: form.subdistrict,
  });

  const idDigits = form.nationalId.replace(/\D/g, "");
  const idInvalid = idDigits.length === 13 && !isValidThaiNationalId(idDigits);
  const age = ageFrom(form.birthDate);

  const handleSignature = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "อัปโหลดไม่สำเร็จ");
      set("signatureUrl", json.url);
      setDrawingSignature(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดลายเซ็นไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError("");
    if (idDigits && idDigits.length !== 13) {
      setError("เลขบัตรประชาชนต้องมี 13 หลัก");
      return;
    }
    if (idInvalid) {
      setError("เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบหลักสุดท้าย)");
      return;
    }
    setStatus("saving");
    const res = await updateMyProfileAction(form);
    if (!res.success) {
      setStatus(null);
      setError(res.error || "บันทึกไม่สำเร็จ");
      return;
    }
    setStatus("success");
    setTimeout(() => setStatus(null), 1200);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-[11px] text-white/60 leading-relaxed">
        <span className="text-accent font-bold shrink-0">ใช้ออกเอกสาร</span>
        ข้อมูลนี้จะถูกใช้ในสัญญาเช่า / สัญญาจะซื้อจะขาย / ใบรับเงิน ในฐานะผู้ทำรายการ — เห็นได้เฉพาะเจ้าของบัญชี
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
      )}

      <Section id="sec-personal" title="ข้อมูลส่วนตัว" subtitle="ตามบัตรประชาชน">
        <Field label="คำนำหน้า">
          <select value={form.prefix} onChange={(e) => set("prefix", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
            <option className="bg-[#112240]" value="">ไม่ระบุ</option>
            {PREFIXES.map((p) => (
              <option key={p} className="bg-[#112240]" value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="ตำแหน่ง">
          <input list="agent-positions" value={form.position} onChange={(e) => set("position", e.target.value)} className={inputCls} placeholder="e.g. ผู้ช่วยขาย" />
          <datalist id="agent-positions">
            {POSITIONS.map((p) => <option key={p} value={p} />)}
          </datalist>
        </Field>
        <Field label="ชื่อ-นามสกุล (ไทย) *">
          <input value={form.fullname} onChange={(e) => set("fullname", e.target.value)} className={inputCls} placeholder="e.g. สมชาย ใจดี" />
        </Field>
        <Field label="ชื่อ-นามสกุล (อังกฤษ)">
          <input value={form.fullnameEn} onChange={(e) => set("fullnameEn", e.target.value)} className={inputCls} placeholder="e.g. Somchai Jaidee" />
        </Field>
        <Field
          label="เลขบัตรประชาชน"
          hint={
            idInvalid ? <span className="text-red-400">เลขไม่ถูกต้อง — ตรวจสอบอีกครั้ง</span>
              : idDigits.length === 13 ? <span className="text-accent">✓ เลขบัตรถูกต้อง</span>
              : undefined
          }
        >
          <input
            inputMode="numeric"
            value={form.nationalId}
            onChange={(e) => set("nationalId", formatNationalId(e.target.value))}
            className={`${inputCls} font-mono tracking-wider ${idInvalid ? "border-red-500/60" : ""}`}
            placeholder="x-xxxx-xxxxx-xx-x"
            autoComplete="off"
          />
        </Field>
        <Field label="วันหมดอายุบัตร" hint={form.idCardExpiry && formatThaiDate(form.idCardExpiry)}>
          <input type="date" value={form.idCardExpiry} onChange={(e) => set("idCardExpiry", e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
        </Field>
        <Field
          label="วันเดือนปีเกิด"
          hint={form.birthDate && `${formatThaiDate(form.birthDate)}${age !== null ? ` · อายุ ${age} ปี` : ""}`}
        >
          <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
        </Field>
        <Field label="สัญชาติ">
          <input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className={inputCls} placeholder="ไทย" />
        </Field>
      </Section>

      <Section id="sec-address" title="ที่อยู่ตามบัตรประชาชน">
        <Field label="บ้านเลขที่ / หมู่ / ซอย / ถนน" span2>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="e.g. 99/9 หมู่ 5 ซอยเอกชัย 1 ถนนเอกชัย" />
        </Field>
        <Field label="รหัสไปรษณีย์">
          <input
            inputMode="numeric"
            value={form.postCode}
            onChange={(e) => {
              const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
              setForm((f) => ({ ...f, postCode: zip, ...lookup.handleZipCodeChange(zip) }));
            }}
            className={inputCls}
            placeholder="e.g. 10150 (เติมจังหวัด/อำเภอให้อัตโนมัติ)"
          />
        </Field>
        <Field label="จังหวัด">
          {lookup.provinceOptions.length > 1 ? (
            <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, ...lookup.handleProvinceChange(e.target.value) }))} className={`${inputCls} appearance-none cursor-pointer`}>
              <option className="bg-[#112240]" value="">เลือกจังหวัด</option>
              {lookup.provinceOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
            </select>
          ) : (
            <input value={form.province} onChange={(e) => set("province", e.target.value)} className={inputCls} />
          )}
        </Field>
        <Field label="อำเภอ / เขต">
          {lookup.districtOptions.length > 1 ? (
            <select value={form.district} onChange={(e) => setForm((f) => ({ ...f, ...lookup.handleDistrictChange(e.target.value) }))} className={`${inputCls} appearance-none cursor-pointer`}>
              <option className="bg-[#112240]" value="">เลือกอำเภอ / เขต</option>
              {lookup.districtOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
            </select>
          ) : (
            <input value={form.district} onChange={(e) => set("district", e.target.value)} className={inputCls} />
          )}
        </Field>
        <Field label="ตำบล / แขวง">
          {lookup.subdistrictOptions.length > 1 ? (
            <select value={form.subdistrict} onChange={(e) => set("subdistrict", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
              <option className="bg-[#112240]" value="">เลือกตำบล / แขวง</option>
              {lookup.subdistrictOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
            </select>
          ) : (
            <input value={form.subdistrict} onChange={(e) => set("subdistrict", e.target.value)} className={inputCls} />
          )}
        </Field>
      </Section>

      <Section id="sec-contact" title="ข้อมูลติดต่อ">
        <Field label="เบอร์โทรศัพท์">
          <input inputMode="tel" value={form.phone} onChange={(e) => set("phone", formatThaiPhone(e.target.value))} className={inputCls} placeholder="e.g. 086-888-0196" />
        </Field>
        <Field label="LINE ID">
          <input value={form.lineId} onChange={(e) => set("lineId", e.target.value)} className={inputCls} placeholder="e.g. @akproperty" />
        </Field>
      </Section>

      <Section id="sec-bank" title="บัญชีรับค่าคอมมิชชั่น">
        <Field label="ธนาคาร">
          <input list="agent-banks" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputCls} placeholder="เลือกหรือพิมพ์ชื่อธนาคาร" />
          <datalist id="agent-banks">
            {BANKS.map((b) => <option key={b} value={b} />)}
          </datalist>
        </Field>
        <Field label="เลขที่บัญชี">
          <input inputMode="numeric" value={form.bankAccountNo} onChange={(e) => set("bankAccountNo", e.target.value.replace(/[^\d-]/g, ""))} className={`${inputCls} font-mono`} placeholder="e.g. 123-4-56789-0" />
        </Field>
        <Field label="ชื่อบัญชี" span2>
          <input value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} className={inputCls} placeholder="ตรงกับหน้าสมุดบัญชี" />
        </Field>
      </Section>

      <Section id="sec-signature" title="ลายเซ็น" subtitle="สำหรับพิมพ์ลงเอกสาร PDF">
        {drawingSignature ? (
          <div className="md:col-span-2">
            <SignaturePad busy={uploading} onConfirm={handleSignature} onCancel={() => setDrawingSignature(false)} />
          </div>
        ) : (
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="w-60 h-24 rounded-xl border border-dashed border-white/15 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {form.signatureUrl ? (
                <Image src={form.signatureUrl} alt="ลายเซ็น" width={240} height={96} className="object-contain w-full h-full" unoptimized />
              ) : (
                <span className="text-[11px] text-gray-400">ยังไม่มีลายเซ็น</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDrawingSignature(true)}
                  className="h-10 px-4 rounded-xl bg-accent text-primary-dark text-xs font-black hover:bg-accent-dark cursor-pointer"
                >
                  ✍️ {form.signatureUrl ? "เขียนลายเซ็นใหม่" : "เขียนลายเซ็น"}
                </button>
                <label className="inline-flex h-10 px-4 items-center rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold cursor-pointer">
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={(e) => handleSignature(e.target.files?.[0])} />
                </label>
              </div>
              {form.signatureUrl && (
                <button type="button" onClick={() => set("signatureUrl", "")} className="block text-[11px] text-white/40 hover:text-red-400 cursor-pointer">
                  ลบลายเซ็น
                </button>
              )}
              <p className="text-[11px] text-white/40">เขียนบนจอได้เลย หรืออัปโหลดรูปลายเซ็น (PNG พื้นใสจะสวยที่สุด) — อย่าลืมกดบันทึกด้านล่าง</p>
            </div>
          </div>
        )}
      </Section>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          id={PROFILE_SAVE_BUTTON_ID}
          onClick={save}
          disabled={status === "saving" || uploading}
          className="px-10 h-11 bg-accent text-primary-dark rounded-xl font-black text-xs tracking-widest uppercase hover:bg-accent-dark transition-all shadow-lg disabled:opacity-50 cursor-pointer"
        >
          บันทึกข้อมูลผู้ช่วยขาย
        </button>
      </div>

      <SavingModal status={status} successTitle="บันทึกข้อมูลเรียบร้อย" successText="พร้อมใช้ออกเอกสาร" />
    </div>
  );
}
