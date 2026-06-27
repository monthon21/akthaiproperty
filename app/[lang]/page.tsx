import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceCards from "@/components/ServiceCards";
import ListingGrid from "@/components/ListingGrid";
import LoanSection from "@/components/LoanSection";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Fetch the latest available asset for the Hero section
  const dbAsset = await prisma.asset.findFirst({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
    }
  });

  let featuredAsset = null;
  if (dbAsset) {
    featuredAsset = {
      id: dbAsset.id,
      title: dbAsset.title,
      titleEn: dbAsset.titleEn,
      titleZh: dbAsset.titleZh,
      subdistrict: dbAsset.subdistrict,
      district: dbAsset.district,
      province: dbAsset.province,
      sellPrice: dbAsset.sellPrice ? Number(dbAsset.sellPrice) : null,
      loanPrice: dbAsset.loanPrice ? Number(dbAsset.loanPrice) : null,
      isRent: dbAsset.isRent,
      isSell: dbAsset.isSell,
      images: dbAsset.images.map(img => ({
        imageUrl: img.imageUrl,
        isFeature: img.isFeature
      }))
    };
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {/* Entrance Section */}
        <Hero featuredAsset={featuredAsset} />
        
        {/* Direct Listings Selection */}
        <ListingGrid lang={lang} isRecommendedOnly={true} bgColor="bg-primary" />

        {/* Focus Services */}
        <ServiceCards lang={lang} bgColor="bg-primary-dark" />
        
        {/* Specialized Mortgage Section */}
        <LoanSection lang={lang} />
        
        {/* Final CTA Section */}
        <section className="py-32 px-6 bg-primary relative overflow-hidden group">
          {/* Animated decorative shapes */}
          <div className="absolute top-0 right-1/4 w-[600px] h-full bg-white/5 skew-x-12 transform -translate-y-1/2 group-hover:translate-x-10 transition-transform duration-1000"></div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-[0.4em] mb-8">{dict.cta.subtitle}</h2>
            <h3 className="text-4xl md:text-7xl font-black text-white mb-12 tracking-tighter leading-[0.9]">
              {dict.cta.title_part1} <span className="text-white/40 italic">{dict.cta.title_italic}</span> <br className="hidden md:block" /> 
              {dict.cta.title_part2}
            </h3>
            <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              {dict.cta.desc}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <Link 
                href={`/${lang}/contact`} 
                className="w-full sm:w-auto px-12 py-6 bg-accent text-white rounded-2xl text-lg font-black hover:bg-accent-dark hover:scale-110 transition-all shadow-2xl hover:shadow-accent/40 active:scale-95"
              >
                {dict.cta.btn_contact}
              </Link>
              <div className="flex flex-col text-left">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{dict.cta.call_now}</span>
                <a href="tel:0824448989" className="text-2xl font-black text-white hover:text-white/80 transition-colors">082-444-8989</a>
              </div>
            </div>
          </div>
          
          {/* Subtle light effect */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
