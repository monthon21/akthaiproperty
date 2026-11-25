"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, ArrowUpRight, type LucideIcon } from "lucide-react";

export interface FormSection {
  /** id of the section element in the form */
  id: string;
  /** short label shown under the icon */
  label: string;
  /** full section name (tooltip / screen readers) */
  title: string;
  Icon: LucideIcon;
  /** marked as an important section */
  important?: boolean;
  /** opens another page instead of scrolling to a section on this one */
  href?: string;
}

interface Props {
  sections: FormSection[];
  onSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
  saving?: boolean;
}

const tileCls =
  "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-3 text-center transition-all cursor-pointer active:scale-95";

/**
 * Sticky shortcut grid for long forms: 2 columns of section tiles, then a full-width Save button.
 * Click a tile to jump to its section; the section on screen is highlighted while scrolling.
 */
export default function FormSectionNav({ sections, onSave, saving }: Props) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections
      .filter((s) => !s.href)
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // the section crossing the upper third of the viewport is the "current" one
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  // 2-column grid; with an odd number of sections the last tile takes a full row
  const lastSpansRow = sections.length % 2 === 1;

  return (
    <aside className="hidden lg:block sticky top-28 self-start">
      <nav aria-label="หัวข้อในฟอร์ม" className="bg-[#112240] border border-white/10 rounded-2xl p-2.5 shadow-xl">
        <p className="px-1 pt-1 pb-2.5 text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Shortcut</p>
        <div className="grid grid-cols-2 gap-2">
          {sections.map(({ id, label, title, Icon, important, href }, index) => {
            const isActive = active === id;
            const wide = lastSpansRow && index === sections.length - 1;
            if (href) {
              return (
                <Link
                  key={id}
                  href={href}
                  title={title}
                  aria-label={title}
                  className={`${tileCls} ${wide ? "col-span-2" : ""} bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-accent/40 hover:bg-accent/5`}
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 text-accent">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="text-[11px] font-bold leading-none whitespace-nowrap">{label}</span>
                  <ArrowUpRight className="absolute top-1.5 right-1.5 w-3 h-3 text-white/30" aria-hidden />
                </Link>
              );
            }
            return (
              <button
                key={id}
                type="button"
                onClick={() => jump(id)}
                title={title}
                aria-label={title}
                aria-current={isActive ? "true" : undefined}
                className={`${tileCls} ${wide ? "col-span-2" : ""} ${
                  isActive
                    ? "bg-accent/15 border-accent text-white"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-accent/40 hover:bg-accent/5"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    isActive ? "bg-accent text-primary-dark" : "bg-accent/10 text-accent"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                </span>
                <span className="text-[11px] font-bold leading-none whitespace-nowrap">{label}</span>
                {important && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" title="หัวข้อสำคัญ" />}
              </button>
            );
          })}

          {/* Save — full-width (2×1) under the section tiles */}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="col-span-2 mt-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-primary-dark font-black text-sm shadow-lg shadow-accent/20 hover:bg-accent-dark transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-[18px] h-[18px]" strokeWidth={2} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </nav>
    </aside>
  );
}
