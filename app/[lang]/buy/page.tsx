import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingGrid from "@/components/ListingGrid";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";
import HeroSearchBox from "@/components/HeroSearchBox";

export const dynamic = "force-dynamic";

export default async function BuyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4">{dict.listing_grid.sell_page_title}</h1>
            <p className="text-foreground/60 text-lg">{dict.listing_grid.sell_page_desc}</p>
          </div>
          
          <div className="mb-16">
            <HeroSearchBox currentLang={lang} defaultTab="buy" className="w-full" />
          </div>
          
          <ListingGrid type="sell" lang={lang} />
        </div>
      </main>
      <Footer />
    </>
  );
}
