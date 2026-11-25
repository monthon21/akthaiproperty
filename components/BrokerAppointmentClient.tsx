"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Search } from "lucide-react";
import { DATE_LOCALE, formatDecimalInput, formatNationalId, formatNumber, formatThaiPhone, stripCommas } from "@/lib/format";
import { bahtText } from "@/lib/bahtText";

export interface BrokerDocData {
  asset: {
    code: string;
    isSell: boolean;
    isRent: boolean;
    sellPrice: number | null;
    rentPrice: number | null;
    /** e.g. "บ้านเดี่ยว โครงการ The Grand Rama 2" */
    summary: string;
    address: string;
    landSize: string;
    usableArea: string;
  } | null;
  owner: { fullname: string; idcard: string; address: string; phone: string } | null;
  agent: { fullname: string; idcard: string; address: string; phone: string; signatureUrl: string };
}

type Deal = "sale" | "rent";
type CommissionType = "percent" | "months" | "fixed";

const inputCls =
  "w-full h-10 bg-black/45 border border-white/10 rounded-xl px-3 text-sm focus:outline-none focus:border-accent text-white placeholder-white/25";
const labelCls = "text-[11px] font-bold text-white/50 block mb-1";
const groupCls = "text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** "2026-11-25" -> "25 พฤศจิกายน 2026" (ค.ศ.) */
const longDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "long", year: "numeric" });
};

const addMonths = (iso: string, months: number) => {
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime()) || !months) return "";
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1); // a 6-month term from 25 Nov ends on 24 May
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Filled value, or a dotted blank to write on by hand */
function Fill({ value, width = "10rem" }: { value?: string | null; width?: string }) {
  const text = (value ?? "").trim();
  if (text) return <span className="font-semibold">{text}</span>;
  return <span className="inline-block align-baseline border-b border-dotted border-gray-500" style={{ width }}>&nbsp;</span>;
}

/** Broker appointment agreement: editable fields on the left, the A4 document on the right */
export default function BrokerAppointmentClient({ lang, data }: { lang: string; data: BrokerDocData }) {
  const router = useRouter();
  const { asset } = data;

  const [code, setCode] = useState(asset?.code ?? "");
  const [f, setF] = useState(() => {
    const deal: Deal = asset && !asset.isSell && asset.isRent ? "rent" : "sale";
    const price = deal === "sale" ? asset?.sellPrice : asset?.rentPrice;
    return {
      deal,
      exclusive: false,
      price: price ? formatDecimalInput(String(price)) : "",
      commissionType: (deal === "sale" ? "percent" : "months") as CommissionType,
      commissionValue: deal === "sale" ? "3" : "1",
      startDate: today(),
      termMonths: "6",
      tailDays: "90",
      signPlace: "",
      signDate: today(),
      company: "AK Thai Property",
      ownerName: data.owner?.fullname ?? "",
      ownerId: data.owner?.idcard ?? "",
      ownerAddress: data.owner?.address ?? "",
      ownerPhone: formatThaiPhone(data.owner?.phone ?? ""),
      agentName: data.agent.fullname,
      agentId: data.agent.idcard,
      agentAddress: data.agent.address,
      agentPhone: formatThaiPhone(data.agent.phone),
      propertySummary: asset?.summary ?? "",
      propertyAddress: asset?.address ?? "",
      deedNo: "",
      landSize: asset?.landSize ?? "",
      usableArea: asset?.usableArea ?? "",
      showSignature: false,
    };
  });
  const set = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => setF((prev) => ({ ...prev, [key]: value }));

  const switchDeal = (deal: Deal) => {
    const price = deal === "sale" ? asset?.sellPrice : asset?.rentPrice;
    setF((prev) => ({
      ...prev,
      deal,
      price: price ? formatDecimalInput(String(price)) : "",
      commissionType: deal === "sale" ? "percent" : "months",
      commissionValue: deal === "sale" ? "3" : "1",
    }));
  };

  const isSale = f.deal === "sale";
  const priceNum = Number(stripCommas(f.price)) || 0;
  const commissionNum = Number(stripCommas(f.commissionValue)) || 0;
  const endDate = addMonths(f.startDate, Number(f.termMonths) || 0);
  const dealWord = isSale ? "ขาย" : "ให้เช่า";
  const counterparty = isSale ? "ผู้ซื้อ" : "ผู้เช่า";

  const commissionText =
    !commissionNum
      ? ""
      : f.commissionType === "percent"
        ? `ร้อยละ ${formatNumber(commissionNum)} (${formatNumber(commissionNum)}%) ของ${isSale ? "ราคาขายที่ตกลงซื้อขายกันจริง" : "ค่าเช่ารวมตลอดอายุสัญญาเช่า"}`
        : f.commissionType === "months"
          ? `เท่ากับค่าเช่า ${formatNumber(commissionNum)} เดือน ต่อสัญญาเช่าระยะเวลา 1 ปี (คำนวณตามสัดส่วนหากระยะเวลาเช่าต่างจากนี้)`
          : `เป็นเงินจำนวน ${formatNumber(commissionNum)} บาท (${bahtText(commissionNum)})`;

  const openAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (c) router.push(`/${lang}/manage/documents/broker-appointment?asset=${encodeURIComponent(c)}`);
  };

  const field = (label: string, key: keyof typeof f, opts: { placeholder?: string; format?: (v: string) => string; type?: string } = {}) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={opts.type ?? "text"}
        value={String(f[key])}
        onChange={(e) => set(key, (opts.format ? opts.format(e.target.value) : e.target.value) as never)}
        placeholder={opts.placeholder}
        className={`${inputCls} ${opts.type === "date" ? "[color-scheme:dark]" : ""}`}
      />
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6 items-start print:block">
      {/* ── Fields (not printed) ── */}
      <div className="print:hidden space-y-5 bg-[#112240] border border-white/10 rounded-2xl p-5 mb-6 lg:mb-0">
        <form onSubmit={openAsset} className="space-y-1">
          <label className={labelCls}>รหัสทรัพย์</label>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="เช่น 26046" className={`${inputCls} font-mono`} />
            <button type="submit" className="h-10 px-4 shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold cursor-pointer">
              <Search className="w-4 h-4" /> ดึงข้อมูล
            </button>
          </div>
          {!asset && <p className="text-xs text-white/40 pt-1">ใส่รหัสทรัพย์เพื่อเติมข้อมูลทรัพย์และเจ้าของอัตโนมัติ หรือกรอกเองด้านล่าง</p>}
          {asset && !data.owner && (
            <p className="text-xs text-amber-400 pt-1">
              ทรัพย์นี้ยังไม่ได้ระบุเจ้าของ — กรอกเอง หรือ{" "}
              <Link href={`/${lang}/edit/${asset.code}`} className="underline">ไปผูกเจ้าของที่หน้าแก้ไขทรัพย์</Link>
            </p>
          )}
        </form>

        <div className="space-y-3">
          <h2 className={groupCls}>ประเภทการแต่งตั้ง</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["sale", "rent"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => switchDeal(d)}
                className={`h-10 rounded-xl border-2 text-sm font-black cursor-pointer transition-all ${
                  f.deal === d ? "bg-accent border-accent text-primary-dark" : "border-white/15 text-white/60 hover:border-accent/50"
                }`}
              >
                {d === "sale" ? "ขาย" : "ให้เช่า"}
              </button>
            ))}
          </div>
          <label className="flex items-start gap-2 text-xs text-white/70 cursor-pointer">
            <input type="checkbox" checked={f.exclusive} onChange={(e) => set("exclusive", e.target.checked)} className="mt-0.5 accent-[#BEAF87]" />
            <span>แต่งตั้งแบบผูกขาด (Exclusive) — เจ้าของไม่แต่งตั้งนายหน้ารายอื่นในช่วงสัญญา</span>
          </label>
          {field(isSale ? "ราคาขายที่ตั้งไว้ (บาท)" : "ค่าเช่าต่อเดือน (บาท)", "price", { format: formatDecimalInput })}
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <div>
              <label className={labelCls}>ค่านายหน้า</label>
              <select value={f.commissionType} onChange={(e) => set("commissionType", e.target.value as CommissionType)} className={`${inputCls} appearance-none cursor-pointer`}>
                <option className="bg-[#112240]" value="percent">เป็นร้อยละ (%)</option>
                {!isSale && <option className="bg-[#112240]" value="months">เป็นจำนวนเดือนของค่าเช่า</option>}
                <option className="bg-[#112240]" value="fixed">เป็นจำนวนเงิน (บาท)</option>
              </select>
            </div>
            {field("จำนวน", "commissionValue", { format: formatDecimalInput })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={groupCls}>ระยะเวลา</h2>
          <div className="grid grid-cols-2 gap-2">
            {field("วันเริ่มสัญญา", "startDate", { type: "date" })}
            {field("อายุสัญญา (เดือน)", "termMonths", { format: (v) => v.replace(/\D/g, "").slice(0, 3) })}
          </div>
          {field("คุ้มครองค่านายหน้าหลังสิ้นสุดสัญญา (วัน)", "tailDays", { format: (v) => v.replace(/\D/g, "").slice(0, 3) })}
          <div className="grid grid-cols-2 gap-2">
            {field("ทำที่", "signPlace", { placeholder: "เช่น สมุทรสาคร" })}
            {field("วันที่ทำสัญญา", "signDate", { type: "date" })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={groupCls}>เจ้าของทรัพย์ (ผู้ให้สัญญา)</h2>
          {field("ชื่อ-นามสกุล", "ownerName")}
          {field("เลขบัตรประชาชน / พาสปอร์ต", "ownerId")}
          {field("ที่อยู่", "ownerAddress")}
          {field("โทรศัพท์", "ownerPhone", { format: formatThaiPhone })}
        </div>

        <div className="space-y-3">
          <h2 className={groupCls}>นายหน้า (ผู้รับสัญญา)</h2>
          {field("ในนาม (บริษัท / ร้าน)", "company")}
          {field("ชื่อ-นามสกุล ผู้รับมอบหมาย", "agentName")}
          {field("เลขบัตรประชาชน", "agentId")}
          {field("ที่อยู่", "agentAddress")}
          {field("โทรศัพท์", "agentPhone", { format: formatThaiPhone })}
          {data.agent.signatureUrl ? (
            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
              <input type="checkbox" checked={f.showSignature} onChange={(e) => set("showSignature", e.target.checked)} className="accent-[#BEAF87]" />
              ใส่ลายเซ็นของฉันในช่องนายหน้า
            </label>
          ) : (
            <p className="text-xs text-white/40">
              ยังไม่มีลายเซ็นในโปรไฟล์ — <Link href={`/${lang}/myprofile`} className="underline">เพิ่มที่หน้าโปรไฟล์</Link> หรือเซ็นด้วยมือหลังพิมพ์
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className={groupCls}>ทรัพย์สิน</h2>
          {field("ประเภท / โครงการ", "propertySummary")}
          {field("ที่ตั้ง", "propertyAddress")}
          {field("โฉนดที่ดินเลขที่", "deedNo", { placeholder: "เว้นว่างเพื่อเขียนเอง" })}
          <div className="grid grid-cols-2 gap-2">
            {field("เนื้อที่ดิน", "landSize")}
            {field("พื้นที่ใช้สอย", "usableArea")}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-primary-dark font-black text-sm shadow-lg shadow-accent/20 hover:bg-accent-dark transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-[18px] h-[18px]" /> พิมพ์ / บันทึกเป็น PDF
        </button>
        <p className="text-[11px] text-white/40 leading-relaxed">
          ในหน้าต่างพิมพ์ เลือกปลายทาง “บันทึกเป็น PDF” ขนาด A4 และปิด “หัวกระดาษและท้ายกระดาษ” ช่องที่เว้นว่างจะพิมพ์เป็นเส้นประให้เขียนเอง
        </p>
      </div>

      {/* ── The document ── */}
      <div className="overflow-x-auto print:overflow-visible">
        <article className="print-area bg-white text-gray-900 mx-auto w-[210mm] max-w-none min-h-[297mm] px-[18mm] py-[16mm] rounded-sm shadow-2xl text-[13.5px] leading-[1.75]">
          <h1 className="text-center text-xl font-black">สัญญาแต่งตั้งนายหน้า{dealWord}อสังหาริมทรัพย์</h1>
          <p className="text-center text-xs text-gray-500 mb-5">({f.exclusive ? "แบบผูกขาด / Exclusive" : "แบบไม่ผูกขาด / Open"})</p>

          <p className="text-right">ทำที่ <Fill value={f.signPlace} width="12rem" /></p>
          <p className="text-right mb-4">วันที่ <Fill value={longDate(f.signDate)} width="12rem" /></p>

          <p className="indent-10">
            สัญญาฉบับนี้ทำขึ้นระหว่าง <Fill value={f.ownerName} width="16rem" /> ถือบัตรประจำตัวประชาชน/หนังสือเดินทางเลขที่{" "}
            <Fill value={/^\d{13}$/.test(f.ownerId.replace(/\D/g, "")) && !/[a-z]/i.test(f.ownerId) ? formatNationalId(f.ownerId) : f.ownerId} width="11rem" /> อยู่ที่{" "}
            <Fill value={f.ownerAddress} width="24rem" /> โทรศัพท์ <Fill value={f.ownerPhone} width="8rem" /> ซึ่งต่อไปในสัญญานี้เรียกว่า{" "}
            <b>“เจ้าของทรัพย์”</b> ฝ่ายหนึ่ง
          </p>
          <p className="indent-10">
            กับ <Fill value={f.company} width="12rem" /> โดย <Fill value={f.agentName} width="14rem" /> ถือบัตรประจำตัวประชาชนเลขที่{" "}
            <Fill value={f.agentId ? formatNationalId(f.agentId) : ""} width="11rem" /> อยู่ที่ <Fill value={f.agentAddress} width="24rem" /> โทรศัพท์{" "}
            <Fill value={f.agentPhone} width="8rem" /> ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“นายหน้า”</b> อีกฝ่ายหนึ่ง
          </p>
          <p className="indent-10 mb-2">ทั้งสองฝ่ายตกลงทำสัญญากันโดยมีข้อความดังต่อไปนี้</p>

          <p className="indent-10">
            <b>ข้อ 1. ทรัพย์สิน</b> เจ้าของทรัพย์เป็นผู้มีกรรมสิทธิ์หรือมีอำนาจโดยชอบใน{" "}
            <Fill value={f.propertySummary} width="16rem" />
            {asset?.code ? <> (รหัสทรัพย์ {asset.code})</> : null} ตั้งอยู่ที่ <Fill value={f.propertyAddress} width="24rem" /> โฉนดที่ดินเลขที่{" "}
            <Fill value={f.deedNo} width="8rem" /> เนื้อที่ดิน <Fill value={f.landSize} width="8rem" /> พื้นที่ใช้สอยประมาณ <Fill value={f.usableArea} width="7rem" />{" "}
            ซึ่งต่อไปในสัญญานี้เรียกว่า “ทรัพย์สิน”
          </p>
          <p className="indent-10">
            <b>ข้อ 2. การแต่งตั้ง</b> เจ้าของทรัพย์ตกลงแต่งตั้งให้นายหน้าเป็นผู้ติดต่อ ชี้ช่อง และจัดหา{counterparty}สำหรับทรัพย์สิน
            {f.exclusive
              ? ` แต่เพียงผู้เดียว ตลอดอายุสัญญาเจ้าของทรัพย์จะไม่แต่งตั้งบุคคลอื่นเป็นนายหน้า และหากเจ้าของทรัพย์${dealWord}ทรัพย์สินได้เองหรือผ่านบุคคลอื่นในระหว่างอายุสัญญา เจ้าของทรัพย์ตกลงชำระค่านายหน้าตามข้อ 4 ให้แก่นายหน้าเต็มจำนวน`
              : ` โดยเจ้าของทรัพย์ยังมีสิทธิ${dealWord}ทรัพย์สินด้วยตนเองหรือแต่งตั้งนายหน้ารายอื่นได้ และจะชำระค่านายหน้าตามข้อ 4 เฉพาะกรณีที่${counterparty}เป็นบุคคลที่นายหน้าเป็นผู้ติดต่อ ชี้ช่อง หรือแนะนำมา`}
          </p>
          <p className="indent-10">
            <b>ข้อ 3. {isSale ? "ราคาขาย" : "ค่าเช่า"}</b> เจ้าของทรัพย์กำหนด{isSale ? "ราคาขายทรัพย์สิน" : "ค่าเช่าทรัพย์สินเดือนละ"}{" "}
            <Fill value={priceNum ? `${formatNumber(priceNum)} บาท (${bahtText(priceNum)})` : ""} width="18rem" /> ทั้งนี้เจ้าของทรัพย์อาจตกลง
            {isSale ? "ราคา" : "ค่าเช่า"}และเงื่อนไขอื่นกับ{counterparty}แตกต่างจากนี้ได้ตามที่เห็นสมควร
          </p>
          <p className="indent-10">
            <b>ข้อ 4. ค่านายหน้า</b> เจ้าของทรัพย์ตกลงชำระค่านายหน้าให้แก่นายหน้า <Fill value={commissionText} width="20rem" />{" "}
            {isSale
              ? "โดยชำระในวันจดทะเบียนโอนกรรมสิทธิ์ ณ สำนักงานที่ดิน"
              : "โดยชำระในวันที่ผู้เช่าลงนามในสัญญาเช่าและชำระเงินประกันพร้อมค่าเช่าล่วงหน้าแล้ว"}{" "}
            ค่านายหน้าดังกล่าวยังไม่รวมภาษีที่กฎหมายกำหนด (ถ้ามี)
          </p>
          <p className="indent-10">
            <b>ข้อ 5. ระยะเวลา</b> สัญญานี้มีกำหนด <Fill value={f.termMonths ? `${f.termMonths} เดือน` : ""} width="5rem" /> นับตั้งแต่วันที่{" "}
            <Fill value={longDate(f.startDate)} width="10rem" /> ถึงวันที่ <Fill value={endDate ? longDate(endDate) : ""} width="10rem" />{" "}
            เมื่อครบกำหนดแล้วหากไม่มีฝ่ายใดบอกเลิกเป็นหนังสือ ให้ถือว่าสัญญามีผลต่อไปอีกคราวละเท่ากับระยะเวลาเดิม
          </p>
          <p className="indent-10">
            <b>ข้อ 6. การคุ้มครองค่านายหน้า</b> หากภายใน <Fill value={f.tailDays ? `${f.tailDays} วัน` : ""} width="5rem" /> นับแต่วันที่สัญญานี้สิ้นสุดลง
            เจ้าของทรัพย์ตกลง{dealWord}ทรัพย์สินให้แก่บุคคลที่นายหน้าเคยติดต่อ ชี้ช่อง หรือพาเข้าชมทรัพย์สินไว้ในระหว่างอายุสัญญา
            เจ้าของทรัพย์ยังคงมีหน้าที่ชำระค่านายหน้าตามข้อ 4 ให้แก่นายหน้า
          </p>
          <p className="indent-10">
            <b>ข้อ 7. หน้าที่ของนายหน้า</b> นายหน้าจะประชาสัมพันธ์ทรัพย์สินผ่านช่องทางของตน พา{counterparty}เข้าชมทรัพย์สิน ประสานงานการเจรจา
            และอำนวยความสะดวกในการจัดทำเอกสารจนเสร็จสิ้น โดยนายหน้าเป็นผู้รับผิดชอบค่าใช้จ่ายในการโฆษณาและการทำงานของตนเอง
            นายหน้าไม่มีอำนาจลงนามในสัญญาหรือรับเงินใด ๆ แทนเจ้าของทรัพย์ เว้นแต่ได้รับมอบอำนาจเป็นหนังสือ
          </p>
          <p className="indent-10">
            <b>ข้อ 8. หน้าที่ของเจ้าของทรัพย์</b> เจ้าของทรัพย์รับรองว่าข้อมูลและเอกสารเกี่ยวกับทรัพย์สินที่ให้ไว้เป็นความจริง
            ยินยอมให้นายหน้าถ่ายภาพและเผยแพร่ข้อมูลทรัพย์สินเพื่อการ{dealWord} อำนวยความสะดวกในการเข้าชมทรัพย์สิน
            และแจ้งให้นายหน้าทราบโดยไม่ชักช้าเมื่อทรัพย์สิน{isSale ? "ถูกขาย" : "มีผู้เช่า"}แล้วหรือมีการเปลี่ยนแปลง{isSale ? "ราคา" : "ค่าเช่า"}และเงื่อนไข
          </p>
          <p className="indent-10">
            <b>ข้อ 9. การบอกเลิกสัญญา</b> ฝ่ายใดฝ่ายหนึ่งมีสิทธิบอกเลิกสัญญาได้โดยแจ้งเป็นหนังสือให้อีกฝ่ายทราบล่วงหน้าไม่น้อยกว่า 15 วัน
            การบอกเลิกสัญญาไม่กระทบสิทธิของนายหน้าตามข้อ 6
          </p>
          <p className="indent-10 mt-2">
            สัญญานี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยตลอดแล้ว จึงลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
            และต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ
          </p>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 mt-10 break-inside-avoid text-center">
            {[
              { role: "เจ้าของทรัพย์", name: f.ownerName, signature: "" },
              { role: "นายหน้า", name: f.agentName, signature: f.showSignature ? data.agent.signatureUrl : "" },
              { role: "พยาน", name: "", signature: "" },
              { role: "พยาน", name: "", signature: "" },
            ].map((s, i) => (
              <div key={i}>
                <div className="h-14 flex items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.signature && <img src={s.signature} alt="" className="max-h-14 max-w-[60%] object-contain" />}
                </div>
                <p>ลงชื่อ ........................................................ {s.role}</p>
                <p>( {s.name.trim() || "........................................................"} )</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
