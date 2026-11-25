"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { EllipsisVertical, type LucideIcon } from "lucide-react";

export interface RowAction {
  label: string;
  Icon: LucideIcon;
  /** link target; omit and pass onSelect for a button */
  href?: string;
  newTab?: boolean;
  onSelect?: () => void;
  /** red, separated from the rest (delete) */
  danger?: boolean;
  disabled?: boolean;
  /** small note on the right, e.g. why it's disabled */
  hint?: string;
}

const MENU_WIDTH = 208;

/**
 * "⋮" (kebab) menu for a table row. The list is rendered into <body> with fixed
 * positioning so it isn't clipped by the table's horizontal scroll container.
 */
export default function RowActionsMenu({ actions, label = "เมนูจัดการ" }: { actions: RowAction[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // place the menu under the button (or above it when there's no room below)
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const height = menuRef.current?.offsetHeight ?? actions.length * 42 + 16;
    const below = r.bottom + 6;
    const top = below + height > window.innerHeight - 8 ? Math.max(8, r.top - height - 6) : below;
    const left = Math.min(Math.max(8, r.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
    setPos({ top, left });
  }, [open, actions.length]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const itemCls = (a: RowAction) =>
    `w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold text-left transition-colors ${
      a.disabled
        ? "text-white/25 cursor-not-allowed"
        : a.danger
          ? "text-red-400 hover:bg-red-500/15 cursor-pointer"
          : "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
    }`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={`w-9 h-9 inline-flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
          open ? "bg-accent border-accent text-primary-dark" : "border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5"
        }`}
      >
        <EllipsisVertical className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: MENU_WIDTH }}
            className="fixed z-[70] p-1.5 bg-[#0A192F] border border-white/15 rounded-xl shadow-2xl text-white"
          >
            {actions.map((a) => {
              const content = (
                <>
                  <a.Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{a.label}</span>
                  {a.hint && <span className="text-[10px] font-normal text-white/30 shrink-0">{a.hint}</span>}
                </>
              );
              return (
                <div key={a.label} className={a.danger ? "mt-1 pt-1 border-t border-white/10" : ""}>
                  {a.href && !a.disabled ? (
                    <Link
                      href={a.href}
                      role="menuitem"
                      target={a.newTab ? "_blank" : undefined}
                      onClick={() => setOpen(false)}
                      className={itemCls(a)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={a.disabled}
                      onClick={() => {
                        setOpen(false);
                        a.onSelect?.();
                      }}
                      className={itemCls(a)}
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
