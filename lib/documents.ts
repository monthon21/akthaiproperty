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
    description: "ระหว่างเจ้าของทรัพย์กับ AK Thai Property",
    ready: false,
  },
];
