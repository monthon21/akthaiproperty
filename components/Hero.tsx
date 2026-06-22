"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";
import Link from "next/link";
import HeroSearchBox from "./HeroSearchBox";

const dictionaries = { th, en, zh };

interface HeroProps {
  featuredAsset?: any;
}

export default function Hero({ featuredAsset }: HeroProps) {
  const pathname = usePathname();

  // Get current language from pathname segment
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  // Translate helper
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

  let displayTitle = t("hero.featured_title");
  let displayLocation = t("hero.featured_location");
  let displayPrice = t("hero.featured_price");
  let displayImage = "/hero-house.png";
  let assetLink = "#";

  if (featuredAsset) {
    displayTitle = currentLang === "en" && featuredAsset.titleEn ? featuredAsset.titleEn 
                 : currentLang === "zh" && featuredAsset.titleZh ? featuredAsset.titleZh 
                 : featuredAsset.title;
    
    const locParts = [featuredAsset.subdistrict, featuredAsset.district, featuredAsset.province].filter(Boolean);
    if (locParts.length > 0) {
      displayLocation = locParts.join(", ");
    }
    
    if (featuredAsset.sellPrice) {
      displayPrice = `฿${Number(featuredAsset.sellPrice).toLocaleString()}`;
      if (featuredAsset.isRent && !featuredAsset.isSell) displayPrice += " / เดือน";
    } else if (featuredAsset.loanPrice) {
      displayPrice = `฿${Number(featuredAsset.loanPrice).toLocaleString()}`;
    }
    
    const featureImg = featuredAsset.images?.find((img: any) => img.isFeature)?.imageUrl || featuredAsset.images?.[0]?.imageUrl;
    if (featureImg) displayImage = featureImg;
    
    assetLink = `/${currentLang}/property/list/${featuredAsset.id}`;
  }

  return (
    <section className="relative min-h-[95vh] flex items-center pt-32 pb-24 px-6 overflow-hidden bg-primary-dark">
      {/* Subtle brand gold ambient background light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-40 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-accent/5 blur-[100px] rounded-full -ml-20 -mb-20"></div>
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center z-10">
        <div className="animate-fade-in text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-accent/10 border border-accent/20 text-accent mb-8">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            <span className="text-[9px] font-alt font-extrabold uppercase tracking-[0.25em] leading-none">{t("hero.badge")}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-wider leading-[1.15] mb-6 text-white">
            {t("hero.title_part1")} <br />
            <span className="text-gradient">{t("hero.title_part2")}</span>
          </h1>
          <p className="font-alt text-sm md:text-base text-white/55 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-medium">
            {t("hero.subtitle")}
          </p>

          <HeroSearchBox currentLang={currentLang} defaultTab="all" />
          
          <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-12 border-t border-white/5 pt-8">
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-accent">1,000+</span>
              <span className="text-[9px] font-alt uppercase font-bold tracking-[0.2em] text-white/40 mt-1">{t("hero.stat_properties")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-accent">500+</span>
              <span className="text-[9px] font-alt uppercase font-bold tracking-[0.2em] text-white/40 mt-1">{t("hero.stat_clients")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-accent">100%</span>
              <span className="text-[9px] font-alt uppercase font-bold tracking-[0.2em] text-white/40 mt-1">{t("hero.stat_efficiency")}</span>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in [animation-delay:200ms]">
          <div className="aspect-4/5 shadow-2xl relative rounded border border-accent/20 overflow-hidden bg-[#112240] p-3 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-10 pointer-events-none"></div>
            
            <div className="w-full h-full bg-[#0A192F] rounded relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-4 left-4 z-20">
                <div className="px-3 py-1 bg-accent text-primary-dark text-[8px] font-alt font-extrabold rounded-sm shadow-sm uppercase tracking-widest">
                  {featuredAsset ? (featuredAsset.isRent && !featuredAsset.isSell ? "For Rent" : "For Sale") : t("hero.new_listing")}
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/80 border border-white/10 p-5 rounded backdrop-blur">
                <h3 className="font-display font-bold text-lg mb-1 text-white truncate" title={displayTitle}>{displayTitle}</h3>
                <p className="font-alt text-xs text-white/55 mb-3 truncate">{displayLocation}</p>
                <div className="flex justify-between items-center text-xs font-bold font-alt">
                  <span className="text-accent">{displayPrice}</span>
                  {featuredAsset ? (
                    <Link href={assetLink} className="text-white hover:text-accent cursor-pointer transition-colors duration-300">
                      {t("hero.featured_more")}
                    </Link>
                  ) : (
                    <span className="text-white hover:text-accent cursor-pointer transition-colors duration-300">{t("hero.featured_more")}</span>
                  )}
                </div>
              </div>
              
              <Image 
                src={displayImage} 
                alt={displayTitle} 
                fill 
                priority
                quality={100}
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>
          
          {/* Floating cards for "premium" branding */}
          <div className="absolute -left-8 top-1/4 bg-black/90 border border-accent/30 p-3.5 rounded shadow-2xl z-30 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-[8px] font-alt font-bold text-accent uppercase tracking-widest">Verified</p>
                <p className="text-xs font-alt font-extrabold text-white">Property Expert</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-6 bottom-1/4 bg-black/90 border border-accent/30 p-4 rounded shadow-2xl z-30 hidden md:block">
            <div className="flex flex-col gap-1">
              <p className="text-[8px] font-alt font-bold text-accent uppercase tracking-widest">Success Rate</p>
              <div className="flex items-end gap-0.5">
                <span className="text-2xl font-display font-extrabold text-white leading-none">98</span>
                <span className="text-sm font-display font-extrabold text-accent">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
