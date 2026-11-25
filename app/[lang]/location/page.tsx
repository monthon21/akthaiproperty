import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocationCard from "@/components/LocationCard";
import { getLocations, locationText } from "@/lib/locations";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await props.params;
  const t = locationText(lang);
  const title = `${t.indexTitle} | AK Thai Property`;
  return {
    title,
    description: t.indexDesc,
    openGraph: { title, description: t.indexDesc },
    alternates: {
      languages: { th: "/th/location", en: "/en/location", zh: "/zh/location" },
    },
  };
}

export default async function LocationIndexPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const t = locationText(lang);
  const locations = await getLocations();

  // Group areas under their province, provinces with most listings first
  const byProvince = new Map<string, typeof locations>();
  for (const loc of locations) {
    const list = byProvince.get(loc.province) || [];
    list.push(loc);
    byProvince.set(loc.province, list);
  }
  const provinces = [...byProvince.entries()].sort(
    (a, b) => b[1].reduce((n, l) => n + l.count, 0) - a[1].reduce((n, l) => n + l.count, 0)
  );

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-16">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">{t.indexTitle}</h1>
          <p className="text-white/50 text-sm mt-2 font-medium max-w-2xl">{t.indexDesc}</p>

          {provinces.length === 0 ? (
            <p className="text-sm text-white/40 mt-12">{t.noLocations}</p>
          ) : (
            provinces.map(([province, list]) => (
              <section key={province} className="mt-12">
                <h2 className="text-xl font-display font-bold text-accent mb-5">{province}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {list.map((loc) => (
                    <LocationCard key={loc.href} location={loc} lang={lang} listingsLabel={t.listings} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
