import Image from "next/image";
import Link from "next/link";
import AnimatedLink from "./AnimatedLink";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";
import { Bed, Bath, Maximize } from "lucide-react";

interface PropertyProps {
  id: number | string;
  id_string: string;
  title: string;
  location: string;
  price: string;
  sellPrice?: string | null;
  rentPrice?: string | null;
  type: string;
  category: string;
  beds: number;
  baths: number;
  sqft: number;
  landSize?: number | null;
  usableArea?: number | null;
  noFloor?: number | null;
  parkingLot?: number | null;
  facing?: string | null;
  image: string;
}

export default async function CarouselCard({ property, lang = "th", cardType = "all" }: { property: PropertyProps; lang?: string; cardType?: "sell" | "rent" | "all" }) {
  const dict = await getDictionary(lang as Locale);
  const showSell = cardType === "all" || cardType === "sell";
  const showRent = cardType === "all" || cardType === "rent";

  return (
    <div className="premium-card group hover:shadow-2xl transition-all duration-500 overflow-hidden bg-[#112240] border-none rounded-[20px] flex flex-col h-full w-full isolate transform-gpu">
      <div className="relative aspect-4/3 overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {showSell && property.sellPrice && (
            <span className="px-3 py-1 bg-[#D4AF37] text-[#112240] text-[10px] font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-[#8B6508]">
              {dict.property_card.for_sale || "ขาย"}
            </span>
          )}
          {showRent && property.rentPrice && (
            <span className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-400 text-[#112240] text-[10px] font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-gray-500">
              {dict.property_card.for_rent || "เช่า"}
            </span>
          )}
          {!property.sellPrice && !property.rentPrice && (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
              {property.type}
            </span>
          )}
        </div>
        
        {/* Real Property Image */}
        <AnimatedLink 
          href={`/${lang}/property/list/${property.id_string}`}
          className="w-full h-full relative block group-hover:scale-105 transition-transform duration-700 bg-[#0A192F]"
        >
          <Image 
            src={property.image} 
            alt={property.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" 
            priority={false}
          />
        </AnimatedLink>
      </div>
      
      <div className="p-5 flex flex-col flex-1 bg-[#112240]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-alt font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">ID: {property.id_string}</span>
          <span className="text-[10px] font-alt font-bold text-gray-400 uppercase tracking-widest">{property.category}</span>
        </div>
        
        <Link href={`/${lang}/property/list/${property.id_string}`}>
          <h3 className="text-[15px] font-bold text-white leading-tight mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        <p className="text-gray-400 text-xs font-medium tracking-wide mb-4 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#D4AF37]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {property.location}
        </p>
        
        {/* Prices */}
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {showSell && (
            <div className={`border rounded-lg px-3 py-2 flex flex-col min-w-[100px] flex-1 ${property.sellPrice ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest block mb-0.5 ${property.sellPrice ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                {dict.property_card.sell_price}
              </span>
              <div className={`text-lg font-black leading-none ${property.sellPrice ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                {property.sellPrice ? (
                  <>{property.sellPrice} <span className="text-[10px] font-bold text-gray-500 ml-0.5">THB</span></>
                ) : (
                  <>-</>
                )}
              </div>
            </div>
          )}
          
          {showRent && (
            <div className={`border rounded-lg px-3 py-2 flex flex-col min-w-[100px] flex-1 ${property.rentPrice ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest block mb-0.5 ${property.rentPrice ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                {dict.property_card.rent_price}
              </span>
              <div className={`text-lg font-black leading-none ${property.rentPrice ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                {property.rentPrice ? (
                  <>{property.rentPrice} <span className="text-[10px] font-bold text-gray-500 ml-0.5">THB{dict.property_card.month.startsWith('/') ? dict.property_card.month : `/${dict.property_card.month}`}</span></>
                ) : (
                  <>-</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 6-icon grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-auto">
          {property.beds !== undefined && property.beds !== null ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Bed className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'ห้องนอน' : lang === 'zh' ? '卧室' : 'Bedroom'}</span>
                <span className="text-xs font-black text-white leading-none">{property.beds} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === "th" ? "ห้อง" : lang === "zh" ? "间" : "Rooms"}</span></span>
              </div>
            </div>
          ) : null}

          {property.baths !== undefined && property.baths !== null ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Bath className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'ห้องน้ำ' : lang === 'zh' ? '浴室' : 'Bathroom'}</span>
                <span className="text-xs font-black text-white leading-none">{property.baths} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === "th" ? "ห้อง" : lang === "zh" ? "间" : "Rooms"}</span></span>
              </div>
            </div>
          ) : null}

          {property.landSize ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.61c-.38.19-.622.58-.622 1.006v10.156c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.996 2.498a1.125 1.125 0 0 0 1.006 0Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'ขนาดที่ดิน' : lang === 'zh' ? '土地面积' : 'Land Size'}</span>
                <span className="text-xs font-black text-white leading-none">{property.landSize} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === 'th' ? 'ตร.วา' : lang === 'zh' ? '平方哇' : 'sq.w'}</span></span>
              </div>
            </div>
          ) : null}

          {property.usableArea ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Maximize className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'พื้นที่ใช้สอย' : lang === 'zh' ? '使用面积' : 'Usable Area'}</span>
                <span className="text-xs font-black text-white leading-none">{property.usableArea} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === 'th' ? 'ตร.ม.' : lang === 'zh' ? '平方米' : 'sq.m'}</span></span>
              </div>
            </div>
          ) : null}

          {property.noFloor ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m-15 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 3 12v.878m18-3A2.25 2.25 0 0 1 21 12v.878m-18 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 1.5 15v.878m19.5-3A2.25 2.25 0 0 1 22.5 15v.878m-21 0a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 15" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'จำนวนชั้น' : lang === 'zh' ? '楼层' : 'Stories'}</span>
                <span className="text-xs font-black text-white leading-none">{property.noFloor} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === 'th' ? 'ชั้น' : lang === 'zh' ? '层' : 'Fl.'}</span></span>
              </div>
            </div>
          ) : null}

          {property.parkingLot ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M4.5 14.25l1.687-3.374a2.25 2.25 0 0 1 2.013-1.246h7.6c.866 0 1.636.49 2.013 1.246l1.687 3.374M2.25 5.25h19.5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest leading-none mb-1">{lang === 'th' ? 'ที่จอดรถ' : lang === 'zh' ? '停车场' : 'Parking'}</span>
                <span className="text-xs font-black text-white leading-none">{property.parkingLot} <span className="text-[10px] font-bold text-white/70 ml-0.5">{lang === "th" ? "คัน" : lang === "zh" ? "车" : "Cars"}</span></span>
              </div>
            </div>
          ) : null}
          
        </div>
      </div>
    </div>
  );
}
