"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, KeyRound, PenLine, Trash2, TrendingUp, Upload, UserRound } from "lucide-react";
import UserDealHistory from "@/components/UserDealHistory";
import type { DealRow } from "@/lib/actions/deal";
import SignaturePad from "@/components/SignaturePad";
import { resizeImage } from "@/lib/imageResize";
import SavingModal from "@/components/SavingModal";
import FormSectionNav, { FormSection } from "@/components/FormSectionNav";
import { updateUserAction, UserDocProfileInput, UserRoleValue } from "@/lib/actions/user";
import { formatNationalId, formatThaiPhone, isValidThaiNationalId } from "@/lib/format";
import { usePostcodeLookup } from "@/lib/usePostcodeLookup";

export interface UserFormValues {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: UserRoleValue;
  profile: UserDocProfileInput;
}

/** everyone who appears on a document as a party: agents and above, and landlords (owners) */
const DOCUMENT_ROLES: UserRoleValue[] = ["ADMIN", "MODERATOR", "AGENT", "LANDLORD"];
/** accounts that close deals */
const SALES_ROLES: UserRoleValue[] = ["ADMIN", "MODERATOR", "AGENT"];
const PREFIXES = ["นาย", "นาง", "นางสาว"];
const POSITIONS = ["ผู้ช่วยขาย", "ตัวแทนขาย", "ผู้จัดการฝ่ายขาย", "เจ้าของกิจการ"];

const ROLES: { value: UserRoleValue; label: string }[] = [
  { value: "ADMIN", label: "ผู้ดูแลระบบ (Admin)" },
  { value: "AGENT", label: "ตัวแทนขาย (Agent)" },
  { value: "MODERATOR", label: "ผู้ช่วยดูแล (Moderator)" },
  { value: "LANDLORD", label: "เจ้าของทรัพย์ (Landlord)" },
  { value: "USER", label: "ผู้ใช้ทั่วไป (User)" },
];

const ACCOUNT_SECTION: FormSection = { id: "sec-account", label: "Account", title: "ข้อมูลบัญชี", Icon: UserRound };
const DOCS_SECTION: FormSection = { id: "sec-docs", label: "Documents", title: "ข้อมูลสำหรับเอกสาร", Icon: FileText, important: true };
const SALES_SECTION: FormSection = { id: "sec-sales", label: "Sales", title: "ประวัติการปิดการขาย", Icon: TrendingUp };
const PASSWORD_SECTION: FormSection = { id: "sec-password", label: "Password", title: "รหัสผ่าน", Icon: KeyRound };

const inputCls =
  "w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent text-white placeholder-white/25 disabled:opacity-50 disabled:cursor-not-allowed";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const labelCls = "text-xs font-bold text-white/50 block";
const sectionCls = "text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2";

/** Admin form for editing another account — used by /manage/users/edit/[id] */
export default function UserForm({ lang, user, isSelf, deals }: { lang: string; user: UserFormValues; isSelf: boolean; deals: { ready: boolean; deals: DealRow[] } }) {
  const router = useRouter();
  const listHref = `/${lang}/manage/users`;
  const [form, setForm] = useState({ ...user, newPassword: "", confirmPassword: "" });
  const [profile, setProfile] = useState<UserDocProfileInput>({
    ...user.profile,
    phone: formatThaiPhone(user.profile.phone),
    nationalId: formatNationalId(user.profile.nationalId),
  });
  const setP = (key: keyof UserDocProfileInput, value: string) => setProfile((p) => ({ ...p, [key]: value }));

  const needsDocs = DOCUMENT_ROLES.includes(form.role);
  const hasSales = SALES_ROLES.includes(form.role);
  const sections = useMemo(
    () => [ACCOUNT_SECTION, ...(needsDocs ? [DOCS_SECTION] : []), ...(hasSales ? [SALES_SECTION] : []), PASSWORD_SECTION],
    [needsDocs, hasSales]
  );

  const lookup = usePostcodeLookup({ zipCode: profile.postCode, province: profile.province, district: profile.district, subdistrict: profile.subdistrict });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const copyIsPdf = /\.pdf($|\?)/i.test(profile.idCardCopyUrl);

  /** ID card copy: a photo (shrunk before upload) or a PDF */
  const uploadIdCopy = async (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    const isPdf = file.type === "application/pdf";
    if (!isPdf && !file.type.startsWith("image/")) {
      setUploadError("รองรับไฟล์รูปภาพ (JPG, PNG) หรือ PDF เท่านั้น");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", isPdf ? file : await resizeImage(file));
      fd.append("type", isPdf ? "document" : "image");
      fd.append("folder", "id-cards");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "อัปโหลดไม่สำเร็จ");
      setP("idCardCopyUrl", json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const [drawing, setDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");

  /** signature from the drawing pad (PNG) or an uploaded picture */
  const uploadSignature = async (file: File | undefined) => {
    if (!file) return;
    setSignError("");
    if (!file.type.startsWith("image/")) {
      setSignError("รองรับไฟล์รูปภาพ (PNG, JPG) เท่านั้น");
      return;
    }
    setSigning(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");
      fd.append("folder", "signatures");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "อัปโหลดไม่สำเร็จ");
      setP("signatureUrl", json.url);
      setDrawing(false);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "อัปโหลดลายเซ็นไม่สำเร็จ");
    } finally {
      setSigning(false);
    }
  };

  const idDigits = profile.nationalId.replace(/\D/g, "");
  const idInvalid = idDigits.length === 13 && !isValidThaiNationalId(idDigits);
  const [status, setStatus] = useState<"saving" | "success" | null>(null);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const fail = (text: string) => {
    setStatus(null);
    setError(text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) return fail("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
    if (needsDocs && idDigits && (idDigits.length !== 13 || idInvalid)) {
      return fail(idDigits.length !== 13 ? "เลขบัตรประชาชนต้องมี 13 หลัก" : "เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบหลักสุดท้าย)");
    }

    setStatus("saving");
    const res = await updateUserAction(user.id, {
      fullname: form.fullname,
      username: form.username,
      email: form.email,
      role: form.role,
      newPassword: form.newPassword || undefined,
      profile: needsDocs ? profile : undefined,
    });
    if (!res.success) return fail(res.error || "บันทึกข้อมูลไม่สำเร็จ");

    setStatus("success");
    setTimeout(() => {
      router.push(listHref);
      router.refresh();
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-6 items-start">
      <FormSectionNav sections={sections} onSave={(e) => e.currentTarget.form?.requestSubmit()} saving={status !== null} />

      <div className="bg-[#112240] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

        <section id="sec-account" className="space-y-4 scroll-mt-32">
          <h2 className={sectionCls}>ข้อมูลบัญชี</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>ชื่อ-นามสกุล</label>
              <input type="text" value={form.fullname} onChange={(e) => set("fullname", e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Username (ใช้เข้าสู่ระบบ) *</label>
              <input type="text" required value={form.username} onChange={(e) => set("username", e.target.value)} autoComplete="off" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>อีเมล</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>สิทธิ์การใช้งาน</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                disabled={isSelf}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                {ROLES.map((r) => (
                  <option key={r.value} className="bg-[#112240]" value={r.value}>{r.label}</option>
                ))}
              </select>
              {isSelf && <p className="text-xs text-white/40">เปลี่ยนสิทธิ์ของบัญชีตัวเองไม่ได้ เพื่อกันล็อกตัวเองออกจากหน้านี้</p>}
            </div>
          </div>
          <p className="text-xs text-white/40">การเปลี่ยนสิทธิ์มีผลเมื่อผู้ใช้เข้าสู่ระบบครั้งถัดไป</p>
        </section>

        {needsDocs && (
          <section id="sec-docs" className="space-y-4 scroll-mt-32">
            <h2 className={`${sectionCls} flex items-center`}>
              ข้อมูลสำหรับเอกสาร
              <span className="ml-2 text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 normal-case tracking-normal">ข้อมูลลับ</span>
            </h2>
            <p className="text-xs text-white/40">
              ใช้เติมข้อมูลคู่สัญญาในสัญญาแต่งตั้งนายหน้าและเอกสารอื่น — ผู้ใช้แก้เองได้ที่หน้าโปรไฟล์ของตัวเองเช่นกัน
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelCls}>คำนำหน้า</label>
                <select value={profile.prefix} onChange={(e) => setP("prefix", e.target.value)} className={selectCls}>
                  <option className="bg-[#112240]" value="">ไม่ระบุ</option>
                  {PREFIXES.map((p) => <option key={p} className="bg-[#112240]" value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-4">
                <label className={labelCls}>ตำแหน่ง</label>
                <input list="user-positions" value={profile.position} onChange={(e) => setP("position", e.target.value)} placeholder="เช่น ตัวแทนขาย" className={inputCls} />
                <datalist id="user-positions">{POSITIONS.map((p) => <option key={p} value={p} />)}</datalist>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>เบอร์โทร</label>
                <input type="text" inputMode="tel" value={profile.phone} onChange={(e) => setP("phone", formatThaiPhone(e.target.value))} placeholder="08x-xxx-xxxx" className={inputCls} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>LINE ID</label>
                <input type="text" value={profile.lineId} onChange={(e) => setP("lineId", e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>เลขบัตรประชาชน</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={profile.nationalId}
                  onChange={(e) => setP("nationalId", formatNationalId(e.target.value))}
                  placeholder="x-xxxx-xxxxx-xx-x"
                  autoComplete="off"
                  className={`${inputCls} font-mono tracking-wider ${idInvalid ? "border-red-500/60" : ""}`}
                />
                {idInvalid ? (
                  <p className="text-xs text-red-400">เลขบัตรไม่ถูกต้อง — ตรวจสอบอีกครั้ง</p>
                ) : idDigits.length === 13 ? (
                  <p className="text-xs text-accent">✓ เลขบัตรถูกต้อง</p>
                ) : null}
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-6">
                <span className={labelCls}>สำเนาบัตรประชาชน</span>
                <div className="flex flex-wrap items-center gap-4 bg-black/20 border border-dashed border-white/15 rounded-xl p-4">
                  {profile.idCardCopyUrl ? (
                    <a
                      href={profile.idCardCopyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="เปิดดูไฟล์เต็ม"
                      className="block w-40 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-accent transition-colors shrink-0"
                    >
                      {copyIsPdf ? (
                        <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-accent text-xs font-bold">
                          <FileText className="w-6 h-6" /> ไฟล์ PDF
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.idCardCopyUrl} alt="สำเนาบัตรประชาชน" className="w-full h-full object-cover" />
                      )}
                    </a>
                  ) : (
                    <span className="w-40 h-24 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-xs text-white/30 shrink-0">
                      ยังไม่มีไฟล์
                    </span>
                  )}
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <label
                        className={`h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-accent text-primary-dark text-xs font-black hover:bg-accent-dark transition-all ${
                          uploading ? "opacity-50 cursor-wait" : "cursor-pointer"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "กำลังอัปโหลด..." : profile.idCardCopyUrl ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="sr-only"
                          disabled={uploading}
                          onChange={(e) => {
                            uploadIdCopy(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {profile.idCardCopyUrl && (
                        <button
                          type="button"
                          onClick={() => setP("idCardCopyUrl", "")}
                          className="h-10 px-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/60 hover:text-red-400 hover:border-red-500/40 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> เอาออก
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">รูปถ่ายหรือสแกน (JPG, PNG) หรือไฟล์ PDF — กด “บันทึกข้อมูล” เพื่อเก็บไฟล์นี้ไว้กับบัญชี</p>
                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-6">
                <span className={labelCls}>ลายเซ็น</span>
                <div className="bg-black/20 border border-dashed border-white/15 rounded-xl p-4">
                  {drawing ? (
                    <SignaturePad busy={signing} onConfirm={uploadSignature} onCancel={() => setDrawing(false)} />
                  ) : (
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="w-60 h-24 rounded-lg bg-white border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {profile.signatureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.signatureUrl} alt="ลายเซ็น" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xs text-gray-400">ยังไม่มีลายเซ็น</span>
                        )}
                      </span>
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDrawing(true)}
                            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-accent text-primary-dark text-xs font-black hover:bg-accent-dark cursor-pointer"
                          >
                            <PenLine className="w-4 h-4" /> {profile.signatureUrl ? "เขียนลายเซ็นใหม่" : "เขียนลายเซ็น"}
                          </button>
                          <label
                            className={`h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold ${
                              signing ? "opacity-50 cursor-wait" : "cursor-pointer"
                            }`}
                          >
                            <Upload className="w-4 h-4" /> {signing ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="sr-only"
                              disabled={signing}
                              onChange={(e) => {
                                uploadSignature(e.target.files?.[0]);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {profile.signatureUrl && (
                            <button
                              type="button"
                              onClick={() => setP("signatureUrl", "")}
                              className="h-10 px-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/60 hover:text-red-400 hover:border-red-500/40 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" /> เอาออก
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">
                          เขียนบนจอด้วยเมาส์ นิ้ว หรือปากกา หรืออัปโหลดรูปลายเซ็น (PNG พื้นใสจะสวยที่สุด) — กด “บันทึกข้อมูล” เพื่อเก็บไว้กับบัญชี
                        </p>
                      </div>
                    </div>
                  )}
                  {signError && <p className="text-xs text-red-400 mt-2">{signError}</p>}
                </div>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-4">
                <label className={labelCls}>ที่อยู่ (บ้านเลขที่ / หมู่ / ซอย / ถนน)</label>
                <input type="text" value={profile.address} onChange={(e) => setP("address", e.target.value)} placeholder="เช่น 99/9 หมู่ 5 ซอยเอกชัย 1 ถนนเอกชัย" className={inputCls} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>รหัสไปรษณีย์</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={profile.postCode}
                  onChange={(e) => {
                    const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setProfile((p) => ({ ...p, postCode: zip, ...lookup.handleZipCodeChange(zip) }));
                  }}
                  placeholder="เช่น 74000"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>จังหวัด</label>
                {lookup.provinceOptions.length > 1 ? (
                  <select value={profile.province} onChange={(e) => setProfile((p) => ({ ...p, ...lookup.handleProvinceChange(e.target.value) }))} className={selectCls}>
                    <option className="bg-[#112240]" value="">เลือกจังหวัด</option>
                    {lookup.provinceOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={profile.province} onChange={(e) => setP("province", e.target.value)} placeholder="กรอกรหัสไปรษณีย์เพื่อเติมอัตโนมัติ" className={inputCls} />
                )}
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>อำเภอ / เขต</label>
                {lookup.districtOptions.length > 1 ? (
                  <select value={profile.district} onChange={(e) => setProfile((p) => ({ ...p, ...lookup.handleDistrictChange(e.target.value) }))} className={selectCls}>
                    <option className="bg-[#112240]" value="">เลือกอำเภอ / เขต</option>
                    {lookup.districtOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={profile.district} onChange={(e) => setP("district", e.target.value)} className={inputCls} />
                )}
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-2">
                <label className={labelCls}>ตำบล / แขวง</label>
                {lookup.subdistrictOptions.length > 1 ? (
                  <select value={profile.subdistrict} onChange={(e) => setP("subdistrict", e.target.value)} className={selectCls}>
                    <option className="bg-[#112240]" value="">เลือกตำบล / แขวง</option>
                    {lookup.subdistrictOptions.map((o) => <option key={o} className="bg-[#112240]" value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={profile.subdistrict} onChange={(e) => setP("subdistrict", e.target.value)} className={inputCls} />
                )}
              </div>
            </div>
          </section>
        )}

        {hasSales && (
          <section id="sec-sales" className="space-y-4 scroll-mt-32">
            <h2 className={sectionCls}>ประวัติการปิดการขาย</h2>
            <UserDealHistory userId={user.id} initialDeals={deals.deals} ready={deals.ready} />
          </section>
        )}

        <section id="sec-password" className="space-y-4 scroll-mt-32">
          <h2 className={sectionCls}>ตั้งรหัสผ่านใหม่</h2>
          <p className="text-xs text-white/40">เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
              <input type="password" value={form.newPassword} onChange={(e) => set("newPassword", e.target.value)} autoComplete="new-password" minLength={8} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>ยืนยันรหัสผ่านใหม่</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} autoComplete="new-password" className={inputCls} />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
          <Link href={listHref} className="px-6 h-11 inline-flex items-center bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white/70 hover:text-white transition-all">
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
      </div>

      <SavingModal status={status} successTitle="แก้ไขผู้ใช้สำเร็จ!" successText="กำลังกลับไปหน้ารายชื่อผู้ใช้งาน..." />
    </form>
  );
}
