"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionAction } from "@/lib/actions/auth";
import { subscribeToNewsletterAction } from "@/lib/actions/newsletter";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

export default function Footer() {
  const [session, setSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    async function fetchSession() {
      try {
        const res = await getSessionAction();
        if (res?.session) {
          setSession(res.session);
        }
      } catch (err) {
        console.error("Error fetching session in Footer:", err);
      }
    }
    fetchSession();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await subscribeToNewsletterAction(formData);
      setIsSuccess(res.success);
      setNewsletterMsg(res.success ? t("newsletter.success") : (res.error || t("newsletter.error")));

      if (res.success && formRef.current) {
        formRef.current.reset();
      }

      setTimeout(() => {
        setNewsletterMsg("");
      }, 5000);
    } catch (err) {
      setIsSuccess(false);
      setNewsletterMsg(t("newsletter.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="pt-20 pb-10 px-6 border-t border-accent/15 bg-black text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-10 pb-16 border-b border-white/5">
        <div className="lg:col-span-1">
          <Link href={`/${currentLang}`} className="inline-flex items-center gap-3 group mb-8">
            <div className="w-11 h-11 bg-accent rounded flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500">
              <span className="text-primary-dark font-display font-black text-lg tracking-wider">AK</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-widest text-white leading-none group-hover:text-accent transition-colors">AK THAI</span>
              <span className="text-[8px] tracking-[0.4em] font-alt font-extrabold text-accent uppercase mt-0.5">PROPERTY</span>
            </div>
          </Link>
          <p className="font-alt text-xs text-white/55 leading-relaxed mb-8 max-w-xs font-medium">
            {t("footer.about_desc")}
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=100081747750595" className="w-9 h-9 border border-white/10 rounded flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary-dark transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-white group-hover:text-primary-dark group-hover:scale-105 transition-all duration-300">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.493v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="https://lin.ee/puPdbPB" className="w-9 h-9 border border-white/10 rounded flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary-dark transition-all duration-300 group">
              <span className="text-[10px] font-alt font-extrabold text-white group-hover:text-primary-dark group-hover:scale-105 transition-all duration-300 tracking-wider">LINE</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-alt font-extrabold uppercase tracking-[0.25em] text-accent mb-8">{t("footer.quick_links")}</h4>
          <ul className="flex flex-col gap-4">
            <li><Link href={`/${currentLang}`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("navbar.home")}</Link></li>
            <li><Link href={`/${currentLang}/buy`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("navbar.buy")}</Link></li>
            <li><Link href={`/${currentLang}/rent`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("navbar.rent")}</Link></li>
            <li><Link href={`/${currentLang}/loan`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("navbar.loan")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-alt font-extrabold uppercase tracking-[0.25em] text-accent mb-8">{t("footer.support")}</h4>
          <ul className="flex flex-col gap-4">
            <li><Link href={`/${currentLang}/faq`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">FAQ</Link></li>
            <li><Link href={`/${currentLang}/privacy`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("footer.privacy_policy")}</Link></li>
            <li><Link href={`/${currentLang}/terms`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("footer.terms_conditions")}</Link></li>
            <li><Link href={`/${currentLang}/about`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">About Us</Link></li>
            {session ? (
              <li><Link href={`/${currentLang}/myprofile`} className="font-alt text-xs font-semibold text-accent hover:text-white transition-colors duration-300">{t("navbar.profile")}</Link></li>
            ) : (
              <li><Link href={`/${currentLang}/login`} className="font-alt text-xs font-semibold text-white/50 hover:text-accent transition-colors duration-300">{t("navbar.login")}</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-alt font-extrabold uppercase tracking-[0.25em] text-accent mb-8">{t("newsletter.title")}</h4>
          <p className="font-alt text-xs text-white/50 mb-6 font-medium">{t("newsletter.desc")}</p>
          <form ref={formRef} onSubmit={handleNewsletterSubmit} className="relative overflow-hidden group rounded-sm flex">
            <input
              type="email"
              name="email"
              required
              placeholder={t("newsletter.placeholder")}
              className="w-full h-11 bg-[#0A192F] border border-white/10 px-4 text-xs focus:outline-none focus:border-accent/60 text-white rounded-l transition-all font-alt disabled:opacity-50"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent text-primary-dark px-4 font-alt font-black text-[10px] tracking-widest uppercase hover:bg-accent-dark transition-all rounded-r flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">...</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>
          {newsletterMsg && (
            <div className={`mt-3 text-[10px] font-alt font-bold tracking-wider ${isSuccess ? 'text-green-400' : 'text-red-400'} animate-fade-in`}>
              {newsletterMsg}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-alt text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-none">
          © 2026 AK THAI PROPERTY. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-8 font-alt text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-none">
          <a href="#" className="hover:text-accent transition-colors">Twitter</a>
          <a href="#" className="hover:text-accent transition-colors">Instagram</a>
          <a href="#" className="hover:text-accent transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

