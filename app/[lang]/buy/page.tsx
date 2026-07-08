import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingGrid from "@/components/ListingGrid";
import SearchFilterControls from "@/components/SearchFilterControls";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const SEO: Record<string, { title: string; description: string }> = {
  th: {
    title: "ซื้อบ้าน คอนโด ที่ดิน | AK Thai Property",
    description: "ค้นหาบ้าน คอนโด ที่ดิน และอสังหาริมทรัพย์เพื่อการซื้อในทุกจังหวัดทั่วไทย ราคาดี คัดสรรโดยผู้เชี่ยวชาญ AK Thai Property",
  },
  en: {
    title: "Buy House, Condo & Land in Thailand | AK Thai Property",
    description: "Browse houses, condos, and land for sale across Thailand. Trusted listings curated by AK Thai Property experts.",
  },
  zh: {
    title: "购买泰国房产 | AK Thai Property",
    description: "浏览泰国各地出售的房屋、公寓和土地。由AK Thai Property专家精选的优质房源。",
  },
};

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await props.params;
  const seo = SEO[lang] || SEO["th"];
  return {
    title: seo.title,
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description },
  };
}


export default async function BuyPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    q?: string;
    code?: string;
    province?: string;
    zipCode?: string;
    projectName?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
    ownerName?: string;
    bedrooms?: string;
    bathrooms?: string;
    parking?: string;
    minArea?: string;
    maxArea?: string;
  }> | {
    q?: string;
    code?: string;
    province?: string;
    zipCode?: string;
    projectName?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
    ownerName?: string;
    bedrooms?: string;
    bathrooms?: string;
    parking?: string;
    minArea?: string;
    maxArea?: string;
  };
}) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);

  const resolvedSearchParams = await props.searchParams;
  const query = resolvedSearchParams?.q || "";
  const code = resolvedSearchParams?.code || "";
  const province = resolvedSearchParams?.province || "";
  const zipCode = resolvedSearchParams?.zipCode || "";
  const projectName = resolvedSearchParams?.projectName || "";
  const propertyType = resolvedSearchParams?.propertyType || "";
  const ownerName = resolvedSearchParams?.ownerName || "";

  const minPriceStr = resolvedSearchParams?.minPrice || "";
  const maxPriceStr = resolvedSearchParams?.maxPrice || "";
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  const bedroomsStr = resolvedSearchParams?.bedrooms || "";
  const bathroomsStr = resolvedSearchParams?.bathrooms || "";
  const parkingStr = resolvedSearchParams?.parking || "";
  const minAreaStr = resolvedSearchParams?.minArea || "";
  const maxAreaStr = resolvedSearchParams?.maxArea || "";

  const bedrooms = bedroomsStr ? parseInt(bedroomsStr) : undefined;
  const bathrooms = bathroomsStr ? parseInt(bathroomsStr) : undefined;
  const parking = parkingStr ? parseInt(parkingStr) : undefined;
  const minArea = minAreaStr ? parseFloat(minAreaStr) : undefined;
  const maxArea = maxAreaStr ? parseFloat(maxAreaStr) : undefined;

  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const canSearchOwner = userRole === "ADMIN" || userRole === "USER";

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 flex-1 bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">{dict.listing_grid.sell_page_title}</h1>
            <p className="text-white/60 text-lg">{dict.listing_grid.sell_page_desc}</p>
          </div>
          
          <div className="mb-16">
            <SearchFilterControls currentLang={lang} canSearchOwner={canSearchOwner} mode="sell" />
          </div>
          
          <ListingGrid 
            type="sell" 
            lang={lang} 
            searchQuery={query}
            code={code}
            province={province}
            zipCode={zipCode}
            projectName={projectName}
            propertyType={propertyType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            ownerName={ownerName}
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            parking={parking}
            minArea={minArea}
            maxArea={maxArea}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
