"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ListingCarouselProps {
  children: React.ReactNode;
}

export default function ListingCarousel({ children }: ListingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const scrollToFirst = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollToLast = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Navigation Buttons (Prominent, above the cards) */}
      <div className="flex justify-end gap-3 mb-6 hidden md:flex">
        <button 
          onClick={scrollToFirst}
          title="ไปแรกสุด"
          className="w-12 h-12 bg-white/10 text-white/70 rounded-full flex items-center justify-center hover:bg-white/20 hover:text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95"
        >
          <ChevronsLeft size={24} />
        </button>
        <button 
          onClick={scrollLeft}
          title="เลื่อนซ้าย"
          className="w-12 h-12 bg-accent text-primary-dark rounded-full flex items-center justify-center hover:bg-accent-dark transition-all cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={scrollRight}
          title="เลื่อนขวา"
          className="w-12 h-12 bg-accent text-primary-dark rounded-full flex items-center justify-center hover:bg-accent-dark transition-all cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
        <button 
          onClick={scrollToLast}
          title="ไปท้ายสุด"
          className="w-12 h-12 bg-white/10 text-white/70 rounded-full flex items-center justify-center hover:bg-white/20 hover:text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95"
        >
          <ChevronsRight size={24} />
        </button>
      </div>

      {/* Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 lg:gap-8 py-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden items-stretch w-full touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {React.Children.map(children, (child) => (
          <div className="w-[300px] md:w-[350px] lg:w-[400px] shrink-0 snap-start flex flex-col">
            <div className="flex-1 w-full h-full flex flex-col">
              {child}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
