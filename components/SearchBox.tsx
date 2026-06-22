"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  currentLang: string;
  placeholder?: string;
  buttonText?: string;
}

export default function SearchBox({ currentLang, placeholder = "ค้นหา...", buttonText = "ค้นหา" }: SearchBoxProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
    router.push(`/${currentLang}/search?${params.toString()}`);
  };

  const handleSuggestionClick = (assetId: string) => {
    router.push(`/${currentLang}/property/list/${assetId}`);
    setShowSuggestions(false);
  };

  return (
    <div className="flex w-full relative z-40 shadow-lg" ref={searchContainerRef}>
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
        placeholder={placeholder} 
        className="w-full h-11 pl-10 pr-4 bg-[#112240] border border-white/10 rounded-l-md text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/60 transition-all font-medium"
      />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      
          {/* Autocomplete Dropdown */}
          {showSuggestions && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#112240] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-white/50 animate-pulse">
                  {currentLang === "en" ? "Searching..." : currentLang === "zh" ? "搜索中..." : "กำลังค้นหา..."}
                </div>
              ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <li 
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.id)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors flex flex-col gap-1"
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
                <div className="px-4 py-3 text-xs text-white/50">
                  {currentLang === "en" ? `No items found. Click "${buttonText}" to view all.` : currentLang === "zh" ? `未找到项目。 点击“${buttonText}”查看全部。` : `ไม่พบรายการที่ค้นหา กด "${buttonText}" เพื่อดูทั้งหมด`}
                </div>
              )}
        </div>
      )}

      <button 
        onClick={handleSearchSubmit}
        className="h-11 px-5 bg-accent text-primary-dark font-black text-xs tracking-widest rounded-r-md hover:bg-accent-dark transition-all cursor-pointer flex-shrink-0"
      >
        {buttonText}
      </button>
    </div>
  );
}
