// ============================================================
// Thai address parts (ที่อยู่ตามทะเบียนบ้าน) + composing them into one line
// for documents and for the legacy free-text `address` column.
// ============================================================

export interface AddressParts {
  houseNo: string; // บ้านเลขที่
  moo: string; // หมู่ที่
  village: string; // ชื่อโครงการ / หมู่บ้าน
  soi: string; // ซอย
  road: string; // ถนน
  subdistrict: string; // ตำบล / แขวง
  district: string; // อำเภอ / เขต
  province: string; // จังหวัด
  postCode: string; // รหัสไปรษณีย์
}

export const ADDRESS_KEYS: (keyof AddressParts)[] = [
  "houseNo",
  "moo",
  "village",
  "soi",
  "road",
  "subdistrict",
  "district",
  "province",
  "postCode",
];

export const EMPTY_ADDRESS: AddressParts = {
  houseNo: "",
  moo: "",
  village: "",
  soi: "",
  road: "",
  subdistrict: "",
  district: "",
  province: "",
  postCode: "",
};

export function hasAddressParts(parts: Partial<AddressParts>): boolean {
  return ADDRESS_KEYS.some((k) => (parts[k] ?? "").trim() !== "");
}

/** Add a prefix unless the value already starts with it (e.g. user typed "ซอยเอกชัย 1") */
function withPrefix(prefix: string, value: string | undefined, alt: string[] = []) {
  const v = (value ?? "").trim();
  if (!v) return "";
  return [prefix, ...alt].some((p) => v.startsWith(p)) ? v : `${prefix}${v}`;
}

/**
 * "99/9 หมู่ 5 หมู่บ้านเดอะแกรนด์ ซอยเอกชัย 1 ถนนเอกชัย ตำบลบางน้ำจืด อำเภอเมืองสมุทรสาคร จังหวัดสมุทรสาคร 74000"
 * Bangkok uses แขวง / เขต and no "จังหวัด" prefix.
 */
export function composeThaiAddress(parts: Partial<AddressParts>): string {
  const province = (parts.province ?? "").trim();
  const isBangkok = /กรุงเทพ/.test(province);
  return [
    (parts.houseNo ?? "").trim(),
    withPrefix("หมู่ ", parts.moo, ["หมู่", "ม."]),
    withPrefix("หมู่บ้าน", parts.village, ["หมู่บ้าน", "โครงการ", "คอนโด", "อาคาร", "ม."]),
    withPrefix("ซอย", parts.soi, ["ซอย", "ซ."]),
    withPrefix("ถนน", parts.road, ["ถนน", "ถ."]),
    withPrefix(isBangkok ? "แขวง" : "ตำบล", parts.subdistrict, ["แขวง", "ตำบล", "ต."]),
    withPrefix(isBangkok ? "เขต" : "อำเภอ", parts.district, ["เขต", "อำเภอ", "อ."]),
    isBangkok ? province : withPrefix("จังหวัด", province, ["จังหวัด", "จ."]),
    (parts.postCode ?? "").trim(),
  ]
    .filter(Boolean)
    .join(" ");
}
