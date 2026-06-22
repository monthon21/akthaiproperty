"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSessionAction, logoutAction } from "@/lib/actions/auth";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Fetch session on mount
    async function fetchSession() {
      try {
        const res = await getSessionAction();
        if (res?.session) {
          setSession(res.session);
        }
      } catch (err) {
        console.error("Error fetching session in Navbar:", err);
      }
    }
    fetchSession();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (lang: string) => {
    // Save to cookie so middleware remembers it
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Construct new pathname with updated locale prefix
    const segments = pathname.split("/");
    if (segments[1] && ["th", "en", "zh"].includes(segments[1])) {
      segments[1] = lang;
    } else {
      segments.splice(1, 0, lang);
    }
    const newPath = segments.join("/");
    window.location.href = newPath;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary-dark/95 backdrop-blur-md border-b border-accent/10 py-3.5 shadow-2xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href={`/${currentLang}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-accent rounded flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500">
            <span className="text-primary-dark font-display font-black text-lg tracking-wider">AK</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-widest text-white leading-none group-hover:text-accent transition-colors">AK THAI</span>
            <span className="text-[8px] tracking-[0.4em] font-alt font-extrabold text-accent uppercase mt-0.5">PROPERTY</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href={`/${currentLang}`} className="font-alt font-medium text-sm tracking-widest text-white/70 hover:text-accent transition-colors duration-300">
            {t("navbar.home")}
          </Link>
          <Link href={`/${currentLang}/buy`} className="font-alt font-medium text-sm tracking-widest text-white/70 hover:text-accent transition-colors duration-300">
            {t("navbar.buy")}
          </Link>
          <Link href={`/${currentLang}/rent`} className="font-alt font-medium text-sm tracking-widest text-white/70 hover:text-accent transition-colors duration-300">
            {t("navbar.rent")}
          </Link>
          <Link href={`/${currentLang}/loan`} className="font-alt font-medium text-sm tracking-widest text-white/70 hover:text-accent transition-colors duration-300">
            {t("navbar.loan")}
          </Link>

          {session && (
            <>
              <Link href={`/${currentLang}/addnew`} className="font-alt font-bold text-sm tracking-widest text-accent hover:text-white transition-colors duration-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                {t("navbar.addnew")}
              </Link>
              <div className="relative group">
                <button className="font-alt font-medium text-sm tracking-widest text-white/70 hover:text-accent transition-colors duration-300 flex items-center gap-1.5 cursor-pointer">
                  {currentLang === "th" ? "ระบบการจัดการ" : currentLang === "zh" ? "管理系统" : "Management"}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className="absolute top-full right-0 mt-4 w-48 bg-[#112240] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                  <Link href={`/${currentLang}/manage`} className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 hover:text-accent transition-colors border-b border-white/5">
                    {currentLang === "th" ? "รายการทรัพย์" : currentLang === "zh" ? "房源管理" : "Manage Properties"}
                  </Link>
                  <Link href={`/${currentLang}/myprofile`} className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 hover:text-accent transition-colors border-b border-white/5">
                    {t("navbar.profile")}
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <button type="submit" className="w-full text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer">
                      {currentLang === "th" ? "ออกจากระบบ" : currentLang === "zh" ? "退出登录" : "Logout"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          <Link
            href={`/${currentLang}/contact`}
            className="px-6 py-2.5 border border-accent text-accent font-alt font-semibold text-sm tracking-widest rounded hover:bg-accent hover:text-primary-dark transition-all duration-300 shadow-md hover:shadow-accent/15 transform hover:-translate-y-0.5 active:scale-95"
          >
            {t("navbar.contact")}
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-6 h-5">
            <button
              onClick={() => handleLanguageChange("th")}
              className={`text-[10px] font-black tracking-wider uppercase transition-colors hover:text-accent cursor-pointer ${
                currentLang === "th" ? "text-accent" : "text-white/40"
              }`}
            >
              TH
            </button>
            <span className="text-[10px] text-white/15">|</span>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`text-[10px] font-black tracking-wider uppercase transition-colors hover:text-accent cursor-pointer ${
                currentLang === "en" ? "text-accent" : "text-white/40"
              }`}
            >
              EN
            </button>
            <span className="text-[10px] text-white/15">|</span>
            <button
              onClick={() => handleLanguageChange("zh")}
              className={`text-[10px] font-black tracking-wider uppercase transition-colors hover:text-accent cursor-pointer ${
                currentLang === "zh" ? "text-accent" : "text-white/40"
              }`}
            >
              ZH
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/70 hover:text-accent transition-colors z-50 relative"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-40 flex flex-col justify-center items-center md:hidden transition-all duration-300 animate-fade-in">
          <div className="flex flex-col items-center gap-8 text-center w-full max-w-xs px-6">
            <Link 
              href={`/${currentLang}`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
            >
              {t("navbar.home")}
            </Link>
            <Link 
              href={`/${currentLang}/buy`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
            >
              {t("navbar.buy")}
            </Link>
            <Link 
              href={`/${currentLang}/rent`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
            >
              {t("navbar.rent")}
            </Link>
            <Link 
              href={`/${currentLang}/loan`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
            >
              {t("navbar.loan")}
            </Link>

            {session && (
              <>
                <Link 
                  href={`/${currentLang}/addnew`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-alt font-black text-lg tracking-widest text-accent hover:text-white transition-colors"
                >
                  {t("navbar.addnew")}
                </Link>
                <Link 
                  href={`/${currentLang}/manage`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
                >
                  {currentLang === "th" ? "รายการทรัพย์" : currentLang === "zh" ? "房源管理" : "Manage Properties"}
                </Link>
                <Link 
                  href={`/${currentLang}/myprofile`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-alt font-bold text-lg tracking-widest text-white hover:text-accent transition-colors"
                >
                  {t("navbar.profile")}
                </Link>
                <form action={logoutAction} className="w-full">
                  <button type="submit" className="font-alt font-bold text-lg tracking-widest text-red-400 hover:text-red-300 transition-colors cursor-pointer w-full text-center">
                    {currentLang === "th" ? "ออกจากระบบ" : currentLang === "zh" ? "退出登录" : "Logout"}
                  </button>
                </form>
              </>
            )}

            <Link
              href={`/${currentLang}/contact`}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 px-10 py-4 bg-accent text-primary-dark font-alt font-black text-sm tracking-widest rounded-xl hover:scale-105 transition-transform active:scale-95"
            >
              {t("navbar.contact")}
            </Link>

            {/* Mobile Language Switcher */}
            <div className="flex justify-center gap-4 py-2 mt-4 border-t border-white/5 pt-6 w-full">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLanguageChange("th");
                }}
                className={`px-3 py-1.5 text-xs font-black tracking-widest rounded-lg border uppercase transition-colors ${
                  currentLang === "th"
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-white/5 text-white/60"
                }`}
              >
                TH
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLanguageChange("en");
                }}
                className={`px-3 py-1.5 text-xs font-black tracking-widest rounded-lg border uppercase transition-colors ${
                  currentLang === "en"
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-white/5 text-white/60"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLanguageChange("zh");
                }}
                className={`px-3 py-1.5 text-xs font-black tracking-widest rounded-lg border uppercase transition-colors ${
                  currentLang === "zh"
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-white/5 text-white/60"
                }`}
              >
                ZH
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
