"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

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

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeTab !== 'all') params.set("type", activeTab);
    
    router.push(`/${currentLang}/search?${params.toString()}`);
  };

  const handleSuggestionClick = (assetId: string) => {
    router.push(`/${currentLang}/property/list/${assetId}`);
  };

  return (
    <div className={`bg-[#112240]/90 border border-accent/20 rounded p-5 shadow-2xl relative z-40 ${className}`} ref={searchContainerRef}>
      <div className="flex gap-2 p-1 bg-black/40 rounded border border-white/5 mb-4">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 text-[10px] font-alt font-bold tracking-widest rounded transition-all duration-300 cursor-pointer ${activeTab === 'all' ? 'bg-accent text-primary-dark shadow-md font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {currentLang === "en" ? "ALL" : currentLang === "zh" ? "所有" : "ทั้งหมด"}
        </button>
        <button 
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-2.5 text-[10px] font-alt font-bold tracking-widest rounded transition-all duration-300 cursor-pointer ${activeTab === 'buy' ? 'bg-accent text-primary-dark shadow-md font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {t("hero.tab_buy")}
        </button>
        <button 
          onClick={() => setActiveTab('rent')}
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
                      onClick={() => handleSuggestionClick(item.id)}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors flex flex-col gap-1 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white truncate pr-2">{item.title}</span>
                        <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">{item.code}</span>
                      </div>
                      <div className="text-[10px] text-white/50 flex gap-2">
                        {item.projectName && <span className="text-white/70">[{item.projectName}]</span>}
                        <span>{item.district} {item.province}</span>
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
    </div>
  );
}
