// Thai baht amount in words, for contracts: 12500000 -> "สิบสองล้านห้าแสนบาทถ้วน"

const DIGITS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const UNITS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

/** Reads up to 6 digits (below one million) */
function readGroup(n: number, hasHigher = false): string {
  const s = String(n);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i]);
    const pos = s.length - i - 1;
    if (d === 0) continue;
    if (pos === 0 && d === 1 && (s.length > 1 || hasHigher)) out += "เอ็ด";
    else if (pos === 1 && d === 2) out += "ยี่สิบ";
    else if (pos === 1 && d === 1) out += "สิบ";
    else out += DIGITS[d] + UNITS[pos];
  }
  return out;
}

function readInteger(n: number): string {
  if (n === 0) return DIGITS[0];
  const millions = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  return (millions ? readInteger(millions) + "ล้าน" : "") + (rest ? readGroup(rest, millions > 0) : "");
}

export function bahtText(amount: number | string | null | undefined): string {
  const n = Number(String(amount ?? "").replace(/,/g, ""));
  if (!isFinite(n) || n <= 0) return "";
  const satang = Math.round(n * 100);
  const baht = Math.floor(satang / 100);
  const st = satang % 100;
  return (baht ? readInteger(baht) + "บาท" : "") + (st ? readInteger(st) + "สตางค์" : "ถ้วน");
}
