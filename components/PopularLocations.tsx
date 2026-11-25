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
    <section className={`py-12 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
          <div>
            <h2 className="text-[10px] font-alt font-extrabold text-accent uppercase tracking-[0.35em] mb-4">{t.sectionSubtitle}</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
              {t.sectionTitle1} <span className="text-gradient">{t.sectionTitle2}</span>
            </h3>
          </div>
          <Link
            href={`/${lang}/location`}
            className="px-6 py-3 border border-accent/30 text-accent font-alt font-bold text-xs tracking-widest rounded hover:bg-accent hover:text-primary-dark transition-all duration-300 text-center inline-block"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {locations.map((loc) => (
            <LocationCard key={loc.href} location={loc} lang={lang} listingsLabel={t.listings} />
          ))}
        </div>
      </div>
    </section>
  );
}
