import Link from "next/link";
import LocationCard from "./LocationCard";
import { getLocations, locationText } from "@/lib/locations";

export default async function PopularLocations({
  lang = "th",
  bgColor = "bg-primary-dark",
  limit = 8,
}: {
  lang?: string;
  bgColor?: string;
  limit?: number;
}) {
  const t = locationText(lang);
  const locations = await getLocations(limit);
  if (locations.length === 0) return null;

  return (
    <section className={`py-10 md:py-12 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-end mb-5 md:mb-8 gap-4 md:gap-8">
          <div>
            <h2 className="text-[10px] font-alt font-extrabold text-accent uppercase tracking-[0.35em] mb-2 md:mb-4">{t.sectionSubtitle}</h2>
            <h3 className="text-2xl md:text-5xl font-display font-bold text-white tracking-wide">
              {t.sectionTitle1} <span className="text-gradient">{t.sectionTitle2}</span>
            </h3>
          </div>
          <Link
            href={`/${lang}/location`}
            className="shrink-0 px-3 py-2 md:px-6 md:py-3 border border-accent/30 text-accent font-alt font-bold text-[11px] md:text-xs md:tracking-widest rounded hover:bg-accent hover:text-primary-dark transition-all duration-300 text-center inline-block"
          >
            {t.viewAll}
          </Link>
        </div>
        {/* phones: one swipeable row (about two cards on screen); md and up: grid */}
        <div
          className="flex overflow-x-auto overscroll-x-contain snap-x snap-proximity gap-3 -mx-6 px-6 scroll-px-6 pb-1 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:mx-0 md:px-0 md:pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {locations.map((loc) => (
            <div key={loc.href} className="w-[44vw] max-w-[200px] shrink-0 snap-start md:w-auto md:max-w-none">
              <LocationCard location={loc} lang={lang} listingsLabel={t.listings} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
