import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";

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
  image: string;
}

export default async function PropertyCard({ property, lang = "th" }: { property: PropertyProps; lang?: string }) {
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="premium-card group hover:shadow-2xl transition-all duration-500 overflow-hidden bg-[#112240] border border-white/5 rounded flex flex-col h-full">
      <div className="relative aspect-4/3 overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2.5 py-1 bg-accent text-primary-dark text-[8px] font-alt font-black uppercase tracking-widest rounded-sm shadow-lg">
            {property.type}
          </span>
        </div>
        
        {/* Real Property Image */}
        <Link 
          href={`/${lang}/property/list/${property.id}`}
          className="w-full h-full relative block group-hover:scale-105 transition-transform duration-700 bg-black/20"
        >
          <Image 
            src={property.image} 
            alt={property.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" 
            priority={false}
          />
        </Link>
        
        {/* Hover overlay details drawer */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 gap-3 z-20">
          <Link 
            href={`/${lang}/property/list/${property.id}`}
            className="flex-1 py-2.5 bg-accent text-primary-dark font-alt font-extrabold rounded-sm text-xs transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 hover:bg-accent-dark cursor-pointer text-center"
          >
            {dict.property_card.view_details}
          </Link>
          <a 
            href="https://line.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-[#06C755] text-white rounded-sm transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75 shadow-lg group/line"
          >
            <span className="font-alt font-black text-[9px] group-hover/line:scale-110 transition-transform">LINE</span>
          </a>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-alt font-bold text-accent uppercase tracking-widest">{property.id_string}</span>
          <span className="text-[9px] font-alt font-bold text-white/40 uppercase tracking-widest">{property.category}</span>
        </div>
        
        <h4 className="font-display font-bold text-base text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors duration-300">
          <Link href={`/${lang}/property/list/${property.id}`}>
            {property.title}
          </Link>
        </h4>

        <p className="text-white/50 text-[11px] font-medium tracking-wide mb-4 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {property.location}
        </p>
        
        <div className="flex flex-col gap-4 pt-4 border-t border-white/5 mt-auto">
          <div className="bg-[#0b1329]/80 p-4 border border-accent/20 rounded-xl space-y-3 shadow-inner">
            {property.sellPrice && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-alt font-black text-white/40 uppercase tracking-wider">{dict.property_card.sell_price}</span>
                <span className="font-display font-black text-xl text-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {property.sellPrice}
                </span>
              </div>
            )}
            {property.sellPrice && property.rentPrice && <div className="h-[1px] bg-white/[0.06]"></div>}
            {property.rentPrice && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-alt font-black text-white/40 uppercase tracking-wider">{dict.property_card.rent_price}</span>
                <span className="font-display font-black text-xl text-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {property.rentPrice}<span className="text-[10px] font-normal text-white/50 ml-1">{dict.property_card.month}</span>
                </span>
              </div>
            )}
            {!property.sellPrice && !property.rentPrice && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-alt font-black text-white/40 uppercase tracking-wider">{dict.property_card.starts_from}</span>
                <span className="font-display font-black text-xl text-accent">
                  {property.price}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-alt font-bold text-white/50 tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
              <span>{property.beds} {dict.property_card.beds}</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
              <span>{property.baths} {dict.property_card.baths}</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
              <span>
                {property.category === "Land"
                  ? `${property.landSize || property.sqft} ${lang === "th" ? "ตร.วา" : "Sq.wah"}`
                  : `${property.usableArea || property.sqft} ${dict.property_card.sqm}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
