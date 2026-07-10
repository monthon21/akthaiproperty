"use client";

import { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  gallery: string[];
  title: string;
  id_string?: string;
  sellPrice?: string | null;
  rentPrice?: string | null;
  type?: string;
  lang?: string;
}

export default function PropertyGallery({ gallery, title, id_string, sellPrice, rentPrice, type, lang = 'th' }: PropertyGalleryProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const handleNext = () => setActiveIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setShowLightbox(true);
  };

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden mb-12 shadow-2xl bg-black/20 border border-white/5 h-[350px] md:h-[450px] lg:h-[550px] group">
        
        {/* Dynamic Tags */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          {sellPrice && (
            <span className="px-3 py-1 bg-[#D4AF37] text-[#112240] text-[10px] md:text-xs font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-[#8B6508]">
              {lang === 'th' ? 'ขาย' : lang === 'zh' ? '出售' : 'Sale'}
            </span>
          )}
          {rentPrice && (
            <span className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-400 text-[#112240] text-[10px] md:text-xs font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-gray-500">
              {lang === 'th' ? 'เช่า' : lang === 'zh' ? '出租' : 'Rent'}
            </span>
          )}
          {!sellPrice && !rentPrice && (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-alt font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
              {type}
            </span>
          )}
        </div>

        {/* Slider Container */}
        <div 
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {gallery.map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-full h-full flex-shrink-0 cursor-pointer"
              onClick={() => openLightbox(idx)}
            >
              <Image 
                src={img} 
                alt={`${title} view ${idx + 1}`} 
                fill 
                priority={idx === 0}
                sizes="100vw"
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500"></div>
              
              {/* Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <div className="text-white/10 text-xl md:text-3xl lg:text-4xl font-black tracking-[0.25em] uppercase select-none -rotate-12 transform scale-110 border border-white/5 px-6 py-2 rounded-xl bg-black/5 backdrop-blur-[0.5px]">
                  AK THAI PROPERTY
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        {gallery.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}

        {/* Fullscreen Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); openLightbox(activeIndex); }}
          className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white p-2 md:p-2.5 rounded-lg opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 border border-white/10 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">Full Screen</span>
        </button>

      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
          {/* Header Area */}
          <div className="absolute top-6 left-6 md:top-8 md:left-10 z-50 max-w-[70vw] md:max-w-[80vw]">
            <h2 className="text-white text-base md:text-2xl font-bold truncate drop-shadow-md">{title}</h2>
            {id_string && (
              <p className="text-[#D4AF37] text-xs md:text-sm font-medium mt-1 uppercase tracking-widest drop-shadow-md">
                ID: {id_string}
              </p>
            )}
          </div>

          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            <Image 
              src={gallery[activeIndex]} 
              alt={`${title} lightbox view ${activeIndex + 1}`} 
              fill
              className="object-contain"
            />
            
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <div className="text-white/10 text-2xl md:text-5xl lg:text-6xl font-black tracking-[0.25em] uppercase select-none -rotate-12 transform scale-110 border border-white/5 px-8 py-3 rounded-2xl bg-black/5 backdrop-blur-[0.5px]">
                AK THAI PROPERTY
              </div>
            </div>
          </div>

          {/* Navigation Buttons (Edge of screen) */}
          {gallery.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 md:p-4 rounded-full transition-all z-[110] border border-white/10 shadow-xl backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 md:p-4 rounded-full transition-all z-[110] border border-white/10 shadow-xl backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
            <div className="bg-black/50 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest border border-white/10">
              {activeIndex + 1} / {gallery.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
