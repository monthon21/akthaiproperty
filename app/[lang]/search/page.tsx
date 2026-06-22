import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingGrid from "@/components/ListingGrid";

export default async function SearchPage(props: {
  params: Promise<{ lang: string }> | { lang: string };
  searchParams: Promise<{ q?: string; type?: string }> | { q?: string; type?: string };
}) {
  const resolvedParams = await props.params;
  const lang = resolvedParams?.lang || "th";
  
  const resolvedSearchParams = await props.searchParams;
  const query = resolvedSearchParams?.q || "";
  const typeParam = resolvedSearchParams?.type || "all";
  
  const type = (typeParam === "sell" || typeParam === "rent") ? typeParam : undefined;

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
        <ListingGrid lang={lang} type={type as "sell" | "rent"} searchQuery={query} />
      </main>
      <Footer />
    </>
  );
}
