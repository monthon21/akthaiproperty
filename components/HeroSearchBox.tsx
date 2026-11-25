"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

type Lang = "th" | "en" | "zh";

const QUICK_FILTER_TEXT: Record<Lang, Record<string, string>> = {
  th: { type: "ประเภททรัพย์", price: "ช่วงราคา", beds: "ห้องนอน", anyType: "ทุกประเภท", anyPrice: "ทุกราคา", anyBeds: "ทุกจำนวน", bedsPlus: "ห้องนอนขึ้นไป", perMonth: "/ด." },
  en: { type: "Property type", price: "Price range", beds: "Bedrooms", anyType: "All types", anyPrice: "Any price", anyBeds: "Any", bedsPlus: "+ bedrooms", perMonth: "/mo" },
  zh: { type: "房源类型", price: "价格范围", beds: "卧室", anyType: "所有类型", anyPrice: "不限价格", anyBeds: "不限", bedsPlus: "间卧室以上", perMonth: "/月" },
};

const QUICK_TYPES: { value: string; label: Record<Lang, string> }[] = [
  { value: "DETACHED_HOUSE", label: { th: "บ้านเดี่ยว", en: "Detached house", zh: "独栋别墅" } },
  { value: "TOWNHOUSE", label: { th: "ทาวน์เฮาส์", en: "Townhouse", zh: "联排别墅" } },
  { value: "SEMI_DETACHED", label: { th: "บ้านแฝด", en: "Semi-detached", zh: "双拼别墅" } },
  { value: "APARTMENT", label: { th: "อพาร์ทเม้นท์", en: "Apartment", zh: "公寓" } },
  { value: "COMMERCIAL", label: { th: "อาคารพาณิชย์", en: "Commercial", zh: "商业楼" } },
  { value: "LAND", label: { th: "ที่ดินเปล่า", en: "Land", zh: "土地" } },
  { value: "FACTORY", label: { th: "โรงงาน / โกดัง", en: "Factory / Warehouse", zh: "工厂 / 仓库" } },
];

// [min, max] in THB; null = open-ended
const SALE_PRICE_RANGES: [number | null, number | null][] = [
  [null, 2000000], [2000000, 3000000], [3000000, 5000000], [5000000, 10000000], [10000000, null],
];
const RENT_PRICE_RANGES: [number | null, number | null][] = [
  [null, 15000], [15000, 25000], [25000, 40000], [40000, 60000], [60000, null],
];

function formatBaht(n: number) {
  if (n >= 1000000) return `${n / 1000000}M`;
  return `${n / 1000}K`;
}

function rangeLabel([min, max]: [number | null, number | null], suffix = "") {
  if (min === null && max !== null) return `< ${formatBaht(max)}${suffix}`;
  if (max === null && min !== null) return `${formatBaht(min)}+${suffix}`;
  return `${formatBaht(min!)} - ${formatBaht(max!)}${suffix}`;
}

interface HeroSearchBoxProps {
  currentLang: string;
  defaultTab?: string;
  className?: string;
}

export default function HeroSearchBox({ currentLang, defaultTab = 'all', className = "max-w-2xl mx-auto lg:mx-0" }: HeroSearchBoxProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => {
    const keys = key.split(".");
    let result: any = dictionaries[currentLang as keyof typeof dictionaries];
    for (const k of keys) {
      if (result) {
        result = result[k];
      }
    }
    return result || key;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const { searchAssetSuggestionsAction } = await import("@/lib/actions/asset");
        const res = await searchAssetSuggestionsAction(searchQuery);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const lang: Lang = (["th", "en", "zh"].includes(currentLang) ? currentLang : "th") as Lang;
  const qf = QUICK_FILTER_TEXT[lang];
  const priceRanges = activeTab === 'rent' ? RENT_PRICE_RANGES : activeTab === 'buy' ? SALE_PRICE_RANGES : [];

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setPriceRange(''); // sale and rent price ranges are different
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeTab === 'buy') params.set("deal", "sell");
    if (activeTab === 'rent') params.set("deal", "rent");
    if (propertyType) params.set("propertyType", propertyType);
    if (priceRange !== '' && priceRanges[Number(priceRange)]) {
      const [min, max] = priceRanges[Number(priceRange)];
      if (min !== null) params.set("minPrice", String(min));
      if (max !== null) params.set("maxPrice", String(max));
    }
    if (bedrooms) params.set("bedrooms", bedrooms);

    router.push(`/${currentLang}/search?${params.toString()}`);
  };

  const handleSuggestionClick = (assetId: string) => {
    router.push(`/${currentLang}/property/list/${assetId}`);
  };

  return (
    <div className={`bg-[#112240]/90 border border-accent/20 rounded p-5 shadow-2xl relative z-40 ${className}`} ref={searchContainerRef}>
      <div className="flex gap-2 p-1 bg-black/40 rounded border border-white/5 mb-4">
        <button 
          onClick={() => changeTab('all')}
          className={`flex-1 py-2.5 text-[10px] font-alt font-bold tracking-widest rounded transition-all duration-300 cursor-pointer ${activeTab === 'all' ? 'bg-accent text-primary-dark shadow-md font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {currentLang === "en" ? "ALL" : currentLang === "zh" ? "所有" : "ทั้งหมด"}
        </button>
        <button 
          onClick={() => changeTab('buy')}
          className={`flex-1 py-2.5 text-[10px] font-alt font-bold tracking-widest rounded transition-all duration-300 cursor-pointer ${activeTab === 'buy' ? 'bg-accent text-primary-dark shadow-md font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {t("hero.tab_buy")}
        </button>
        <button 
          onClick={() => changeTab('rent')}
          className={`flex-1 py-2.5 text-[10px] font-alt font-bold tracking-widest rounded transition-all duration-300 cursor-pointer ${activeTab === 'rent' ? 'bg-accent text-primary-dark shadow-md font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {t("hero.tab_rent")}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-[2] w-full relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
            placeholder={t("hero.search_placeholder")} 
            className="w-full h-12 pl-11 pr-4 bg-black/50 border border-white/10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/60 transition-all font-medium font-alt"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#112240] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-white/50 animate-pulse text-left">
                  {currentLang === "en" ? "Searching..." : currentLang === "zh" ? "搜索中..." : "กำลังค้นหา..."}
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {suggestions.map((item) => (
                    <li 
                      key={item.id}
                      onClick={() => handleSuggestionClick(item.code || item.id)}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors flex flex-col gap-1 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white truncate pr-2">{item.title}</span>
                        <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">{item.code}</span>
                      </div>
                      <div className="text-[10px] text-white/50 flex flex-wrap gap-2 items-center">
                        {item.projectName && <span className="text-white/70">[{item.projectName}]</span>}
                        <span>
                          {item.address ? `${item.address} ` : ""}
                          {item.district} {item.province}
                        </span>
                        {item.landlord?.name && (
                          <span className="text-[9px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            👤 เจ้าของ: {item.landlord.name}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-xs text-white/50 text-left">
                  {currentLang === "en" ? "No items found. Click 'Search' to view all." : currentLang === "zh" ? "未找到项目。 点击“搜索”查看全部。" : "ไม่พบรายการที่ค้นหา กด \"ค้นหา\" เพื่อดูทั้งหมด"}
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={handleSearchSubmit}
          className="w-full md:w-auto h-12 px-8 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest rounded hover:bg-accent-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/15 cursor-pointer"
        >
          {t("hero.btn_search")}
        </button>
      </div>

      {/* Quick filters */}
      <div className={`grid gap-2 mt-3 ${priceRanges.length > 0 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <select aria-label={qf.type} value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="h-10 w-full px-3 bg-black/50 border border-white/10 rounded text-[11px] text-white focus:outline-none focus:border-accent/60 transition-all font-alt cursor-pointer">
          <option value="" className="bg-[#112240]">{qf.type}: {qf.anyType}</option>
          {QUICK_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#112240]">{opt.label[lang]}</option>
          ))}
        </select>
        {priceRanges.length > 0 && (
          <select aria-label={qf.price} value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="h-10 w-full px-3 bg-black/50 border border-white/10 rounded text-[11px] text-white focus:outline-none focus:border-accent/60 transition-all font-alt cursor-pointer">
            <option value="" className="bg-[#112240]">{qf.price}: {qf.anyPrice}</option>
            {priceRanges.map((range, i) => (
              <option key={i} value={String(i)} className="bg-[#112240]">฿ {rangeLabel(range, activeTab === 'rent' ? qf.perMonth : '')}</option>
            ))}
          </select>
        )}
        <select aria-label={qf.beds} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-10 w-full px-3 bg-black/50 border border-white/10 rounded text-[11px] text-white focus:outline-none focus:border-accent/60 transition-all font-alt cursor-pointer">
          <option value="" className="bg-[#112240]">{qf.beds}: {qf.anyBeds}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)} className="bg-[#112240]">{n} {qf.bedsPlus}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
