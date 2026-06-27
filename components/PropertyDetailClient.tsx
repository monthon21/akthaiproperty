"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/lib/properties";
import PropertyGallery from "./PropertyGallery";
import { getSessionAction } from "@/lib/actions/auth";
import SearchBox from "./SearchBox";

import { usePathname } from "next/navigation";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

interface PropertyDetailClientProps {
  property: Property;
  similarProperties: Property[];
}

export default function PropertyDetailClient({ property, similarProperties }: PropertyDetailClientProps) {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

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

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await getSessionAction();
        if (res?.session) {
          setSession(res.session);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    }
    fetchSession();
  }, []);

  // Airbnb & Mortgage Calculator state
  const sellPriceNum = property.sellPrice ? parseInt(property.sellPrice.replace(/[^0-9]/g, "")) || 0 : 0;
  const rentPriceNum = property.rentPrice ? parseInt(property.rentPrice.replace(/[^0-9]/g, "")) || 0 : 0;
  const isRent = property.type === "เช่า" || property.type === "Rent" || property.type === "租";

  // Use sell price if available for mortgage/basic price number, else fallback
  const priceNum = sellPriceNum > 0 ? sellPriceNum : (rentPriceNum > 0 ? rentPriceNum : 5000000);

  // Calculate default nightly rate: standard yield metric
  const defaultNightlyRate = Math.max(
    100,
    rentPriceNum > 0
      ? Math.round(rentPriceNum / 10)
      : (sellPriceNum > 0 ? Math.round(sellPriceNum * 0.0011) : 2500)
  );

  const [nightlyRate, setNightlyRate] = useState(defaultNightlyRate);
  const [occupancy, setOccupancy] = useState(58);

  // Mortgage Calculator state
  const [loanAmount, setLoanAmount] = useState(Math.round(priceNum * 0.8));
  const [interestRate, setInterestRate] = useState(3.5);
  const [tenureYears, setTenureYears] = useState(30);

  // Agent Form state
  const [activeTab, setActiveTab] = useState<"email" | "message">("email");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: `${t("property_detail.msg_template")} ${property.id_string} - ${property.title} ${t("property_detail.msg_template_end")}`
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    rental: true,
    mortgage: false
  });

  // Calculate dynamic Airbnb returns
  const monthlyDays = 30.4;
  const estMonthlyIncome = Math.round(nightlyRate * monthlyDays * (occupancy / 100));
  const estAnnualIncome = Math.round(estMonthlyIncome * 12);
  const youKeep = Math.round(estAnnualIncome * 0.845);
  const airbnbFee = Math.round(estAnnualIncome * 0.155);

  // Calculate Mortgage dynamic monthly payment
  const calculateMortgage = () => {
    const monthlyRate = (interestRate / 12) / 100;
    const totalPayments = tenureYears * 12;
    if (monthlyRate === 0) return Math.round(loanAmount / totalPayments);
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(payment);
  };

  const monthlyMortgagePayment = calculateMortgage();

  // Handle Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        message: `${t("property_detail.msg_template")} ${property.id_string} - ${property.title} ${t("property_detail.msg_template_end")}`
      });
    }, 4000);
  };

  // Toggle Accordions
  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Google Maps helper
  const getGoogleMapsEmbedUrl = (googleMapField: string | null | undefined, fallbackAddress: string) => {
    if (!googleMapField) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress || "กรุงเทพมหานคร")}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }

    if (googleMapField.includes("<iframe")) {
      const match = googleMapField.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }

    if (googleMapField.includes("output=embed") && (googleMapField.startsWith("http://") || googleMapField.startsWith("https://"))) {
      return googleMapField;
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(googleMapField)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // Google Maps Iframe Query
  const mapUrl = getGoogleMapsEmbedUrl(property.googleMap, property.location);

  // Calculated Price per Sqm Text
  const pricePerSqmText = isRent
    ? `${Math.round(priceNum / property.sqft).toLocaleString()} / Sq.M.`
    : `${Math.round((priceNum / property.sqft) / 1000)}k / Sq.M.`;

  return (
    <main className="pt-32 md:pt-36 pb-24 bg-[#0A192F] text-white min-h-screen font-sans">

      {/* Breadcrumbs & Search */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-[10px] font-alt tracking-widest text-white/40 flex flex-wrap items-center gap-2">
          <Link href={`/${currentLang}`} className="hover:text-accent transition-colors uppercase">
            {t("property_detail.home")}
          </Link>
          <span>/</span>
          <span className="text-white/60 uppercase">{t("property_detail.property")}</span>
          <span>/</span>
          <span className="text-accent uppercase truncate max-w-[200px] sm:max-w-[400px] inline-block" title={property.title}>
            {property.title}
          </span>
        </div>
        <div className="w-full md:w-80 relative z-50">
          <SearchBox 
            currentLang={currentLang} 
            placeholder={currentLang === "th" ? "รหัสทรัพย์, ทำเล, ชื่อโครงการ..." : "ID, Location, Project..."} 
            buttonText={currentLang === "en" ? "Search" : currentLang === "zh" ? "搜索" : "ค้นหา"} 
          />
        </div>
      </div>

      {/* Top Fold Title Block & Pricing Metrics */}
      <div className="max-w-7xl mx-auto px-6 py-8 mb-8 space-y-6">
        {/* Title and ID (Full Width) */}
        <div className="w-full">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              {property.type === "เช่า" ? "For Rent" : "For Sale"}
            </span>
            <span className="px-3 py-1 bg-white/5 text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {property.category}
            </span>
            <span className="px-3 py-1 bg-white/5 text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
              Available
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 mb-5 leading-tight w-full">
            {property.title}
          </h1>
          {property.projectName && (
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-accent mb-4 leading-snug w-full">
              {property.projectName}
            </h2>
          )}
          <div className="flex items-center gap-4 text-white/50 text-sm font-medium tracking-wide flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {property.location} {property.zipCode ? property.zipCode : ""}
            </div>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <div className="flex items-center gap-1.5 text-accent/80 font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
              ID: {property.id_string}
            </div>
            {session && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <Link
                  href={`/edit/${property.id}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent hover:text-white uppercase tracking-wider transition-colors border border-accent/20 px-2.5 py-1 rounded-md bg-accent/5 hover:bg-accent/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  แก้ไขข้อมูล
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar (Full Width Banner) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-7 w-full shadow-2xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-wrap gap-4 items-center">
            {property.sellPrice && (
              <div className="bg-accent/[0.04] border border-accent/30 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(212,175,55,0.08)] flex flex-col hover:border-accent/50 hover:bg-accent/[0.06] transition-all duration-300">
                <span className="text-[10px] font-extrabold text-accent/80 uppercase tracking-widest block mb-1">{t("property_card.sell_price")}</span>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-accent drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] leading-none">
                  {property.sellPrice}
                </div>
              </div>
            )}
            {property.rentPrice && (
              <div className="bg-accent/[0.04] border border-accent/30 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(212,175,55,0.08)] flex flex-col hover:border-accent/50 hover:bg-accent/[0.06] transition-all duration-300">
                <span className="text-[10px] font-extrabold text-accent/80 uppercase tracking-widest block mb-1">{t("property_card.rent_price")}</span>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-accent drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] leading-none">
                  {property.rentPrice}<span className="text-sm md:text-base font-normal text-white/60 ml-1">{t("property_card.month")}</span>
                </div>
              </div>
            )}
            {!property.sellPrice && !property.rentPrice && (
              <div className="bg-accent/[0.04] border border-accent/30 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(212,175,55,0.08)] flex flex-col hover:border-accent/50 hover:bg-accent/[0.06] transition-all duration-300">
                <span className="text-[10px] font-extrabold text-accent/80 uppercase tracking-widest block mb-1">{t("property_card.starts_from")}</span>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-accent drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] leading-none">{property.price}</div>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap gap-8 md:gap-12 pt-5 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
            <div>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">{t("property_detail.beds_label")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-bold text-white">{property.beds}</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">{t("property_detail.baths_label")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-bold text-white">{property.baths}</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">{t("property_detail.area_label")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-bold text-white">{property.sqft}</span>
                <span className="text-xs font-medium text-white/50">{t("property_detail.sqm")}</span>
              </div>
            </div>
            {property.landSize && (
              <div>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">{t("property_detail.land_size")}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold text-white">{property.landSize}</span>
                  <span className="text-xs font-medium text-white/50">{t("property_detail.sqw")}</span>
                </div>
              </div>
            )}
            {property.parkingLot && (
              <div>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">{t("property_detail.parking_lot")}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold text-white">{property.parkingLot}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Anchor Menu */}
      <div className="sticky top-[72px] bg-[#0A192F]/95 backdrop-blur-md z-30 border-y border-white/5 py-3 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          <a href="#overview" className="text-xs font-bold text-white/70 hover:text-accent tracking-widest uppercase transition-colors shrink-0">
            {currentLang === "th" ? "ภาพรวม" : currentLang === "zh" ? "概览" : "Overview"}
          </a>
          <a href="#amenities" className="text-xs font-bold text-white/70 hover:text-accent tracking-widest uppercase transition-colors shrink-0">
            {currentLang === "th" ? "สิ่งอำนวยความสะดวก" : currentLang === "zh" ? "设施与特点" : "Property Features"}
          </a>
          <a href="#location" className="text-xs font-bold text-white/70 hover:text-accent tracking-widest uppercase transition-colors shrink-0">
            {currentLang === "th" ? "ที่ตั้ง" : currentLang === "zh" ? "位置" : "Location"}
          </a>
          <a href="#contact" className="text-xs font-bold text-white/70 hover:text-accent tracking-widest uppercase transition-colors shrink-0">
            {currentLang === "th" ? "ติดต่อ" : currentLang === "zh" ? "联系" : "Contact"}
          </a>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* LEFT COLUMN: Gallery, About, Amenities, Map */}
          <div className="lg:col-span-2 space-y-12">

            {/* Gallery slideshow */}
            <div className="w-full">
              <PropertyGallery gallery={property.gallery} title={property.title} />
            </div>

            {/* About this House */}
            <section id="overview" className="scroll-mt-36 pt-4 space-y-4">
              <h2 className="text-lg font-bold text-white tracking-wide border-l-2 border-accent pl-3">
                {currentLang === "th" ? "ข้อมูลอสังหาริมทรัพย์" : currentLang === "zh" ? "关于此房产" : "About this Property"}
              </h2>
              <div className="text-sm text-white/80 leading-relaxed font-medium space-y-4">
                <p>{property.description}</p>

                {/* Detailed Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  {property.beds !== undefined && property.beds !== null ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 5.25v13.5M2.25 12h19.5M21.75 12v6.75M2.25 7.5h7.5V12M12 7.5h7.5V12M6.75 18v1.5M17.25 18v1.5" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.beds_label")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.beds} <span className="text-xs font-normal text-white/60 ml-0.5">{currentLang === "th" ? "ห้อง" : currentLang === "zh" ? "间" : "Rooms"}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.baths !== undefined && property.baths !== null ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h19.5M3.75 12v3c0 1.657 1.343 3 3 3h10.5c1.657 0 3-1.343 3-3v-3M9 6v6m6-6v6M6 18v1.5m12-1.5v1.5" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.baths_label")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.baths} <span className="text-xs font-normal text-white/60 ml-0.5">{currentLang === "th" ? "ห้อง" : currentLang === "zh" ? "间" : "Rooms"}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.landSize ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.61c-.38.19-.622.58-.622 1.006v10.156c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.996 2.498a1.125 1.125 0 0 0 1.006 0Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.land_size")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.landSize} <span className="text-xs font-normal text-white/60 ml-0.5">{t("property_detail.sqw")}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.usableArea ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5M8.25 12h7.5m-7.5 3h7.5m-7.5-6h3.75M20.25 9h-3.75" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.area_label")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.usableArea} <span className="text-xs font-normal text-white/60 ml-0.5">{t("property_detail.sqm")}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.noFloor ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m-15 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 3 12v.878m18-3A2.25 2.25 0 0 1 21 12v.878m-18 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 1.5 15v.878m19.5-3A2.25 2.25 0 0 1 22.5 15v.878m-21 0a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 15" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.no_floor")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.noFloor} <span className="text-xs font-normal text-white/60 ml-0.5">{t("property_detail.floor")}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.parkingLot ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M4.5 14.25l1.687-3.374a2.25 2.25 0 0 1 2.013-1.246h7.6c.866 0 1.636.49 2.013 1.246l1.687 3.374M2.25 5.25h19.5" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.parking_lot")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.parkingLot} <span className="text-xs font-normal text-white/60 ml-0.5">{t("property_detail.cars")}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.maidRoom ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.maid_room")}</span>
                        <span className="text-sm font-black text-accent truncate">
                          {property.maidRoom} <span className="text-xs font-normal text-white/60 ml-0.5">{t("property_detail.beds")}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {property.facing ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-9h18" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.facing")}</span>
                        <span className="text-sm font-black text-accent truncate">{property.facing}</span>
                      </div>
                    </div>
                  ) : null}

                  {property.otherFeatures ? (
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent/35 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-300 shadow-md sm:col-span-1 col-span-2">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-5.096c.071-.04.148-.061.226-.061h2.292a1.125 1.125 0 0 0 1.125-1.125V4.875A1.125 1.125 0 0 0 20.378 3.75H3.622a1.125 1.125 0 0 0-1.125 1.125v9.964c0 .621.504 1.125 1.125 1.125h2.292c.078 0 .155.021.226.061L12 18l-.982-5.096" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0 w-full">
                        <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest truncate mb-0.5">{t("property_detail.other_features")}</span>
                        <span className="text-xs font-bold text-accent truncate block" title={property.otherFeatures}>{property.otherFeatures}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="font-bold text-accent">ID:</span> <span className="font-mono text-white/80">{property.id_string}</span>
                </div>
              </div>
            </section>

            {/* Amenities Section */}
            <section id="amenities" className="scroll-mt-36 pt-4 space-y-6">
              <h2 className="text-lg font-bold text-white tracking-wide border-l-2 border-accent pl-3">
                {currentLang === "th" ? "สิ่งอำนวยความสะดวก" : currentLang === "zh" ? "设施与特点" : "Amenities & Features"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 bg-white/5 border border-white/10 rounded-xl p-6">
                {property.facilities.map((fac, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-xs font-semibold text-white/80">{fac}</span>
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location Section */}
            <section id="location" className="scroll-mt-36 pt-4 space-y-6">
              <h2 className="text-lg font-bold text-white tracking-wide border-l-2 border-accent pl-3">
                {currentLang === "th" ? "แผนที่และที่ตั้ง" : currentLang === "zh" ? "位置地图" : "Location Map"}
              </h2>
              <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                ></iframe>
              </div>

              {/* Nearby Places */}
              {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">
                    {currentLang === "th" ? "สถานที่ใกล้เคียง (Nearby Places)" : currentLang === "zh" ? "附近地点" : "Nearby Places"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.nearbyPlaces.map((place, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                        <span className="text-xs font-semibold text-white">{place.placeName}</span>
                        <div className="text-right">
                          {place.distance && (
                            <span className="block text-[10px] font-black tracking-widest text-accent uppercase">
                              {place.distance}
                            </span>
                          )}
                          {place.travelTime && (
                            <span className="block text-[10px] font-black tracking-widest text-accent uppercase">
                              {place.travelTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: Sticky Sidebars, Calculators, Form */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-32">

            {/* 1. Airbnb Returns Calculator */}
            <div className="bg-[#112240] border border-white/10 rounded-xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-accent shrink-0">
                  <path d="M16 1c-2.007 0-3.478.895-4.475 2.185-1.077 1.393-1.637 3.39-1.92 5.176-.328 2.072-.258 4.225-.258 5.762 0 1.096-.289 2.062-1.01 2.873-.807.91-1.996 1.488-3.176 1.488-1.528 0-2.836-.889-3.693-2.05-.889-1.205-1.127-2.906-.807-4.636.31-1.666.985-3.08 1.83-4.148C3.33 6.643 4.417 5.926 5.56 5.56L6.5 4.5 4.393 2.393C2.868 3.018 1.63 4.14 1.012 5.56c-1.1 2.535-.747 5.727.674 8.528.847 1.67 2.455 3.016 4.314 3.335C6.262 18.06 6.5 18.775 6.5 19.5c0 1.954.835 3.633 2.227 4.747 1.35.807 3.09.807 4.747.807 2.138 0 4.093.882 5.437 2.227C20.256 28.625 21.5 30.2 21.5 31c0 1-1 1-1.5 1h-8c-1.65 0-3-1.35-3-3s1.35-3 3-3h11.233c.69 0 1.343.342 1.737.913L28.167 31H31v-2.833l-2.087-2.087C28.342 25.686 28 25.033 28 24.343V13.11c0-1.65-1.35-3-3-3s-3 1.35-3 3v5.727c0 .69-.342 1.343-.913 1.737l-3.087 3.087V21.5c0-.725-.238-1.44-.5-2.077 1.86-.319 3.467-1.665 4.314-3.335 1.42-2.8 1.774-6 .674-8.528-.618-1.42-1.856-2.542-3.38-3.167L20.5 6.5l.94 1.06c1.143.366 2.23.136 3.06-.883.845-1.068 1.52-2.482 1.83-4.148.32-1.73.082-3.43-.807-4.636-.857-1.161-2.165-2.05-3.693-2.05-1.18 0-2.37.578-3.176 1.488-.721.81-1.01 1.777-1.01 2.873 0 1.537.07 3.69-.258 5.762-.283 1.786-.843 3.783-1.92 5.176C19.478 1.895 18.007 1 16 1z" />
                </svg>
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Airbnb Returns Calculator</h3>
              </div>

              {/* Dynamic Rates Input */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-white/50 mb-1.5">
                    <span>Est. Nightly Rate (ค่าเช่า/คืน)</span>
                    <span className="text-accent font-bold">{nightlyRate.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(defaultNightlyRate * 0.5)}
                    max={Math.round(defaultNightlyRate * 2)}
                    value={nightlyRate}
                    onChange={(e) => setNightlyRate(parseInt(e.target.value))}
                    className="w-full accent-accent h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-white/50 mb-1.5">
                    <span>Estimated Occupancy (อัตราเข้าพัก)</span>
                    <span className="text-accent font-bold">{occupancy}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={occupancy}
                    onChange={(e) => setOccupancy(parseInt(e.target.value))}
                    className="w-full accent-accent h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-white/50">Est. Monthly Income</span>
                  <span className="text-base font-bold text-white">{estMonthlyIncome.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-white/50">Est. Annual Income</span>
                  <span className="text-lg font-black text-accent">{estAnnualIncome.toLocaleString()}</span>
                </div>

                {/* Progress bar split */}
                <div className="space-y-2 pt-2">
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-accent" style={{ width: "84.5%" }}></div>
                    <div className="h-full bg-white/20" style={{ width: "15.5%" }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase text-white/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> You Keep (84.5%): {youKeep.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> Airbnb fee (15.5%): {airbnbFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-white/40 text-center leading-relaxed">
                * Estimates based on Airbnb market data for this area. Actual returns may vary. Not financial advice.
              </div>
            </div>

            {/* 2. Estimated Rental Income / Mortgage Calculator Accordions */}
            <div className="space-y-4">

              {/* Accordion 1: Estimated Rental Income */}
              <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => toggleAccordion("rental")}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-xs tracking-wider uppercase text-white hover:bg-white/5 transition-colors"
                >
                  <span>+ Estimated Rental Income</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-3.5 h-3.5 text-accent transition-transform duration-300 ${openAccordions.rental ? "rotate-45" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {openAccordions.rental && (
                  <div className="p-5 border-t border-white/5 text-xs text-white/60 space-y-3 bg-black/10">
                    <p>ทรัพย์สินทำเลนี้ให้ผลตอบแทนการเช่าดีเยี่ยม โดยค่าเฉลี่ยสถิติย้อนหลัง:</p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-white/40 block uppercase">Rental Yield</span>
                        <span className="text-sm font-bold text-accent">6.8% / ปี</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-white/40 block uppercase">Avg. Occupancy</span>
                        <span className="text-sm font-bold text-accent">65% - 72%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Mortgage Calculator */}
              <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => toggleAccordion("mortgage")}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-xs tracking-wider uppercase text-white hover:bg-white/5 transition-colors"
                >
                  <span>+ Mortgage Calculator</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-3.5 h-3.5 text-accent transition-transform duration-300 ${openAccordions.mortgage ? "rotate-45" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {openAccordions.mortgage && (
                  <div className="p-5 border-t border-white/5 space-y-4 bg-black/10 text-xs">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/50 mb-1.5">
                        <span>Loan Amount (วงเงินกู้)</span>
                        <span className="text-accent font-bold">{loanAmount.toLocaleString()}</span>
                      </div>
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg h-9 px-3 text-white text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/50 mb-1.5">
                        <span>Interest Rate (ดอกเบี้ยปี)</span>
                        <span className="text-accent font-bold">{interestRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full accent-accent h-1 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/50 mb-1.5">
                        <span>Loan Tenure (ระยะเวลากู้)</span>
                        <span className="text-accent font-bold">{tenureYears} ปี</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="35"
                        value={tenureYears}
                        onChange={(e) => setTenureYears(parseInt(e.target.value))}
                        className="w-full accent-accent h-1 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                      <span className="font-bold text-white/60">ยอดผ่อนชำระ/เดือน</span>
                      <span className="text-lg font-black text-accent">{monthlyMortgagePayment.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 3. Inquiry Form Console */}
            <div id="contact" className="scroll-mt-36 bg-[#112240] border border-white/10 rounded-xl p-6 shadow-2xl space-y-6">

              {/* Agent Info Box */}
              <div className="flex items-center gap-4 bg-black/40 p-4 border border-white/5 rounded-xl">
                <div className="w-12 h-12 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center text-accent font-black text-sm shrink-0">
                  AK
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none mb-1">{t("property_detail.agent_name")}</p>
                  <p className="text-xs font-bold text-white truncate">{t("property_detail.agent_slogan")}</p>
                  <p className="text-[10px] text-white/70 truncate mt-0.5">{t("property_detail.agent_contact")}</p>
                </div>
              </div>

              {/* Inquiry Form Tabs */}
              <div className="space-y-4">
                <div className="flex border-b border-white/5 text-center">
                  <button
                    onClick={() => setActiveTab("email")}
                    className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "email" ? "border-accent text-accent" : "border-transparent text-white/40 hover:text-white/70"
                      }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setActiveTab("message")}
                    className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "message" ? "border-accent text-accent" : "border-transparent text-white/40 hover:text-white/70"
                      }`}
                  >
                    Message
                  </button>
                </div>

                {/* Form fields */}
                {formSubmitted ? (
                  <div className="bg-accent/10 border border-accent/30 text-accent rounded-lg p-5 text-center space-y-2 animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-wider">{t("contact_page.success_title")}</p>
                    <p className="text-[10px] text-white/75 leading-relaxed">{t("contact_page.success_desc")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        {t("contact_page.label_name")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t("contact_page.ph_name")}
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        {t("contact_page.email")}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        {t("contact_page.label_phone")}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        {t("contact_page.label_message")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-accent text-primary-dark font-black text-xs tracking-widest uppercase rounded-lg hover:bg-accent-dark transition-all shadow-lg hover:shadow-accent/15 cursor-pointer"
                    >
                      {activeTab === "email" ? t("contact_page.btn_submit") : t("contact_page.btn_submit")}
                    </button>
                  </form>
                )}
              </div>

              {/* Call/Line Buttons */}
              <div className="flex gap-3 pt-2">
                <a
                  href="tel:0824448989"
                  className="flex-1 h-10 border border-accent/40 text-accent font-black text-[10px] tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 hover:bg-accent hover:text-primary-dark hover:border-accent transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a20.373 20.373 0 0 1-7.147-7.147c-.154-.441.012-.928.388-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  {t("property_detail.call_btn")}
                </a>
                <a
                  href="https://line.me/R/ti/p/@akthai59"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 bg-[#06C755] text-white font-black text-[10px] tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform duration-300"
                >
                  {t("property_detail.line_btn")}
                </a>
              </div>

              <p className="text-[9px] text-white/40 text-center leading-relaxed">
                By submitting your enquiry, you agree to our <Link href="/privacy" className="underline hover:text-accent">Privacy Policy</Link>.
              </p>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Similar Listings */}
        {similarProperties.length >= 3 && (
          <section className="mt-20 border-t border-white/5 pt-16 space-y-8">
            <h2 className="text-xl font-bold text-white tracking-wide border-l-2 border-accent pl-3">
              Similar Listings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <Link
                  key={simProp.id}
                  href={`/property/list/${simProp.id}`}
                  className="group relative rounded-xl overflow-hidden aspect-4/3 border border-white/10 shadow-2xl flex flex-col justify-end p-6 bg-black/40"
                >
                  {/* Badge */}
                  <span className="absolute top-4 left-4 z-10 bg-black text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md border border-white/10">
                    NEW
                  </span>

                  {/* Image */}
                  <Image
                    src={simProp.image}
                    alt={simProp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-1"></div>

                  {/* Content */}
                  <div className="relative z-10 flex justify-between items-end w-full">
                    <div className="space-y-1">
                      <p className="text-lg font-black text-white group-hover:text-accent transition-colors leading-none">
                        {simProp.price}
                      </p>
                      <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wide">
                        {simProp.location}
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="flex gap-3 text-[9px] text-white/50 font-bold uppercase tracking-wider">
                      <span>{simProp.beds} Beds</span>
                      <span>{simProp.baths} Baths</span>
                      <span>{simProp.sqft} Sqm</span>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

    </main>
  );
}
