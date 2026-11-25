/**
 * Format a number-like input as the user types: adds thousands commas and keeps
 * one decimal point, e.g. "1400" -> "1,400", "1400.5" -> "1,400.5", "4." -> "4.".
 */
export function formatDecimalInput(value: string): string {
  const clean = value.replace(/[^0-9.]/g, "");
  if (!clean) return "";
  const [intPart, ...rest] = clean.split(".");
  const intFormatted = intPart ? Number(intPart).toLocaleString("en-US") : "0";
  return rest.length > 0 ? `${intFormatted}.${rest.join("")}` : intFormatted;
}

/** Strip commas so the value can be stored / parsed as a number. */
export function stripCommas(value: string | null | undefined): string {
  return (value ?? "").replace(/,/g, "");
}

/** Display a stored number with thousands commas (keeps decimals). */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(stripCommas(String(value)));
  return isNaN(n) ? String(value) : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// ── Thai land units: 1 ไร่ = 4 งาน = 400 ตร.วา, 1 งาน = 100 ตร.วา ──
export const SQW_PER_RAI = 400;
export const SQW_PER_NGAN = 100;

/** Split a total in square wah into { rai, ngan, sqw } */
export function splitLandSize(totalSqw: number) {
  const rai = Math.floor(totalSqw / SQW_PER_RAI);
  const ngan = Math.floor((totalSqw % SQW_PER_RAI) / SQW_PER_NGAN);
  const sqw = Math.round((totalSqw % SQW_PER_NGAN) * 100) / 100;
  return { rai, ngan, sqw };
}

const LAND_UNITS = {
  th: { rai: "ไร่", ngan: "งาน", sqw: "ตร.วา" },
  en: { rai: "Rai", ngan: "Ngan", sqw: "Sq.wah" },
  zh: { rai: "莱", ngan: "安", sqw: "平方哇" },
};

/** e.g. 650 -> "1 ไร่ 2 งาน 50 ตร.วา", 300 -> "3 งาน", 200 -> "2 งาน" */
export function formatLandSize(totalSqw: number | string | null | undefined, lang: string = "th"): string {
  const n = Number(stripCommas(String(totalSqw ?? "")));
  if (!n || isNaN(n)) return "";
  const u = LAND_UNITS[lang as keyof typeof LAND_UNITS] || LAND_UNITS.th;
  const { rai, ngan, sqw } = splitLandSize(n);
  const parts: string[] = [];
  if (rai) parts.push(`${rai.toLocaleString("en-US")} ${u.rai}`);
  if (ngan) parts.push(`${ngan} ${u.ngan}`);
  if (sqw) parts.push(`${formatNumber(sqw)} ${u.sqw}`);
  return parts.join(" ");
}

/**
 * Format a Thai phone number as the user types.
 *  mobile 10 digits (06/08/09…) -> 086-888-0196
 *  Bangkok landline 02 + 7     -> 02-123-4567
 *  other landline 0XX + 6       -> 038-123-456
 * Non-Thai input (e.g. starts with "+") or text with several numbers is left as-is.
 */
export function formatThaiPhone(value: string | null | undefined): string {
  const raw = value ?? "";
  if (!raw.trim() || raw.trim().startsWith("+") || /[,/]/.test(raw)) return raw;
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (!d) return "";
  if (d.startsWith("02")) {
    // 02-123-4567
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 9)}`;
  }
  // 086-888-0196 (also 038-123-456 for 9-digit provincial landlines)
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Digits only — for searching phones regardless of dashes */
export function phoneDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

// ── Thai national ID (13 digits) ──

/** Format as the user types: 1-2345-67890-12-3 */
export function formatNationalId(value: string | null | undefined): string {
  const d = (value ?? "").replace(/\D/g, "").slice(0, 13);
  const parts = [d.slice(0, 1), d.slice(1, 5), d.slice(5, 10), d.slice(10, 12), d.slice(12, 13)];
  return parts.filter(Boolean).join("-");
}

/** Checksum validation for a 13-digit Thai national ID */
export function isValidThaiNationalId(value: string | null | undefined): boolean {
  const d = (value ?? "").replace(/\D/g, "");
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * (13 - i);
  return (11 - (sum % 11)) % 10 === Number(d[12]);
}

/**
 * Locale for every date shown in the app: Thai month names with Christian-era (ค.ศ.) years.
 * Plain "th-TH" would print Buddhist-era years (2569).
 */
export const DATE_LOCALE = "th-TH-u-ca-gregory";

/** "1990-05-20" -> "20 พฤษภาคม 1990" */
export function formatThaiDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "long", year: "numeric" });
}
