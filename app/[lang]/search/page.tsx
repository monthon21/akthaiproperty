import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingGrid from "@/components/ListingGrid";
import SearchFilterControls from "@/components/SearchFilterControls";

export default async function SearchPage(props: {
  params: Promise<{ lang: string }> | { lang: string };
  searchParams: Promise<{ 
    q?: string; 
    type?: string; 
    deal?: string;
    code?: string;
    province?: string;
    zipCode?: string;
    projectName?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
  }> | { 
    q?: string; 
    type?: string; 
    deal?: string;
    code?: string;
    province?: string;
    zipCode?: string;
    projectName?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const resolvedParams = await props.params;
  const lang = resolvedParams?.lang || "th";
  
  const resolvedSearchParams = await props.searchParams;
  const query = resolvedSearchParams?.q || "";
  const code = resolvedSearchParams?.code || "";
  const province = resolvedSearchParams?.province || "";
  const zipCode = resolvedSearchParams?.zipCode || "";
  const projectName = resolvedSearchParams?.projectName || "";
  const propertyType = resolvedSearchParams?.propertyType || "";

  // Handle both 'deal' and legacy 'type' query parameters from HeroSearchBox
  const dealParam = resolvedSearchParams?.deal || resolvedSearchParams?.type || "all";
  let deal: "sell" | "rent" | "all" = "all";
  if (dealParam === "sell" || dealParam === "buy") {
    deal = "sell";
  } else if (dealParam === "rent") {
    deal = "rent";
  }

  const minPriceStr = resolvedSearchParams?.minPrice || "";
  const maxPriceStr = resolvedSearchParams?.maxPrice || "";

  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">
            ผลการค้นหา {query && <span className="text-accent">"{query}"</span>}
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">
            แสดงรายการทรัพย์สินทั้งหมดที่ตรงกับเงื่อนไขการค้นหาของคุณ
          </p>
        </div>

        {/* Advanced Search & Filter Controls */}
        <SearchFilterControls currentLang={lang} />

        <ListingGrid 
          lang={lang} 
          type={deal === "all" ? undefined : deal} 
          searchQuery={query}
          code={code}
          province={province}
          zipCode={zipCode}
          projectName={projectName}
          propertyType={propertyType}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </main>
      <Footer />
    </>
  );
}

