"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ListingCarouselProps {
  children: React.ReactNode;
  /** carousel on phones only; from md up the children are laid out as a 3-column grid */
  gridFromMd?: boolean;
}

export default function ListingCarousel({ children, gridFromMd = false }: ListingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = React.Children.count(children);
  const [index, setIndex] = useState(0);

  /** distance from one card to the next (card width + gap) */
  const step = () => {
    const el = scrollRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    const second = el?.children[1] as HTMLElement | undefined;
    if (!first) return 400;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  };

  const scrollByCards = (n: number) => scrollRef.current?.scrollBy({ left: n * step(), behavior: "smooth" });
  const scrollToFirst = () => scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  const scrollToLast = () => scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });

  // which card is at the left edge — for the "2 / 8" counter and disabling the arrows at the ends
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        setIndex(atEnd ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / step())));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [total]);

  const roundBtn = "rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-default";
  const goldBtn = `${roundBtn} bg-accent text-primary-dark hover:bg-accent-dark shadow-lg shadow-accent/20`;
  // phones: see-through gold so the card underneath stays visible
  const sideBtn = `${roundBtn} bg-accent/35 text-white border border-accent/60 backdrop-blur-sm shadow-lg active:bg-accent/60`;
  const ghostBtn = `${roundBtn} bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm`;

  return (
    <div className="flex flex-col">
      {/* Navigation Buttons (desktop: above the cards) */}
      <div className={`justify-end gap-3 mb-6 hidden ${gridFromMd ? "" : "md:flex"}`}>
        <button onClick={scrollToFirst} title="ไปแรกสุด" aria-label="ไปแรกสุด" className={`w-12 h-12 ${ghostBtn}`}>
          <ChevronsLeft size={24} />
        </button>
        <button onClick={() => scrollByCards(-1)} title="เลื่อนซ้าย" aria-label="เลื่อนซ้าย" className={`w-12 h-12 ${goldBtn}`}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => scrollByCards(1)} title="เลื่อนขวา" aria-label="เลื่อนขวา" className={`w-12 h-12 ${goldBtn}`}>
          <ChevronRight size={24} />
        </button>
        <button onClick={scrollToLast} title="ไปท้ายสุด" aria-label="ไปท้ายสุด" className={`w-12 h-12 ${ghostBtn}`}>
          <ChevronsRight size={24} />
        </button>
      </div>

      {/*
        Scroll Area.
        - No touch-action override: the browser decides from the direction of the finger, so a sideways
          swipe moves the cards and an up/down swipe still scrolls the page.
        - On phones the strip runs to the screen edges (-mx-6) so the next card peeks in and the whole
          width can be swiped; snapping is "proximity" so a short flick is enough.
      */}
      <div className="relative">
        <div
          ref={scrollRef}
          className={`flex overflow-x-auto overscroll-x-contain gap-4 py-4 -mx-6 px-6 scroll-px-6 md:mx-0 md:px-0 md:scroll-px-0 snap-x snap-proximity [&::-webkit-scrollbar]:hidden items-stretch ${
            gridFromMd ? "md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:py-0" : "md:gap-6 lg:gap-8 md:py-8 md:snap-mandatory"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {React.Children.map(children, (child) => (
            <div className={`w-[80vw] max-w-[340px] md:max-w-none shrink-0 snap-start flex flex-col ${gridFromMd ? "md:w-auto" : "md:w-[350px] lg:w-[400px]"}`}>
              <div className="flex-1 w-full h-full flex flex-col">{child}</div>
            </div>
          ))}
        </div>

        {/* Phones: arrows on both sides of the cards, as an alternative to swiping */}
        {total > 1 && (
          <>
            <button
              onClick={() => scrollByCards(-1)}
              disabled={index === 0}
              aria-label="ทรัพย์ก่อนหน้า"
              className={`md:hidden absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 ${sideBtn} disabled:hidden`}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              disabled={index >= total - 1}
              aria-label="ทรัพย์ถัดไป"
              className={`md:hidden absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 ${sideBtn} disabled:hidden`}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <p className="md:hidden text-center text-xs font-bold text-white/50 tabular-nums mt-1" aria-live="polite">
          {index + 1} / {total}
        </p>
      )}
    </div>
  );
}
