// ============================================================
// Document types for the (upcoming) PDF document system.
// Each type will pull data from an Asset + Landlord + customer and
// render a PDF. `ready: false` = planned, not built yet.
// ============================================================

export type DealKind = "rent" | "sale";

export interface DocumentType {
  key: string;
  deal: DealKind;
  title: string; // ภาษาไทย
  titleEn: string;
  description: string;
  ready: boolean;
  /** page (under /{lang}/manage/documents/) that prepares it, once ready */
  path?: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  // ── เช่า ──
  {
    key: "rent_booking_receipt",
    deal: "rent",
    title: "ใบรับเงินจองเช่า",
    titleEn: "Rental Booking Receipt",
    description: "รับเงินจองก่อนทำสัญญาเช่า",
    ready: false,
  },
  {
    key: "lease_agreement",
    deal: "rent",
    title: "สัญญาเช่า",
    titleEn: "Lease Agreement",
    description: "ดึงค่าเช่า เงินประกัน ค่าเช่าล่วงหน้า และระยะสัญญาจากข้อมูลทรัพย์",
    ready: false,
  },
  {
    key: "rent_deposit_receipt",
    deal: "rent",
    title: "ใบเสร็จเงินประกันและค่าเช่าล่วงหน้า",
    titleEn: "Deposit & Advance Rent Receipt",
    description: "ออกในวันทำสัญญา / ส่งมอบทรัพย์",
    ready: false,
  },
  {
    key: "handover_checklist",
    deal: "rent",
    title: "ใบตรวจรับ-ส่งมอบทรัพย์",
    titleEn: "Handover Checklist",
    description: "รายการสภาพทรัพย์ มิเตอร์น้ำ-ไฟ และกุญแจ",
    ready: false,
  },
  // ── ซื้อขาย ──
  {
    key: "sale_booking_receipt",
    deal: "sale",
    title: "ใบรับเงินจองซื้อ",
    titleEn: "Purchase Booking Receipt",
    description: "รับเงินจองตามเงื่อนไขการซื้อขายของทรัพย์",
    ready: false,
  },
  {
    key: "sale_agreement",
    deal: "sale",
    title: "สัญญาจะซื้อจะขาย",
    titleEn: "Sale and Purchase Agreement",
    description: "ดึงราคา เงินทำสัญญา และผู้รับผิดชอบค่าโอน/ภาษีจากข้อมูลทรัพย์",
    ready: false,
  },
  {
    key: "commission_agreement",
    deal: "sale",
    title: "สัญญาแต่งตั้งนายหน้า",
    titleEn: "Brokerage Agreement",
    description: "ระหว่างเจ้าของทรัพย์กับ AK Thai Property — ใช้ได้ทั้งขายและให้เช่า (ฉบับร่าง)",
    ready: true,
    path: "broker-appointment",
  },
];

// ============================================================
// Document set for ONE transaction (a rental or a sale).
// All of these belong together as one set per deal.
// `expected: true` (shown with *) = normally part of the set, but the deal is
// never blocked when it's missing — some papers are only handed over on signing day.
// ============================================================

export interface DealSetItem {
  key: string;
  title: string; // ภาษาไทย
  titleEn: string;
  /** marked * — should be in the set, but may arrive later */
  expected: boolean;
  /** which kinds of deal use it */
  deals: DealKind[];
  /** "generated" = the system prepares it as a PDF; "uploaded" = a file handed in; unset = not decided yet */
  source?: "generated" | "uploaded";
  note?: string;
}

export const DEAL_DOCUMENT_SET: DealSetItem[] = [
  { key: "contract", title: "สัญญาเช่า หรือ สัญญาซื้อขาย", titleEn: "Lease / Sale Agreement", expected: true, deals: ["rent", "sale"] },
  { key: "customer_docs", title: "เอกสารผู้เช่า หรือ ผู้ซื้อ", titleEn: "Tenant / Buyer Documents", expected: true, deals: ["rent", "sale"] },
  { key: "owner_docs", title: "เอกสารเจ้าของทรัพย์", titleEn: "Owner Documents", expected: true, deals: ["rent", "sale"] },
  { key: "bank_book", title: "สำเนาหน้าบุ๊คแบงก์", titleEn: "Bank Book Copy", expected: false, deals: ["rent"], note: "กรณีเช่า" },
  { key: "broker_appointment", title: "เอกสารแต่งตั้งนายหน้า", titleEn: "Broker Appointment", expected: false, deals: ["rent", "sale"], source: "generated" },
  { key: "handover", title: "เอกสารตรวจรับ-ส่งมอบทรัพย์", titleEn: "Handover Inspection", expected: true, deals: ["rent", "sale"] },
];
