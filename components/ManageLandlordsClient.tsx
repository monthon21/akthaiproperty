"use client";

import { useMemo, useState } from "react";
import { formatThaiPhone, phoneDigits } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteLandlordAction } from "@/lib/actions/landlord";
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function ManageLandlordsClient({
  initialLandlords,
  currentLang,
  errorMsg = ""
}: {
  initialLandlords: any[];
  currentLang: string;
  errorMsg?: string;
}) {
  const router = useRouter();
  const [landlords, setLandlords] = useState(initialLandlords);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [actionError, setActionError] = useState(errorMsg);
  const [successMessage, setSuccessMessage] = useState("");

  const filteredLandlords = landlords.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      (phoneDigits(q).length >= 3 && phoneDigits(c.phone).includes(phoneDigits(q))) ||
      c.line?.toLowerCase().includes(q) ||
      c.details?.fullname?.toLowerCase().includes(q) ||
      c.details?.email?.toLowerCase().includes(q)
    );
  });

  // Registration number: oldest landlord (lowest auto-increment id) = 1, fixed regardless of search / sort
  const regNo = useMemo(() => {
    const map = new Map<number, number>();
    [...landlords].sort((a, b) => a.id - b.id).forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [landlords]);

  type SortKey = "no" | "name" | "phone" | "line" | "fullname" | "assets";
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "no", dir: "asc" });

  const toggleSort = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const sortedLandlords = useMemo(() => {
    const text = (v: string | null | undefined) => (v ?? "").trim();
    const getValue = (c: any): string | number => {
      switch (sort.key) {
        case "no": return regNo.get(c.id) ?? 0;
        case "name": return text(c.name);
        case "phone": return phoneDigits(c.phone);
        case "line": return text(c.line);
        case "fullname": return text(c.details?.fullname);
        case "assets": return c.assets?.length ?? 0;
      }
    };
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filteredLandlords].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      // empty text values always go last
      if (va === "" && vb !== "") return 1;
      if (vb === "" && va !== "") return -1;
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), "th", { numeric: true });
      return cmp !== 0 ? cmp * dir : a.id - b.id;
    });
  }, [filteredLandlords, sort, regNo]);

  const sortHeader = (k: SortKey, label: string, className = "") => {
    const active = sort.key === k;
    const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th key={k} className={`px-6 py-4 ${className}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1.5 uppercase tracking-wider font-bold cursor-pointer transition-colors ${active ? "text-accent" : "hover:text-white"}`}
        >
          {label}
          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "" : "opacity-40"}`} />
        </button>
      </th>
    );
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลเจ้าของทรัพย์ "${name}"?\nการลบนี้จะลบรายละเอียดส่วนตัว (LandlordDetails) ทั้งหมดด้วย แต่ทรัพย์สินต่างๆ ที่เชื่อมโยงจะยังอยู่ (โดยจะถูกตั้งค่าเจ้าของเป็นค่าว่าง)`
      )
    ) {
      return;
    }

    setIsDeleting(id);
    setActionError("");
    setSuccessMessage("");

    const res = await deleteLandlordAction(id);
    if (res.success) {
      setLandlords((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage(`ลบข้อมูลเจ้าของทรัพย์ "${name}" สำเร็จ`);
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    } else {
      setActionError(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">รายชื่อเจ้าของทรัพย์สิน (Property Owners)</h2>
          <p className="text-xs text-white/50 mt-1">ข้อมูลส่วนตัวและรายละเอียดสัญญาจะแสดงผลภายในระบบ Admin เท่านั้น</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${currentLang}/manage`}
            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            ← รายการทรัพย์สิน
          </Link>
          <Link
            href={`/${currentLang}/manage/landlord/new`}
            className="bg-accent hover:bg-accent-dark text-primary-dark text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            + เพิ่มเจ้าของทรัพย์
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="bg-accent/15 border border-accent/30 text-accent rounded-xl p-4 text-xs font-semibold animate-fade-in">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-xs font-semibold animate-fade-in">
          {actionError}
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาเจ้าของทรัพย์ด้วยชื่อ, เบอร์โทรศัพท์, Line ID, อีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-black/45 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-white/50 font-bold uppercase tracking-wider">
                {sortHeader("no", "ลำดับ", "text-center w-24")}
                {sortHeader("name", "ชื่อเรียกในระบบ")}
                {sortHeader("phone", "เบอร์โทรศัพท์")}
                {sortHeader("line", "Line ID")}
                {sortHeader("fullname", "ชื่อจริง/นามสกุล")}
                {sortHeader("assets", "รายการทรัพย์สิน")}
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLandlords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-white/40">
                    ไม่พบข้อมูลเจ้าของทรัพย์สิน
                  </td>
                </tr>
              ) : (
                sortedLandlords.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-center text-white/50 font-mono">{regNo.get(c.id)}</td>
                    <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white/70">{c.phone ? formatThaiPhone(c.phone) : "-"}</td>
                    <td className="px-6 py-4 text-white/70">{c.line || "-"}</td>
                    <td className="px-6 py-4 text-white/70">{c.details?.fullname || "-"}</td>
                    <td className="px-6 py-4">
                      {c.assets && c.assets.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-white/70">
                          {c.assets.map((asset: any) => (
                            <li key={asset.id} className="truncate max-w-md">
                              <Link
                                href={`/${currentLang}/property/list/${asset.code}`}
                                target="_blank"
                              >
                                {asset.code}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-white/40 italic">ไม่มีทรัพย์สิน</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/${currentLang}/manage/landlord/edit/${c.id}`}
                          title="ดูรายละเอียด / แก้ไข"
                          className="p-1.5 text-white/30 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={isDeleting === c.id}
                          title="ลบ"
                          className="p-1.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {isDeleting === c.id ? (
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
