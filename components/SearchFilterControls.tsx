"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFilterControlsProps {
  currentLang: string;
}

export default function SearchFilterControls({ currentLang }: SearchFilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State matching filter criteria
  const [q, setQ] = useState("");
  const [code, setCode] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [deal, setDeal] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [isExpanded, setIsExpanded] = useState(true);

  // Sync state with URL params on load/change
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setCode(searchParams.get("code") || "");
    setProvince(searchParams.get("province") || "");
    setZipCode(searchParams.get("zipCode") || "");
    setProjectName(searchParams.get("projectName") || "");
    setPropertyType(searchParams.get("propertyType") || "ALL");
    setDeal(searchParams.get("deal") || "all");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (code.trim()) params.set("code", code.trim());
    if (province.trim()) params.set("province", province.trim());
    if (zipCode.trim()) params.set("zipCode", zipCode.trim());
    if (projectName.trim()) params.set("projectName", projectName.trim());
    if (propertyType !== "ALL") params.set("propertyType", propertyType);
    if (deal !== "all") params.set("deal", deal);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

    router.push(`/${currentLang}/search?${params.toString()}`);
  };

  const handleClear = () => {
    setQ("");
    setCode("");
    setProvince("");
    setZipCode("");
    setProjectName("");
    setPropertyType("ALL");
    setDeal("all");
    setMinPrice("");
    setMaxPrice("");
    router.push(`/${currentLang}/search`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mb-8">
      <div className="bg-[#112240] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              {currentLang === "en" ? "Filter Assets" : currentLang === "zh" ? "筛选房源" : "ค้นหาและกรองทรัพย์สิน"}
            </h2>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>ซ่อนฟิลเตอร์</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              </>
            ) : (
              <>
                <span>แสดงฟิลเตอร์</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <form onSubmit={handleSearch} className="space-y-4 animate-fade-in">
            {/* Grid 1: Basic text filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ชื่อทรัพย์ / คำค้นหา</label>
                <input 
                  type="text" 
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="เช่น บ้านเดี่ยวหรู, วิวสวย" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">รหัสทรัพย์สิน (ID)</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น H001, C002" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ชื่อโครงการ</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="เช่น แสนสิริ, ศุภาลัย" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">จังหวัด</label>
                <input 
                  type="text" 
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="เช่น กรุงเทพ, เชียงใหม่" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
            </div>

            {/* Grid 2: Types, Price & Zip code filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ประเภททรัพย์สิน</label>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="ALL">ทั้งหมด (All Types)</option>
                  <option value="DETACHED_HOUSE">บ้านเดี่ยว (Detached House)</option>
                  <option value="TOWNHOUSE">ทาวน์เฮาส์ (Townhouse)</option>
                  <option value="SEMI_DETACHED">บ้านแฝด (Semi-Detached House)</option>
                  <option value="VILLA">วิลล่า (Villa)</option>
                  <option value="FACTORY">โรงงาน (Factory)</option>
                  <option value="WAREHOUSE">โกดัง (Warehouse)</option>
                  <option value="OFFICE">ออฟฟิศ (Office)</option>
                  <option value="RETAIL">ร้านค้า (Retail)</option>
                  <option value="LAND">ที่ดินเปล่า (Land)</option>
                  <option value="COMMERCIAL">อาคารพาณิชย์ (Commercial Building)</option>
                  <option value="APARTMENT">อพาร์ทเม้นท์ (Apartment)</option>
                  <option value="OTHER">อื่นๆ (Other)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ขาย หรือ เช่า</label>
                <select 
                  value={deal}
                  onChange={(e) => setDeal(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="all">ทั้งหมด (Sell or Rent)</option>
                  <option value="sell">ขาย (For Sell)</option>
                  <option value="rent">เช่า (For Rent)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ราคาต่ำสุด (Min Price)</label>
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="เช่น 1,000,000" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ราคาสูงสุด (Max Price)</label>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="เช่น 10,000,000" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
            </div>

            {/* Grid 3: Zip code & actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
              <div className="w-full md:max-w-xs space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">รหัสไปรษณีย์</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="เช่น 10110" 
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-4 md:mt-0">
                <button 
                  type="button"
                  onClick={handleClear}
                  className="h-11 px-5 border border-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-white/5 active:scale-95"
                >
                  ล้างค่า (Clear)
                </button>
                <button 
                  type="submit"
                  className="h-11 px-8 bg-accent hover:bg-accent-dark text-primary-dark font-black text-xs tracking-widest rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  ค้นหา (Search)
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
