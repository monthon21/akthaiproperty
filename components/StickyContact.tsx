"use client";
import { useEffect, useState } from "react";

export default function StickyContact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 animate-fade-in sm:bottom-10 sm:right-10">
      {/* Phone Button */}
      <a 
        href="tel:0824448989" 
        className="w-12 h-12 bg-accent text-primary-dark rounded shadow-2xl border border-accent/20 flex items-center justify-center hover:scale-105 hover:-translate-y-0.5 hover:bg-accent-dark transition-all duration-300 group"
        title="Call Us"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      </a>

      {/* LINE Button */}
      <a 
        href="https://line.me/R/ti/p/@akthai59" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#06C755] text-white rounded shadow-2xl border border-white/10 flex items-center justify-center hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group"
        title="Chat on LINE"
      >
        <span className="font-alt font-black text-[9px] tracking-wider">LINE</span>
      </a>
    </div>
  );
}
