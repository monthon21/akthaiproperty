// ============================================================
// Asset inspection checklist (ใบตรวจสภาพทรัพย์)
// Stored as JSON in AssetChecklist.data
// ============================================================

import { isIndustrialType } from "./assetSpecs";

export type ItemStatus = "" | "ok" | "defect" | "damaged";

export interface ChecklistItem {
  id: string;
  name: string; // จุดที่ตรวจ / ควรถ่าย เช่น "โซฟา"
  status: ItemStatus;
  note: string;
  photos: string[]; // image URLs
}

export interface ChecklistArea {
  id: string;
  name: string; // ห้อง / ตำแหน่ง เช่น "ห้องรับแขก"
  items: ChecklistItem[];
}

export interface ChecklistData {
  areas: ChecklistArea[];
  meters: { water: string; electric: string };
  keys: { keys: string; keycards: string; remotes: string };
  note: string;
}

export type ChecklistKind = "move_in" | "move_out";

export const CHECKLIST_KINDS: { value: ChecklistKind; label: string }[] = [
  { value: "move_in", label: "ก่อนเข้าอยู่ (ส่งมอบ)" },
  { value: "move_out", label: "ส่งคืนทรัพย์ (ย้ายออก)" },
];

export const STATUS_OPTIONS: { value: Exclude<ItemStatus, "">; label: string; tone: string }[] = [
  { value: "ok", label: "ปกติ", tone: "emerald" },
  { value: "defect", label: "มีตำหนิ", tone: "amber" },
  { value: "damaged", label: "ชำรุด", tone: "red" },
];

let seq = 0;
export function newId(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function makeItem(name: string): ChecklistItem {
  return { id: newId("i"), name, status: "", note: "", photos: [] };
}

export function makeArea(name: string, itemNames: string[] = []): ChecklistArea {
  return { id: newId("a"), name, items: itemNames.map(makeItem) };
}

/** Room / location presets — also offered in the "เพิ่มห้อง / ตำแหน่ง" menu */
export const AREA_PRESETS: Record<string, string[]> = {
  "ภายนอก / หน้าบ้าน": ["ประตูรั้ว", "ที่จอดรถ", "ผนังภายนอก", "สวน / พื้นที่รอบบ้าน"],
  "ห้องรับแขก": ["ประตูทางเข้า", "โซฟา", "พื้น", "ผนัง", "เพดานและไฟ", "เครื่องปรับอากาศ", "หน้าต่าง / ผ้าม่าน"],
  "ห้องครัว": ["เคาน์เตอร์ / ซิงก์", "เตา / เครื่องดูดควัน", "ตู้เย็น", "ตู้เก็บของ", "พื้นและผนัง"],
  "ห้องนอน": ["ประตู", "เตียง / ที่นอน", "ตู้เสื้อผ้า", "เครื่องปรับอากาศ", "พื้นและผนัง", "หน้าต่าง / ผ้าม่าน"],
  "ห้องน้ำ": ["สุขภัณฑ์", "อ่างล้างหน้า / ก๊อกน้ำ", "ฝักบัว / เครื่องทำน้ำอุ่น", "พื้นและผนัง", "ประตู"],
  "ระเบียง": ["พื้น", "ราวกันตก", "ประตูบานเลื่อน"],
  "ระบบไฟฟ้าและน้ำ": ["ตู้ไฟ / เบรกเกอร์", "มิเตอร์ไฟฟ้า", "มิเตอร์น้ำ", "ปั๊มน้ำ / แท็งก์น้ำ"],
  // industrial
  "ทางเข้าและลานจอด": ["ประตูรั้ว / ป้อมยาม", "ถนนทางเข้า", "ลานจอด / กลับรถบรรทุก"],
  "ตัวอาคารโกดัง": ["ประตูโกดัง", "พื้นโกดัง", "ผนัง", "หลังคาและโครงสร้าง", "ไฟส่องสว่าง", "Loading Dock"],
  "สำนักงาน": ["ประตู", "พื้นและผนัง", "เครื่องปรับอากาศ", "เฟอร์นิเจอร์"],
  "ระบบอาคาร": ["ตู้ไฟ / หม้อแปลง", "ระบบดับเพลิง", "มิเตอร์ไฟฟ้า", "มิเตอร์น้ำ"],
  // land / generic
  "แนวเขตที่ดิน": ["หมุดหลักเขต", "ทางเข้าที่ดิน", "สภาพพื้นที่", "รั้ว / แนวเขต"],
  "พื้นที่ภายใน": ["ประตูทางเข้า", "พื้น", "ผนัง", "เพดานและไฟ", "เครื่องปรับอากาศ"],
};

const area = (name: string, label = name) => makeArea(label, AREA_PRESETS[name] ?? []);

/** Starting checklist for an asset, based on its type and room counts */
export function buildDefaultChecklist(asset: { type: string; noBedroom?: number | null; noBathroom?: number | null }): ChecklistData {
  let areas: ChecklistArea[];
  if (isIndustrialType(asset.type)) {
    areas = [area("ทางเข้าและลานจอด"), area("ตัวอาคารโกดัง"), area("สำนักงาน"), area("ห้องน้ำ"), area("ระบบอาคาร")];
  } else if (asset.type === "LAND") {
    areas = [area("แนวเขตที่ดิน")];
  } else if (["OFFICE", "RETAIL", "COMMERCIAL", "OTHER"].includes(asset.type)) {
    areas = [area("พื้นที่ภายใน", "ทางเข้าและพื้นที่ภายใน"), area("ห้องน้ำ"), area("ระบบไฟฟ้าและน้ำ")];
  } else {
    const beds = Math.min(Math.max(asset.noBedroom || 1, 1), 10);
    const baths = Math.min(Math.max(asset.noBathroom || 1, 1), 10);
    areas = [
      area("ภายนอก / หน้าบ้าน"),
      area("ห้องรับแขก"),
      area("ห้องครัว"),
      ...Array.from({ length: beds }, (_, i) => area("ห้องนอน", beds > 1 ? `ห้องนอน ${i + 1}` : "ห้องนอน")),
      ...Array.from({ length: baths }, (_, i) => area("ห้องน้ำ", baths > 1 ? `ห้องน้ำ ${i + 1}` : "ห้องน้ำ")),
      area("ระบบไฟฟ้าและน้ำ"),
    ];
  }
  return { areas, meters: { water: "", electric: "" }, keys: { keys: "", keycards: "", remotes: "" }, note: "" };
}

/** Parse stored JSON defensively (older / partial data still loads) */
export function parseChecklist(json: string | null | undefined): ChecklistData | null {
  if (!json) return null;
  try {
    const d = JSON.parse(json);
    if (!d || !Array.isArray(d.areas)) return null;
    return {
      areas: d.areas.map((a: Partial<ChecklistArea>) => ({
        id: a.id || newId("a"),
        name: a.name || "",
        items: (a.items || []).map((i: Partial<ChecklistItem>) => ({
          id: i.id || newId("i"),
          name: i.name || "",
          status: (["ok", "defect", "damaged"].includes(i.status as string) ? i.status : "") as ItemStatus,
          note: i.note || "",
          photos: Array.isArray(i.photos) ? i.photos.filter((p) => typeof p === "string") : [],
        })),
      })),
      meters: { water: d.meters?.water || "", electric: d.meters?.electric || "" },
      keys: { keys: d.keys?.keys || "", keycards: d.keys?.keycards || "", remotes: d.keys?.remotes || "" },
      note: d.note || "",
    };
  } catch {
    return null;
  }
}

export function checklistProgress(data: ChecklistData) {
  const items = data.areas.flatMap((a) => a.items);
  return {
    total: items.length,
    done: items.filter((i) => i.status !== "").length,
    photos: items.reduce((n, i) => n + i.photos.length, 0),
    issues: items.filter((i) => i.status === "defect" || i.status === "damaged").length,
  };
}
