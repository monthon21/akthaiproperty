"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const translations = {
  th: {
    filterAssets: "ค้นหาและกรองทรัพย์สิน",
    hideFilter: "ซ่อนฟิลเตอร์",
    showFilter: "แสดงฟิลเตอร์",
    searchProperty: "ค้นหาทรัพย์สิน",
    searchPlaceholder: "ชื่อทรัพย์สิน, รหัสทรัพย์ (ID), หรือชื่อโครงการ",
    province: "จังหวัด",
    provincePlaceholder: "เช่น กรุงเทพ, เชียงใหม่",
    zipCode: "รหัสไปรษณีย์",
    zipCodePlaceholder: "เช่น 10110",
    propertyType: "ประเภททรัพย์สิน",
    dealType: "ขาย หรือ เช่า",
    budget: "งบประมาณ",
    rentMonth: "เช่า / เดือน",
    buy: "ซื้อ",
    buyOrRent: "ซื้อ หรือ เช่า",
    minPrice: "Min",
    maxPrice: "Max",
    bedrooms: "จำนวนห้องนอน",
    allBedrooms: "ทั้งหมด",
    bed1: "1 ห้องนอนขึ้นไป",
    bed2: "2 ห้องนอนขึ้นไป",
    bed3: "3 ห้องนอนขึ้นไป",
    bed4: "4 ห้องนอนขึ้นไป",
    bed5: "5 ห้องนอนขึ้นไป",
    bathrooms: "จำนวนห้องน้ำ",
    allBathrooms: "ทั้งหมด",
    bath1: "1 ห้องน้ำขึ้นไป",
    bath2: "2 ห้องน้ำขึ้นไป",
    bath3: "3 ห้องน้ำขึ้นไป",
    bath4: "4 ห้องน้ำขึ้นไป",
    bath5: "5 ห้องน้ำขึ้นไป",
    parking: "ที่จอดรถ",
    allParking: "ทั้งหมด",
    parking1: "1 คันขึ้นไป",
    parking2: "2 คันขึ้นไป",
    parking3: "3 คันขึ้นไป",
    parking4: "4 คันขึ้นไป",
    usableArea: "พื้นที่ใช้สอย (ตารางเมตร)",
    minArea: "Min",
    maxArea: "Max",
    ownerName: "ชื่อเจ้าของทรัพย์",
    ownerPlaceholder: "ระบุชื่อเจ้าของทรัพย์",
    clear: "ล้างค่า",
    search: "ค้นหา",
    // Types
    ALL: "ทั้งหมด (All Types)",
    DETACHED_HOUSE: "บ้านเดี่ยว (Detached House)",
    TOWNHOUSE: "ทาวน์เฮาส์ (Townhouse)",
    SEMI_DETACHED: "บ้านแฝด (Semi-Detached House)",
    VILLA: "วิลล่า (Villa)",
    FACTORY: "โรงงาน (Factory)",
    WAREHOUSE: "โกดัง (Warehouse)",
    OFFICE: "ออฟฟิศ (Office)",
    RETAIL: "ร้านค้า (Retail)",
    LAND: "ที่ดินเปล่า (Land)",
    COMMERCIAL: "อาคารพาณิชย์ (Commercial Building)",
    APARTMENT: "อพาร์ทเม้นท์ (Apartment)",
    OTHER: "อื่นๆ (Other)",
    // Deal types
    allDeals: "ทั้งหมด (Sell or Rent)",
    sellDeal: "ขาย (For Sell)",
    rentDeal: "เช่า (For Rent)",
  },
  en: {
    filterAssets: "Filter Assets",
    hideFilter: "Hide Filters",
    showFilter: "Show Filters",
    searchProperty: "Search Property",
    searchPlaceholder: "Property name, ID, or Project name",
    province: "Province",
    provincePlaceholder: "e.g., Bangkok, Chiang Mai",
    zipCode: "Zip Code",
    zipCodePlaceholder: "e.g., 10110",
    propertyType: "Property Type",
    dealType: "Deal Type",
    budget: "Budget",
    rentMonth: "Rent / Month",
    buy: "Buy",
    buyOrRent: "Buy or Rent",
    minPrice: "Min",
    maxPrice: "Max",
    bedrooms: "Bedrooms",
    allBedrooms: "All Bedrooms",
    bed1: "1+ Bed",
    bed2: "2+ Beds",
    bed3: "3+ Beds",
    bed4: "4+ Beds",
    bed5: "5+ Beds",
    bathrooms: "Bathrooms",
    allBathrooms: "All Bathrooms",
    bath1: "1+ Bath",
    bath2: "2+ Baths",
    bath3: "3+ Baths",
    bath4: "4+ Baths",
    bath5: "5+ Baths",
    parking: "Parking Spaces",
    allParking: "All Parking",
    parking1: "1+ Parking",
    parking2: "2+ Parking",
    parking3: "3+ Parking",
    parking4: "4+ Parking",
    usableArea: "Usable Area (Sq.M.)",
    minArea: "Min",
    maxArea: "Max",
    ownerName: "Owner Name",
    ownerPlaceholder: "Enter owner name",
    clear: "Clear",
    search: "Search",
    // Types
    ALL: "All Types",
    DETACHED_HOUSE: "Detached House",
    TOWNHOUSE: "Townhouse",
    SEMI_DETACHED: "Semi-Detached House",
    VILLA: "Villa",
    FACTORY: "Factory",
    WAREHOUSE: "Warehouse",
    OFFICE: "Office",
    RETAIL: "Retail",
    LAND: "Land Lot",
    COMMERCIAL: "Commercial Building",
    APARTMENT: "Apartment",
    OTHER: "Other",
    // Deal types
    allDeals: "All (Sell or Rent)",
    sellDeal: "For Sale",
    rentDeal: "For Rent",
  },
  zh: {
    filterAssets: "筛选房源",
    hideFilter: "隐藏筛选",
    showFilter: "显示筛选",
    searchProperty: "搜索房源",
    searchPlaceholder: "房源名称、ID 或项目名称",
    province: "省份",
    provincePlaceholder: "例如：曼谷，清迈",
    zipCode: "邮政编码",
    zipCodePlaceholder: "例如：10110",
    propertyType: "房源类型",
    dealType: "交易类型",
    budget: "预算",
    rentMonth: "租金/月",
    buy: "购买",
    buyOrRent: "购买或租用",
    minPrice: "最低",
    maxPrice: "最高",
    bedrooms: "卧室数量",
    allBedrooms: "全部卧室",
    bed1: "1个或以上卧室",
    bed2: "2个或以上卧室",
    bed3: "3个或以上卧室",
    bed4: "4个或以上卧室",
    bed5: "5个或以上卧室",
    bathrooms: "卫浴数量",
    allBathrooms: "全部卫浴",
    bath1: "1个或以上卫浴",
    bath2: "2个或以上卫浴",
    bath3: "3个或以上卫浴",
    bath4: "4个或以上卫浴",
    bath5: "5个或以上卫浴",
    parking: "车位数量",
    allParking: "全部车位",
    parking1: "1个或以上车位",
    parking2: "2个或以上车位",
    parking3: "3个或以上车位",
    parking4: "4个或以上车位",
    usableArea: "使用面积 (平方米)",
    minArea: "最小",
    maxArea: "最大",
    ownerName: "业主姓名",
    ownerPlaceholder: "输入业主姓名",
    clear: "清除",
    search: "搜索",
    // Types
    ALL: "全部类型",
    DETACHED_HOUSE: "独栋别墅",
    TOWNHOUSE: "联排别墅",
    SEMI_DETACHED: "双拼别墅",
    VILLA: "别墅",
    FACTORY: "工厂",
    WAREHOUSE: "仓库",
    OFFICE: "办公室",
    RETAIL: "商铺",
    LAND: "土地",
    COMMERCIAL: "商业楼",
    APARTMENT: "公寓",
    OTHER: "其他",
    // Deal types
    allDeals: "全部（出售或出租）",
    sellDeal: "出售",
    rentDeal: "出租",
  }
};

const formatNumberWithCommas = (value: string) => {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return "";
  return parseInt(clean, 10).toLocaleString();
};

interface SearchFilterControlsProps {
  currentLang: string;
  canSearchOwner?: boolean;
  mode?: "all" | "sell" | "rent";
}

export default function SearchFilterControls({ currentLang, canSearchOwner = false, mode = "all" }: SearchFilterControlsProps) {
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
  const [ownerName, setOwnerName] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parking, setParking] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");

  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with URL params on load/change
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setCode(searchParams.get("code") || "");
    setProvince(searchParams.get("province") || "");
    setZipCode(searchParams.get("zipCode") || "");
    setProjectName(searchParams.get("projectName") || "");
    setPropertyType(searchParams.get("propertyType") || "ALL");
    setDeal(searchParams.get("deal") || mode || "all");
    
    const urlMinPrice = searchParams.get("minPrice") || "";
    setMinPrice(urlMinPrice ? formatNumberWithCommas(urlMinPrice) : "");
    const urlMaxPrice = searchParams.get("maxPrice") || "";
    setMaxPrice(urlMaxPrice ? formatNumberWithCommas(urlMaxPrice) : "");
    
    setOwnerName(searchParams.get("ownerName") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
    setBathrooms(searchParams.get("bathrooms") || "");
    setParking(searchParams.get("parking") || "");
    
    const urlMinArea = searchParams.get("minArea") || "";
    setMinArea(urlMinArea ? formatNumberWithCommas(urlMinArea) : "");
    const urlMaxArea = searchParams.get("maxArea") || "";
    setMaxArea(urlMaxArea ? formatNumberWithCommas(urlMaxArea) : "");
  }, [searchParams, mode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (code.trim()) params.set("code", code.trim());
    if (province.trim()) params.set("province", province.trim());
    if (zipCode.trim()) params.set("zipCode", zipCode.trim());
    if (projectName.trim()) params.set("projectName", projectName.trim());
    if (propertyType !== "ALL") params.set("propertyType", propertyType);

    const activeDeal = mode === "sell" ? "sell" : mode === "rent" ? "rent" : deal;
    if (activeDeal !== "all") params.set("deal", activeDeal);

    const cleanMinPrice = minPrice.replace(/,/g, "").trim();
    const cleanMaxPrice = maxPrice.replace(/,/g, "").trim();
    const cleanMinArea = minArea.replace(/,/g, "").trim();
    const cleanMaxArea = maxArea.replace(/,/g, "").trim();

    if (cleanMinPrice) params.set("minPrice", cleanMinPrice);
    if (cleanMaxPrice) params.set("maxPrice", cleanMaxPrice);
    if (ownerName.trim() && canSearchOwner) params.set("ownerName", ownerName.trim());
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    if (parking) params.set("parking", parking);
    if (cleanMinArea) params.set("minArea", cleanMinArea);
    if (cleanMaxArea) params.set("maxArea", cleanMaxArea);

    const targetPath = mode === "sell" ? `/${currentLang}/buy` : mode === "rent" ? `/${currentLang}/rent` : `/${currentLang}/search`;
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handleClear = () => {
    setQ("");
    setCode("");
    setProvince("");
    setZipCode("");
    setProjectName("");
    setPropertyType("ALL");
    setDeal(mode === "sell" ? "sell" : mode === "rent" ? "rent" : "all");
    setMinPrice("");
    setMaxPrice("");
    setOwnerName("");
    setBedrooms("");
    setBathrooms("");
    setParking("");
    setMinArea("");
    setMaxArea("");

    const targetPath = mode === "sell" ? `/${currentLang}/buy` : mode === "rent" ? `/${currentLang}/rent` : `/${currentLang}/search`;
    router.push(targetPath);
  };

  // Compute price range limit dynamically
  const activeDeal = mode === "sell" ? "sell" : mode === "rent" ? "rent" : deal;

  const lang = (currentLang === "en" || currentLang === "zh" || currentLang === "th") ? currentLang : "th";
  const t = translations[lang];

  return (
    <div className="sticky top-24 z-40 max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <div className="bg-[#112240]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              {t.filterAssets}
            </h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>{t.hideFilter}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              </>
            ) : (
              <>
                <span>{t.showFilter}</span>
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
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-alt">{t.searchProperty}</label>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-alt">{t.province}</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder={t.provincePlaceholder}
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-alt">{t.zipCode}</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder={t.zipCodePlaceholder}
                  className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Grid 2: Types, Price & Zip code filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{t.propertyType}</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="ALL">{t.ALL}</option>
                  <option value="DETACHED_HOUSE">{t.DETACHED_HOUSE}</option>
                  <option value="TOWNHOUSE">{t.TOWNHOUSE}</option>
                  <option value="SEMI_DETACHED">{t.SEMI_DETACHED}</option>
                  <option value="VILLA">{t.VILLA}</option>
                  <option value="FACTORY">{t.FACTORY}</option>
                  <option value="WAREHOUSE">{t.WAREHOUSE}</option>
                  <option value="OFFICE">{t.OFFICE}</option>
                  <option value="RETAIL">{t.RETAIL}</option>
                  <option value="LAND">{t.LAND}</option>
                  <option value="COMMERCIAL">{t.COMMERCIAL}</option>
                  <option value="APARTMENT">{t.APARTMENT}</option>
                  <option value="OTHER">{t.OTHER}</option>
                </select>
              </div>

              {mode === "all" && (
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{t.dealType}</label>
                  <select
                    value={deal}
                    onChange={(e) => setDeal(e.target.value)}
                    className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                  >
                    <option value="all">{t.allDeals}</option>
                    <option value="sell">{t.sellDeal}</option>
                    <option value="rent">{t.rentDeal}</option>
                  </select>
                </div>
              )}

              <div className={`col-span-1 ${mode === "all" ? "lg:col-span-2" : "lg:col-span-3"} space-y-1 bg-black/25 border border-white/5 p-4 rounded-xl`}>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                  {t.budget} ({activeDeal === "rent" ? t.rentMonth : activeDeal === "sell" ? t.buy : t.buyOrRent})
                </label>

                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(formatNumberWithCommas(e.target.value));
                      }}
                      placeholder={t.minPrice}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-lg px-3 text-sm md:text-base font-semibold focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                    />
                  </div>
                  <span className="text-xs text-white/30">-</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(formatNumberWithCommas(e.target.value));
                      }}
                      placeholder={t.maxPrice}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-lg px-3 text-sm md:text-base font-semibold focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 3: Specifications (Bedrooms, Bathrooms, Parking & Usable Area) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/5 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{t.bedrooms}</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="">{t.allBedrooms}</option>
                  <option value="1">{t.bed1}</option>
                  <option value="2">{t.bed2}</option>
                  <option value="3">{t.bed3}</option>
                  <option value="4">{t.bed4}</option>
                  <option value="5">{t.bed5}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{t.bathrooms}</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="">{t.allBathrooms}</option>
                  <option value="1">{t.bath1}</option>
                  <option value="2">{t.bath2}</option>
                  <option value="3">{t.bath3}</option>
                  <option value="4">{t.bath4}</option>
                  <option value="5">{t.bath5}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{t.parking}</label>
                <select
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  className="w-full h-11 bg-[#112240] border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white cursor-pointer"
                >
                  <option value="">{t.allParking}</option>
                  <option value="1">{t.parking1}</option>
                  <option value="2">{t.parking2}</option>
                  <option value="3">{t.parking3}</option>
                  <option value="4">{t.parking4}</option>
                </select>
              </div>

              <div className="space-y-1 bg-black/25 border border-white/5 p-4 rounded-xl">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                  {t.usableArea}
                </label>

                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minArea}
                      onChange={(e) => {
                        setMinArea(formatNumberWithCommas(e.target.value));
                      }}
                      placeholder={t.minArea}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-lg px-3 text-sm md:text-base font-semibold focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                    />
                  </div>
                  <span className="text-xs text-white/30">-</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxArea}
                      onChange={(e) => {
                        setMaxArea(formatNumberWithCommas(e.target.value));
                      }}
                      placeholder={t.maxArea}
                      className="w-full h-10 bg-black/45 border border-white/10 rounded-lg px-3 text-sm md:text-base font-semibold focus:outline-none focus:border-accent text-white placeholder-white/20 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 3: Owner search & actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {canSearchOwner && (
                  <div className="w-full md:w-64 space-y-1">
                    <label className="text-[10px] font-bold text-accent uppercase tracking-widest block flex items-center gap-1 font-alt">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.29-.22.41-.58.41-.952a1.721 1.721 0 00-1.472-1.706L13.12 12.82c-.17-.038-.347.01-.47.13L11.3 14.3a.5.5 0 01-.6.08 7.043 7.043 0 01-2.6-2.6.5.5 0 01.08-.6l1.35-1.35a.172.172 0 00.13-.47l-.42-1.948a1.721 1.721 0 00-1.706-1.472H3.465z" />
                      </svg>
                      {t.ownerName}
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder={t.ownerPlaceholder}
                      className="w-full h-11 bg-black/45 border border-accent/30 text-accent focus:border-accent rounded-xl px-4 text-xs focus:outline-none placeholder-accent/40 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-4 md:mt-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 px-5 border border-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-white/5 active:scale-95"
                >
                  {t.clear}
                </button>
                <button
                  type="submit"
                  className="h-11 px-8 bg-accent hover:bg-accent-dark text-primary-dark font-black text-xs tracking-widest rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  {t.search}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
