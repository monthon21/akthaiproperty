"use client";

import { usePathname } from "next/navigation";
import HeroSearchBox from "./HeroSearchBox";

export default function NotFoundSearch() {
  const pathname = usePathname();
  // Extract language from pathname (e.g. /en/..., /zh/...)
  const pathParts = pathname?.split("/") || [];
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 mb-8 relative z-10 animate-fade-in [animation-delay:200ms]">
      <div className="bg-[#112240]/80 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-2xl">
        <h3 className="text-white font-bold mb-4 text-left">
          {currentLang === 'zh' ? '搜索房源' : currentLang === 'en' ? 'Search for properties' : 'ค้นหาทรัพย์สินที่น่าสนใจ'}
        </h3>
        <HeroSearchBox currentLang={currentLang} className="mx-auto" />
      </div>
    </div>
  );
}
