"use client";

import { useState } from "react";

export type LangTab = "th" | "en" | "zh";

const LANG_TABS: { key: LangTab; label: string; flag: string }[] = [
  { key: "th", label: "ไทย", flag: "🇹🇭" },
  { key: "en", label: "EN", flag: "🇬🇧" },
  { key: "zh", label: "中文", flag: "🇨🇳" },
];

interface LangTabTextareaProps {
  label: string;
  nameTh: string;
  nameEn: string;
  nameZh: string;
  valueTh: string;
  valueEn: string;
  valueZh: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

export function LangTabTextarea({
  label,
  nameTh,
  nameEn,
  nameZh,
  valueTh,
  valueEn,
  valueZh,
  onChange,
  rows = 4,
  placeholder = "",
  required = false,
}: LangTabTextareaProps) {
  const [activeTab, setActiveTab] = useState<LangTab>("th");

  const nameMap: Record<LangTab, string> = { th: nameTh, en: nameEn, zh: nameZh };
  const valueMap: Record<LangTab, string> = { th: valueTh, en: valueEn, zh: valueZh };
  const placeholderMap: Record<LangTab, string> = {
    th: placeholder,
    en: placeholder ? `${placeholder} (English)` : "English text...",
    zh: placeholder ? `${placeholder} (中文)` : "中文内容...",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
          {label}{required && <span className="text-accent ml-0.5">*</span>}
        </label>
        {/* Lang Tab Switcher */}
        <div className="flex gap-1 bg-black/40 border border-white/8 rounded-lg p-0.5">
          {LANG_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider
                transition-all duration-200 cursor-pointer
                ${activeTab === tab.key
                  ? "bg-accent text-primary-dark shadow"
                  : "text-white/40 hover:text-white/70"
                }
              `}
            >
              <span>{tab.flag}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <textarea
          name={nameMap[activeTab]}
          rows={rows}
          value={valueMap[activeTab]}
          onChange={onChange}
          required={required && activeTab === "th"}
          placeholder={placeholderMap[activeTab]}
          className="w-full bg-black/45 border border-white/10 rounded-xl p-4 text-xs focus:outline-none focus:border-accent transition-all text-white resize-none leading-relaxed"
        />
        {/* Lang indicator badge */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/15">
            {LANG_TABS.find((t) => t.key === activeTab)?.flag}{" "}
            {LANG_TABS.find((t) => t.key === activeTab)?.label}
          </span>
        </div>
      </div>
    </div>
  );
}

interface LangTabInputProps {
  label: string;
  nameTh: string;
  nameEn: string;
  nameZh: string;
  valueTh: string;
  valueEn: string;
  valueZh: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export function LangTabInput({
  label,
  nameTh,
  nameEn,
  nameZh,
  valueTh,
  valueEn,
  valueZh,
  onChange,
  placeholder = "",
  required = false,
}: LangTabInputProps) {
  const [activeTab, setActiveTab] = useState<LangTab>("th");

  const nameMap: Record<LangTab, string> = { th: nameTh, en: nameEn, zh: nameZh };
  const valueMap: Record<LangTab, string> = { th: valueTh, en: valueEn, zh: valueZh };
  const placeholderMap: Record<LangTab, string> = {
    th: placeholder,
    en: placeholder ? `${placeholder} (English)` : "English...",
    zh: placeholder ? `${placeholder} (中文)` : "中文...",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
          {label}{required && <span className="text-accent ml-0.5">*</span>}
        </label>
        {/* Lang Tab Switcher */}
        <div className="flex gap-1 bg-black/40 border border-white/8 rounded-lg p-0.5">
          {LANG_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider
                transition-all duration-200 cursor-pointer
                ${activeTab === tab.key
                  ? "bg-accent text-primary-dark shadow"
                  : "text-white/40 hover:text-white/70"
                }
              `}
            >
              <span>{tab.flag}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          name={nameMap[activeTab]}
          value={valueMap[activeTab]}
          onChange={onChange}
          required={required && activeTab === "th"}
          placeholder={placeholderMap[activeTab]}
          className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 pr-16 text-xs focus:outline-none focus:border-accent transition-all text-white"
        />
        {/* Lang indicator badge */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/15">
            {LANG_TABS.find((t) => t.key === activeTab)?.flag}{" "}
            {LANG_TABS.find((t) => t.key === activeTab)?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
