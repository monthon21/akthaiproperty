"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Ban, CircleCheck, Edit, RotateCcw, Search, Trash2 } from "lucide-react";
import RowActionsMenu from "@/components/RowActionsMenu";
import { setUserBlockedAction, setUserTrashedAction, updateUserRoleAction, UserRoleValue } from "@/lib/actions/user";
import { DATE_LOCALE, formatThaiPhone } from "@/lib/format";

export interface UserRow {
  id: number;
  username: string;
  fullname: string | null;
  email: string | null;
  image: string | null;
  role: UserRoleValue;
  isBlocked: boolean;
  /** set when the account is in the trash */
  deletedAt: string | null;
  createdAt: string;
  profile: { position: string | null; phone: string | null } | null;
}

const ROLE_LABELS: Record<UserRoleValue, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  AGENT: "ตัวแทนขาย",
  MODERATOR: "ผู้ช่วยดูแล",
  LANDLORD: "เจ้าของทรัพย์",
  USER: "ผู้ใช้ทั่วไป",
};
const ROLE_ORDER: UserRoleValue[] = ["ADMIN", "AGENT", "MODERATOR", "LANDLORD", "USER"];

const DATE = new Intl.DateTimeFormat(DATE_LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" });

type SortKey = "id" | "name" | "role" | "date";

export default function ManageUsersClient({ initialUsers, currentUserId, currentLang, errorMsg }: { initialUsers: UserRow[]; currentUserId: number; currentLang: string; errorMsg?: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleValue | "">("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "id", dir: "asc" });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(errorMsg ? { tone: "error", text: errorMsg } : null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = users.filter(
      (u) =>
        Boolean(u.deletedAt) === showTrash &&
        (!roleFilter || u.role === roleFilter) &&
        (!q || [String(u.id), u.username, u.fullname, u.email, u.profile?.phone].some((v) => (v ?? "").toLowerCase().includes(q)))
    );
    const name = (u: UserRow) => (u.fullname || u.username).trim();
    const compare: Record<SortKey, (a: UserRow, b: UserRow) => number> = {
      id: (a, b) => a.id - b.id,
      name: (a, b) => name(a).localeCompare(name(b), "th"),
      role: (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
      date: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    };
    return [...filtered].sort((a, b) => (compare[sort.key](a, b) || a.id - b.id) * (sort.dir === "asc" ? 1 : -1));
  }, [users, query, roleFilter, sort, showTrash]);

  const changeRole = async (user: UserRow, role: UserRoleValue) => {
    if (role === user.role) return;
    const name = user.fullname || user.username;
    if (!confirm(`เปลี่ยนสิทธิ์ของ ${name} จาก “${ROLE_LABELS[user.role]}” เป็น “${ROLE_LABELS[role]}” ?`)) return;
    setSavingId(user.id);
    const res = await updateUserRoleAction(user.id, role);
    setSavingId(null);
    if (!res.success) {
      setMessage({ tone: "error", text: res.error || "บันทึกไม่สำเร็จ" });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    setMessage({ tone: "ok", text: `เปลี่ยนสิทธิ์ของ ${name} เป็น “${ROLE_LABELS[role]}” แล้ว — มีผลเมื่อผู้ใช้เข้าสู่ระบบครั้งถัดไป` });
  };

  const toggleBlock = async (user: UserRow) => {
    const name = user.fullname || user.username;
    const block = !user.isBlocked;
    if (block && !confirm(`ระงับการใช้งานของ ${name} ?\nบัญชีนี้จะเข้าสู่ระบบไม่ได้จนกว่าจะปลดระงับ`)) return;
    setSavingId(user.id);
    const res = await setUserBlockedAction(user.id, block);
    setSavingId(null);
    if (!res.success) return setMessage({ tone: "error", text: res.error || "บันทึกไม่สำเร็จ" });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: block } : u)));
    setMessage({ tone: "ok", text: block ? `ระงับการใช้งานของ ${name} แล้ว` : `ปลดระงับ ${name} แล้ว` });
  };

  const toggleTrash = async (user: UserRow) => {
    const name = user.fullname || user.username;
    const trash = !user.deletedAt;
    if (trash && !confirm(`ย้าย ${name} ไปถังขยะ ?\nบัญชีนี้จะเข้าสู่ระบบไม่ได้ ข้อมูลยังอยู่และกู้คืนได้จากถังขยะ`)) return;
    setSavingId(user.id);
    const res = await setUserTrashedAction(user.id, trash);
    setSavingId(null);
    if (!res.success) return setMessage({ tone: "error", text: res.error || "บันทึกไม่สำเร็จ" });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, deletedAt: res.deletedAt ?? null } : u)));
    setMessage({ tone: "ok", text: trash ? `ย้าย ${name} ไปถังขยะแล้ว` : `กู้คืนบัญชี ${name} แล้ว` });
  };

  const sortHeader = (key: SortKey, label: string, cls = "") => {
    const active = sort.key === key;
    return (
      <th className={`px-5 py-4 ${cls}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => setSort((cur) => (cur.key === key ? { key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
          title="คลิกเพื่อเรียงลำดับ"
          className={`inline-flex items-center gap-1 font-bold cursor-pointer transition-colors ${active ? "text-accent" : "hover:text-white"}`}
        >
          {label}
          <span className={active ? "" : "opacity-30"}>{active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
        </button>
      </th>
    );
  };

  const active = users.filter((u) => !u.deletedAt);
  const trashedCount = users.length - active.length;
  const count = (role: UserRoleValue) => active.filter((u) => u.role === role).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">ผู้ใช้งาน</span>
          <h1 className="text-3xl font-black tracking-tight">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-white/40 mt-2">
            ทั้งหมด {active.length} บัญชี — ผู้ดูแลระบบ {count("ADMIN")} · ตัวแทนขาย {count("AGENT")} · ผู้ใช้ทั่วไป {count("USER")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowTrash((v) => !v)}
            aria-pressed={showTrash}
            className={`h-11 px-4 inline-flex items-center gap-2 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${
              showTrash ? "bg-red-500/15 border-red-500/40 text-red-300" : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
            }`}
          >
            <Trash2 className="w-4 h-4" /> ถังขยะ ({trashedCount})
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา ชื่อ, username, อีเมล..."
              className="w-64 max-w-full h-11 pl-10 pr-4 bg-black/45 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRoleValue | "")}
            className="h-11 bg-black/45 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent cursor-pointer"
            aria-label="กรองตามสิทธิ์"
          >
            <option className="bg-[#112240]" value="">ทุกสิทธิ์</option>
            {ROLE_ORDER.map((r) => (
              <option key={r} className="bg-[#112240]" value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm rounded-xl px-4 py-3 border ${
            message.tone === "ok" ? "text-accent bg-accent/10 border-accent/30" : "text-red-400 bg-red-500/10 border-red-500/30"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="bg-[#112240] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap [&_td]:align-middle">
            <thead className="bg-[#233554]/50 border-b border-white/5 text-white/50 text-xs">
              <tr>
                {sortHeader("id", "ID", "w-16 text-center")}
                {sortHeader("name", "ชื่อผู้ใช้")}
                <th className="px-5 py-4 font-bold">อีเมล / โทร</th>
                {sortHeader("role", "สิทธิ์")}
                {sortHeader("date", "วันที่สมัคร")}
                <th className="px-5 py-4 font-bold text-center w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">{showTrash ? "ถังขยะว่าง" : "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข"}</td>
                </tr>
              ) : (
                rows.map((u) => {
                  const isMe = u.id === currentUserId;
                  const name = u.fullname || u.username;
                  return (
                    <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors ${u.isBlocked || u.deletedAt ? "opacity-60" : ""}`}>
                      <td className="px-5 py-4 text-center font-mono text-white/50">{u.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="relative w-9 h-9 rounded-full overflow-hidden bg-accent/15 text-accent font-black flex items-center justify-center shrink-0">
                            {u.image ? <Image src={u.image} alt="" fill sizes="36px" className="object-cover" /> : name.charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-bold text-white">
                              {name}
                              {isMe && <span className="ml-2 text-[10px] font-bold text-primary-dark bg-accent rounded-full px-2 py-0.5">คุณ</span>}
                              {u.isBlocked && <span className="ml-2 text-[10px] font-bold text-red-300 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5">ถูกระงับ</span>}
                            </span>
                            <span className="block text-xs text-white/40">
                              @{u.username}
                              {u.profile?.position ? ` · ${u.profile.position}` : ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        <span className="block">{u.email || "-"}</span>
                        {u.profile?.phone && <span className="block text-xs text-white/40">{formatThaiPhone(u.profile.phone)}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as UserRoleValue)}
                          disabled={isMe || savingId === u.id || Boolean(u.deletedAt)}
                          title={isMe ? "เปลี่ยนสิทธิ์ของบัญชีตัวเองไม่ได้" : "เปลี่ยนสิทธิ์"}
                          className={`h-9 rounded-lg border px-3 text-xs font-bold focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                            u.role === "ADMIN" ? "bg-accent/15 border-accent/40 text-accent" : "bg-black/45 border-white/10 text-white"
                          }`}
                        >
                          {ROLE_ORDER.map((r) => (
                            <option key={r} className="bg-[#112240] text-white" value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs">{DATE.format(new Date(u.createdAt))}</td>
                      <td className="px-5 py-4 text-center">
                        <RowActionsMenu
                          label={`เมนูจัดการ ${name}`}
                          actions={
                            u.deletedAt
                              ? [{ label: "Restore", Icon: RotateCcw, disabled: savingId === u.id, onSelect: () => toggleTrash(u) }]
                              : [
                                  { label: "Edit", Icon: Edit, href: `/${currentLang}/manage/users/edit/${u.id}` },
                                  u.isBlocked
                                    ? { label: "Unblock", Icon: CircleCheck, disabled: savingId === u.id, onSelect: () => toggleBlock(u) }
                                    : { label: "Block", Icon: Ban, disabled: isMe || savingId === u.id, hint: isMe ? "บัญชีคุณ" : undefined, onSelect: () => toggleBlock(u) },
                                  { label: "Trash", Icon: Trash2, danger: true, disabled: isMe || savingId === u.id, hint: isMe ? "บัญชีคุณ" : undefined, onSelect: () => toggleTrash(u) },
                                ]
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
