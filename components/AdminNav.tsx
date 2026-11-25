"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  UserRound,
  Users,
  Mail,
  Newspaper,
  MapPin,
  Building2,
  FileSignature,
  Plus,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  path: string; // without /{lang}
  label: string;
  Icon: LucideIcon;
  primary?: boolean;
}

const ASSETS: MenuItem = { path: "/manage", label: "ทรัพย์สิน", Icon: LayoutGrid };

const MENU: MenuItem[] = [
  { path: "/addnew", label: "เพิ่มทรัพย์", Icon: Plus, primary: true },
  { path: "/manage/documents", label: "เอกสาร", Icon: FileSignature },
  { path: "/manage/landlord", label: "เจ้าของทรัพย์", Icon: Users },
  { path: "/manage/projects", label: "โครงการ", Icon: Building2 },
  { path: "/manage/places", label: "สถานที่ใกล้เคียง", Icon: MapPin },
  { path: "/manage/inbox", label: "ข้อความ", Icon: Mail },
  { path: "/manage/blog", label: "บล็อก", Icon: Newspaper },
  { path: "/myprofile", label: "โปรไฟล์", Icon: UserRound },
];

function isActive({ path }: MenuItem, pathname: string) {
  // "ทรัพย์สิน" covers the asset list and the asset edit page, not the other /manage/* sections
  if (path === "/manage") return pathname === "/manage" || pathname.startsWith("/edit/");
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Admin navigation shared by every admin page.
 *  - variant "grid": 4×2 icon tiles (Asset Management home)
 *  - variant "bar" : compact tab bar with the current page highlighted (all other admin pages)
 */
export default function AdminNav({ variant = "bar" }: { variant?: "grid" | "bar" }) {
  const params = useParams();
  const lang = (params?.lang as string) || "th";
  const fullPath = usePathname() || "";
  const pathname = fullPath.replace(new RegExp(`^/${lang}(?=/|$)`), "") || "/";

  if (variant === "grid") {
    return (
      <nav aria-label="เมนูผู้ดูแล" className="grid grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
        {MENU.map(({ path, label, Icon, primary }) => (
          <Link
            key={path}
            href={`/${lang}${path}`}
            className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border px-1.5 py-3 sm:py-5 lg:w-32 transition-all active:scale-95 ${
              primary
                ? "bg-accent border-accent text-primary-dark shadow-lg shadow-accent/20 hover:bg-accent-dark"
                : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:border-accent/50 hover:bg-accent/5"
            }`}
          >
            <span
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-colors ${
                primary ? "bg-primary-dark/10" : "bg-accent/10 text-accent group-hover:bg-accent/20"
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            </span>
            <span className="text-[10px] sm:text-xs font-bold leading-tight text-center sm:whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  const items = [ASSETS, ...MENU];
  return (
    <div className="max-w-6xl mx-auto px-6 mb-8">
      <nav
        aria-label="เมนูผู้ดูแล"
        className="flex items-center gap-1.5 overflow-x-auto bg-[#112240]/80 border border-white/10 rounded-2xl p-1.5 shadow-xl backdrop-blur [scrollbar-width:none]"
      >
        <span className="hidden md:flex items-center px-3 text-[9px] font-bold text-accent uppercase tracking-[0.3em] whitespace-nowrap">
          Admin
        </span>
        {items.map((item) => {
          const active = isActive(item, pathname);
          const { path, label, Icon, primary } = item;
          return (
            <Link
              key={path}
              href={`/${lang}${path}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 shrink-0 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-accent text-primary-dark shadow-md"
                  : primary
                    ? "text-accent hover:bg-accent/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
