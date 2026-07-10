"use client";

import Image from "next/image";
import { useState } from "react";

interface GreetingPhotosProps {
  lang?: string;
}

export default function GreetingPhotos({ lang = 'th' }: GreetingPhotosProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Generate array of 20 images from ak-greeting-01.jpg to ak-greeting-20.jpg
  const allImages = Array.from({ length: 20 }, (_, i) => 
    `/greeting/ak-greeting-${(i + 1).toString().padStart(2, '0')}.jpg`
  );

  // Split into two rows for the marquee effect
  const row1 = allImages.slice(0, 10);
  const row2 = allImages.slice(10, 20);

  const subtitle = lang === 'zh' ? '满意客户' : 'Our Happy Clients';
  const title = lang === 'zh' 
    ? '客户感言' 
    : lang === 'en' 
      ? 'Client Impressions' 
      : 'ความประทับใจจากลูกค้าของเรา';

  return (
    <section className="py-24 border-t border-foreground/5 overflow-hidden bg-black/20">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-sm font-bold text-accent uppercase tracking-[0.3em] mb-4">{subtitle}</h2>
        <h3 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h3>
      </div>

      <div className="flex flex-col gap-6 relative">
        {/* Row 1 - Moves Left */}
        <div className="flex w-max animate-marquee hover:pause">
          {[...row1, ...row1].map((src, index) => (
            <div 
              key={`row1-${index}`} 
              className="h-[200px] md:h-[260px] mx-3 relative rounded-xl overflow-hidden shadow-lg shrink-0 bg-black/40 hover:scale-[1.15] hover:z-40 hover:shadow-2xl transition-all duration-500 cursor-zoom-in"
              onClick={() => setSelectedImage(src)}
            >
              <img 
                src={src} 
                alt="Happy Client" 
                loading="lazy"
                className="h-full w-auto object-contain block" 
              />
              <div className="absolute inset-0 bg-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Row 2 - Moves Right */}
        <div className="flex w-max animate-marquee-reverse hover:pause">
          {[...row2, ...row2].map((src, index) => (
            <div 
              key={`row2-${index}`} 
              className="h-[200px] md:h-[260px] mx-3 relative rounded-xl overflow-hidden shadow-lg shrink-0 bg-black/40 hover:scale-[1.15] hover:z-40 hover:shadow-2xl transition-all duration-500 cursor-zoom-in"
              onClick={() => setSelectedImage(src)}
            >
              <img 
                src={src} 
                alt="Happy Client" 
                loading="lazy"
                className="h-full w-auto object-contain block" 
              />
              <div className="absolute inset-0 bg-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            ✕
          </button>

          <div className="absolute top-6 md:top-10 left-0 right-0 text-center pointer-events-none z-10 px-12">
            <h2 className="text-xs md:text-sm font-bold text-accent uppercase tracking-[0.3em] mb-2 drop-shadow-md">{subtitle}</h2>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">{title}</h3>
          </div>

          <div className="relative mt-12 md:mt-0 flex items-center justify-center w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Expanded Client" 
              className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded-xl shadow-2xl relative z-0" 
            />
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden mix-blend-overlay">
              <span className="text-white/30 text-2xl md:text-6xl font-black tracking-[0.3em] uppercase -rotate-12 whitespace-nowrap drop-shadow-md">
                akthaiproperty.com
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee 40s linear infinite reverse;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
