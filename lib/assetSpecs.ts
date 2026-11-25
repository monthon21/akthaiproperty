import { stripCommas, formatNumber } from "./format";

// ============================================================
// Asset specs — stored together as one JSON object in Asset.specs
//  - INDUSTRIAL_SPEC_FIELDS : โกดัง / โรงงาน only
//  - CONDO_SPEC_FIELDS      : คอนโดมิเนียม / อพาร์ทเม้นท์ only
//  - RENT_TERM_FIELDS       : เงื่อนไขการเช่า (any type, when isRent)
//  - SALE_TERM_FIELDS       : เงื่อนไขการซื้อขาย (any type, when isSell)
// ============================================================

export const INDUSTRIAL_TYPES = ["WAREHOUSE", "FACTORY"] as const;

export function isIndustrialType(type: string | null | undefined): boolean {
  return !!type && (INDUSTRIAL_TYPES as readonly string[]).includes(type);
}

/** Units inside a building: no land of their own, described by floor / building / room layout */
export const CONDO_TYPES = ["CONDO", "APARTMENT"] as const;

export function isCondoType(type: string | null | undefined): boolean {
  return !!type && (CONDO_TYPES as readonly string[]).includes(type);
}

type L = { th: string; en: string; zh: string };

export interface SpecOption {
  value: string;
  label: L;
}

export interface SpecField {
  key: string;
  label: L;
  unit?: L;
  input: "number" | "text" | "select" | "textarea";
  placeholder?: string;
  options?: SpecOption[];
}

export const INDUSTRIAL_SPEC_FIELDS: SpecField[] = [
  {
    key: "warehouseArea",
    label: { th: "พื้นที่โกดัง / โรงงาน", en: "Warehouse Area", zh: "仓库面积" },
    unit: { th: "ตร.ม.", en: "sq.m.", zh: "平方米" },
    input: "number",
    placeholder: "e.g. 1500",
  },
  {
    key: "officeArea",
    label: { th: "พื้นที่สำนักงาน", en: "Office Area", zh: "办公面积" },
    unit: { th: "ตร.ม.", en: "sq.m.", zh: "平方米" },
    input: "number",
    placeholder: "e.g. 120",
  },
  {
    key: "ceilingHeight",
    label: { th: "ความสูงใต้จันทัน", en: "Eave Height", zh: "檐高" },
    unit: { th: "ม.", en: "m", zh: "米" },
    input: "number",
    placeholder: "e.g. 10",
  },
  {
    key: "floorLoad",
    label: { th: "รับน้ำหนักพื้น", en: "Floor Load", zh: "地面承重" },
    unit: { th: "ตัน/ตร.ม.", en: "t/sq.m.", zh: "吨/平方米" },
    input: "number",
    placeholder: "e.g. 3",
  },
  {
    key: "powerKva",
    label: { th: "กำลังไฟฟ้า", en: "Power Supply", zh: "供电容量" },
    unit: { th: "kVA", en: "kVA", zh: "kVA" },
    input: "number",
    placeholder: "e.g. 250",
  },
  {
    key: "electricityRate",
    label: { th: "ค่าไฟต่อหน่วย", en: "Electricity Rate", zh: "电费单价" },
    unit: { th: "บาท/หน่วย", en: "THB/unit", zh: "泰铢/度" },
    input: "number",
    placeholder: "e.g. 4.5",
  },
  {
    key: "waterRate",
    label: { th: "ค่าน้ำต่อหน่วย", en: "Water Rate", zh: "水费单价" },
    unit: { th: "บาท/หน่วย", en: "THB/unit", zh: "泰铢/立方米" },
    input: "number",
    placeholder: "e.g. 18",
  },
  {
    key: "loadingDocks",
    label: { th: "จำนวน Loading Dock", en: "Loading Docks", zh: "装卸平台" },
    unit: { th: "จุด", en: "docks", zh: "个" },
    input: "number",
    placeholder: "e.g. 4",
  },
  {
    key: "doorCount",
    label: { th: "จำนวนประตูเข้า-ออกสินค้า", en: "Loading Doors", zh: "货物进出门" },
    unit: { th: "บาน", en: "doors", zh: "扇" },
    input: "number",
    placeholder: "e.g. 2",
  },
  {
    key: "doorSize",
    label: { th: "ขนาดประตู (กว้าง x สูง)", en: "Door Size (W x H)", zh: "门尺寸 (宽 x 高)" },
    input: "text",
    placeholder: "e.g. 5 x 6 ม.",
  },
  {
    key: "columnSpan",
    label: { th: "ระยะห่างเสา / ช่วงพาด", en: "Column Span", zh: "柱距" },
    input: "text",
    placeholder: "e.g. ไม่มีเสากลาง 30 ม.",
  },
  {
    key: "truckAccess",
    label: { th: "รถบรรทุกเข้าได้", en: "Truck Access", zh: "货车通行" },
    input: "select",
    options: [
      { value: "4w", label: { th: "รถกระบะ 4 ล้อ", en: "4-Wheel Pickup", zh: "四轮皮卡" } },
      { value: "6w", label: { th: "รถบรรทุก 6 ล้อ", en: "6-Wheel Truck", zh: "六轮货车" } },
      { value: "10w", label: { th: "รถบรรทุก 10 ล้อ", en: "10-Wheel Truck", zh: "十轮货车" } },
      { value: "trailer", label: { th: "รถเทรลเลอร์ / 18 ล้อ", en: "Trailer / 18-Wheeler", zh: "拖车 / 18轮" } },
    ],
  },
  {
    key: "zoning",
    label: { th: "ผังเมือง (สีโซน)", en: "Zoning", zh: "城市规划分区" },
    input: "select",
    options: [
      { value: "purple", label: { th: "สีม่วง (อุตสาหกรรม)", en: "Purple (Industrial)", zh: "紫色 (工业区)" } },
      { value: "purple_stripe", label: { th: "สีม่วงลายขาว (คลังสินค้า)", en: "Purple-White (Warehouse)", zh: "紫白条纹 (仓储区)" } },
      { value: "estate", label: { th: "นิคมอุตสาหกรรม", en: "Industrial Estate", zh: "工业园区" } },
      { value: "green_stripe", label: { th: "สีเขียวลายขาว (ชนบทและเกษตรกรรม)", en: "Green-White (Rural)", zh: "绿白条纹 (农村)" } },
      { value: "yellow_orange", label: { th: "สีเหลือง / ส้ม (ที่อยู่อาศัย)", en: "Yellow / Orange (Residential)", zh: "黄色 / 橙色 (住宅区)" } },
      { value: "red", label: { th: "สีแดง (พาณิชยกรรม)", en: "Red (Commercial)", zh: "红色 (商业区)" } },
      { value: "other", label: { th: "อื่นๆ", en: "Other", zh: "其他" } },
    ],
  },
];

const PAID_BY_OPTIONS: SpecOption[] = [
  { value: "split", label: { th: "คนละครึ่ง", en: "Split 50/50", zh: "双方各付一半" } },
  { value: "buyer", label: { th: "ผู้ซื้อจ่าย", en: "Paid by Buyer", zh: "买方支付" } },
  { value: "seller", label: { th: "ผู้ขายจ่าย", en: "Paid by Seller", zh: "卖方支付" } },
];

export const RENT_TERM_FIELDS: SpecField[] = [
  {
    key: "depositMonths",
    label: { th: "เงินประกัน", en: "Security Deposit", zh: "押金" },
    unit: { th: "เดือน", en: "months", zh: "个月" },
    input: "number",
    placeholder: "e.g. 2",
  },
  {
    key: "advanceMonths",
    label: { th: "ค่าเช่าล่วงหน้า", en: "Advance Rent", zh: "预付租金" },
    unit: { th: "เดือน", en: "months", zh: "个月" },
    input: "number",
    placeholder: "e.g. 1",
  },
  {
    key: "utilityDeposit",
    label: { th: "เงินประกันน้ำ-ไฟ", en: "Utility Deposit", zh: "水电押金" },
    unit: { th: "บาท", en: "THB", zh: "泰铢" },
    input: "number",
    placeholder: "e.g. 50,000",
  },
  {
    key: "minLeaseTerm",
    label: { th: "สัญญาเช่าขั้นต่ำ", en: "Minimum Lease Term", zh: "最短租期" },
    input: "text",
    placeholder: "e.g. 1 ปี / 3 ปี",
  },
  {
    key: "rentIncrease",
    label: { th: "การปรับค่าเช่า", en: "Rent Escalation", zh: "租金调整" },
    input: "text",
    placeholder: "e.g. ขึ้น 5% ทุก 3 ปี",
  },
  {
    key: "propertyTaxPaidBy",
    label: { th: "ภาษีที่ดินและสิ่งปลูกสร้าง", en: "Land & Building Tax", zh: "土地及建筑税" },
    input: "select",
    options: [
      { value: "landlord", label: { th: "ผู้ให้เช่าจ่าย", en: "Paid by Landlord", zh: "房东支付" } },
      { value: "tenant", label: { th: "ผู้เช่าจ่าย", en: "Paid by Tenant", zh: "租户支付" } },
    ],
  },
  {
    key: "rentOtherTerms",
    label: { th: "เงื่อนไขการเช่าเพิ่มเติม", en: "Other Rental Terms", zh: "其他租赁条件" },
    input: "textarea",
    placeholder: "e.g. ห้ามเก็บสารเคมีอันตราย, ชำระค่าเช่าทุกวันที่ 5",
  },
];

export const SALE_TERM_FIELDS: SpecField[] = [
  {
    key: "bookingDeposit",
    label: { th: "เงินจอง", en: "Booking Deposit", zh: "订金" },
    unit: { th: "บาท", en: "THB", zh: "泰铢" },
    input: "number",
    placeholder: "e.g. 50,000",
  },
  {
    key: "contractDeposit",
    label: { th: "เงินทำสัญญา", en: "Contract Deposit", zh: "签约金" },
    unit: { th: "บาท", en: "THB", zh: "泰铢" },
    input: "number",
    placeholder: "e.g. 500,000",
  },
  {
    key: "transferFeePaidBy",
    label: { th: "ค่าธรรมเนียมการโอน (2%)", en: "Transfer Fee (2%)", zh: "过户费 (2%)" },
    input: "select",
    options: PAID_BY_OPTIONS,
  },
  {
    key: "saleTaxPaidBy",
    label: { th: "ภาษีธุรกิจเฉพาะ / อากร / ภาษีเงินได้", en: "Business Tax / Stamp Duty / Withholding Tax", zh: "特定营业税 / 印花税 / 预扣税" },
    input: "select",
    options: PAID_BY_OPTIONS,
  },
  {
    key: "saleOtherTerms",
    label: { th: "เงื่อนไขการซื้อขายเพิ่มเติม", en: "Other Sale Terms", zh: "其他买卖条件" },
    input: "textarea",
    placeholder: "e.g. โอนภายใน 60 วันหลังทำสัญญา",
  },
];

export type AssetSpecs = Record<string, string>;
/** @deprecated use AssetSpecs */
export type IndustrialSpecs = AssetSpecs;

export function parseSpecs(json: string | null | undefined): IndustrialSpecs {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: IndustrialSpecs = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== null && v !== undefined && String(v).trim() !== "") out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

export const CONDO_SPEC_FIELDS: SpecField[] = [
  {
    key: "unitFloor",
    label: { th: "ชั้นที่ห้องอยู่", en: "Floor", zh: "所在楼层" },
    input: "number",
    placeholder: "e.g. 12",
  },
  {
    key: "building",
    label: { th: "อาคาร / ตึก", en: "Building", zh: "楼栋" },
    input: "text",
    placeholder: "e.g. A, ตึก 2",
  },
  {
    key: "roomType",
    label: { th: "รูปแบบห้อง", en: "Room Type", zh: "户型" },
    input: "select",
    options: [
      { value: "studio", label: { th: "สตูดิโอ", en: "Studio", zh: "开间" } },
      { value: "1br", label: { th: "1 ห้องนอน", en: "1 Bedroom", zh: "一居室" } },
      { value: "2br", label: { th: "2 ห้องนอน", en: "2 Bedrooms", zh: "两居室" } },
      { value: "3br", label: { th: "3 ห้องนอน", en: "3 Bedrooms", zh: "三居室" } },
      { value: "duplex", label: { th: "ดูเพล็กซ์ (2 ชั้น)", en: "Duplex", zh: "复式" } },
      { value: "penthouse", label: { th: "เพนต์เฮาส์", en: "Penthouse", zh: "顶层公寓" } },
    ],
  },
  {
    key: "commonFee",
    label: { th: "ค่าส่วนกลาง", en: "Common Fee", zh: "物业费" },
    unit: { th: "บาท/ตร.ม./เดือน", en: "THB/sq.m./month", zh: "泰铢/平方米/月" },
    input: "number",
    placeholder: "e.g. 45",
  },
  {
    key: "view",
    label: { th: "วิว", en: "View", zh: "景观" },
    input: "select",
    options: [
      { value: "city", label: { th: "วิวเมือง", en: "City View", zh: "城市景观" } },
      { value: "river", label: { th: "วิวแม่น้ำ", en: "River View", zh: "河景" } },
      { value: "sea", label: { th: "วิวทะเล", en: "Sea View", zh: "海景" } },
      { value: "pool", label: { th: "วิวสระว่ายน้ำ", en: "Pool View", zh: "泳池景观" } },
      { value: "garden", label: { th: "วิวสวน", en: "Garden View", zh: "花园景观" } },
      { value: "mountain", label: { th: "วิวภูเขา", en: "Mountain View", zh: "山景" } },
    ],
  },
  {
    key: "furnishing",
    label: { th: "การตกแต่ง", en: "Furnishing", zh: "装修" },
    input: "select",
    options: [
      { value: "bare", label: { th: "ห้องเปล่า", en: "Unfurnished", zh: "毛坯" } },
      { value: "partly", label: { th: "ตกแต่งบางส่วน", en: "Partly Furnished", zh: "部分家具" } },
      { value: "fully", label: { th: "ตกแต่งครบ พร้อมเข้าอยู่", en: "Fully Furnished", zh: "精装修 拎包入住" } },
    ],
  },
  {
    key: "foreignQuota",
    label: { th: "โควตาต่างชาติ", en: "Foreign Quota", zh: "外国人配额" },
    input: "select",
    options: [
      { value: "yes", label: { th: "มี", en: "Available", zh: "有" } },
      { value: "no", label: { th: "ไม่มี", en: "Not Available", zh: "无" } },
    ],
  },
  {
    key: "buildingFloors",
    label: { th: "จำนวนชั้นของอาคาร", en: "Building Floors", zh: "总楼层" },
    input: "number",
    placeholder: "e.g. 32",
  },
  {
    key: "yearBuilt",
    label: { th: "ปีที่สร้างเสร็จ (ค.ศ.)", en: "Year Built", zh: "建成年份" },
    input: "text",
    placeholder: "e.g. 2019",
  },
  {
    key: "unitNo",
    label: { th: "เลขที่ห้อง (ข้อมูลภายใน ไม่แสดงหน้าเว็บ)", en: "Unit No. (internal)", zh: "房号（内部）" },
    input: "text",
    placeholder: "e.g. 1205",
  },
];

/** Kept for staff and documents only — never shown on the public site */
const PRIVATE_SPEC_KEYS = ["unitNo"];

/** Condo fields for this exact type: only real condominiums (strata title) have a foreign quota */
export function condoFieldsFor(type: string | null | undefined): SpecField[] {
  return type === "CONDO" ? CONDO_SPEC_FIELDS : CONDO_SPEC_FIELDS.filter((f) => f.key !== "foreignQuota");
}

/** Type-specific fields that may be shown publicly (industrial specs, or condo specs without the unit number) */
export function publicTypeSpecFields(type: string | null | undefined): SpecField[] {
  if (isIndustrialType(type)) return INDUSTRIAL_SPEC_FIELDS;
  if (isCondoType(type)) return condoFieldsFor(type).filter((f) => !PRIVATE_SPEC_KEYS.includes(f.key));
  return [];
}

/** Fields that apply to an asset with this type / deal */
export function applicableSpecFields(ctx: { type?: string | null; isRent?: boolean; isSell?: boolean }): SpecField[] {
  return [
    ...(isIndustrialType(ctx.type) ? INDUSTRIAL_SPEC_FIELDS : []),
    ...(isCondoType(ctx.type) ? condoFieldsFor(ctx.type) : []),
    ...(ctx.isRent ? RENT_TERM_FIELDS : []),
    ...(ctx.isSell ? SALE_TERM_FIELDS : []),
  ];
}

const ALWAYS_KEPT_KEYS = ["landParts"];

/** Keep only applicable, non-empty keys. Returns null when nothing is filled. */
export function serializeSpecs(
  specs: AssetSpecs | null | undefined,
  ctx: { type?: string | null; isRent?: boolean; isSell?: boolean }
): string | null {
  if (!specs) return null;
  const clean: AssetSpecs = {};
  for (const f of applicableSpecFields(ctx)) {
    const v = specs[f.key];
    if (v === undefined || v === null || String(v).trim() === "") continue;
    clean[f.key] = f.input === "number" ? stripCommas(String(v).trim()) : String(v).trim();
  }
  // not form fields, but kept for every asset type (landParts: land size boxes as typed)
  for (const key of ALWAYS_KEPT_KEYS) {
    const v = specs[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") clean[key] = String(v).trim();
  }
  return Object.keys(clean).length > 0 ? JSON.stringify(clean) : null;
}

function pick(l: L, lang: string) {
  return lang === "en" ? l.en : lang === "zh" ? l.zh : l.th;
}

export interface DisplaySpec {
  key: string;
  label: string;
  value: string;
  unit?: string;
  /** free-text value; render full width */
  long?: boolean;
}

/** Translate stored specs into display rows, in field order. */
export function formatSpecs(
  specs: AssetSpecs,
  lang: string,
  fields: SpecField[] = INDUSTRIAL_SPEC_FIELDS
): DisplaySpec[] {
  return fields.filter((f) => specs[f.key]).map((f) => {
    const raw = specs[f.key];
    let value = raw;
    if (f.input === "select") {
      const opt = f.options?.find((o) => o.value === raw);
      value = opt ? pick(opt.label, lang) : raw;
    } else if (f.input === "number") {
      value = formatNumber(raw);
    }
    return {
      key: f.key,
      label: pick(f.label, lang),
      value,
      unit: f.unit ? pick(f.unit, lang) : undefined,
      long: f.input === "textarea" || undefined,
    };
  });
}
