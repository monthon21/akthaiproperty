import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingGrid from "@/components/ListingGrid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decodeParam, locationPath, locationText } from "@/lib/locations";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = Promise<{ lang: string; province: string; district: string }>;
type SearchParams = Promise<{ deal?: string }>;

async function resolveLocation(params: Params) {
  const { lang, province, district } = await params;
  const p = decodeParam(province).trim();
  const d = decodeParam(district).trim();
  const count = await prisma.asset.count({
    where: { isAvailable: true, province: p, district: d },
  });
  return { lang, province: p, district: d, count };
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { lang, province, district, count } = await resolveLocation(props.params);
  if (count === 0) return {};
  const t = locationText(lang);
  const title = `${t.pageTitle(district, province)} | AK Thai Property`;
  const description = t.pageDesc(district, province, count);
  const path = locationPath(province, district);
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `/${lang}${path}`,
      languages: { th: `/th${path}`, en: `/en${path}`, zh: `/zh${path}` },
    },
  };
}

export default async function LocationPage(props: { params: Params; searchParams: SearchParams }) {
  const { lang, province, district, count } = await resolveLocation(props.params);
  if (count === 0) notFound();

  const { deal: dealParam } = await props.searchParams;
  const deal: "sell" | "rent" | undefined =
    dealParam === "sell" ? "sell" : dealParam === "rent" ? "rent" : undefined;

  const t = locationText(lang);
  const base = `/${lang}${locationPath(province, district)}`;
  const tabs: { key: "all" | "sell" | "rent"; label: string; href: string }[] = [
    { key: "all", label: t.allDeals, href: base },
    { key: "sell", label: t.sell, href: `${base}?deal=sell` },
    { key: "rent", label: t.rent, href: `${base}?deal=rent` },
  ];
  const activeTab = deal || "all";

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-[#0A192F]">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
          <nav className="text-[11px] text-white/40 font-alt mb-4 flex flex-wrap gap-1.5">
            <Link href={`/${lang}`} className="hover:text-accent">{t.breadcrumbHome}</Link>
            <span>/</span>
            <Link href={`/${lang}/location`} className="hover:text-accent">{t.breadcrumbLocations}</Link>
            <span>/</span>
            <span className="text-white/70">{district}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">
            {t.pageTitle(district, province)}
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium max-w-3xl">
            {t.pageDesc(district, province, count)}
          </p>

          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-5 py-2 rounded text-xs font-alt font-bold tracking-widest transition-all ${
                  activeTab === tab.key
                    ? "bg-accent text-primary-dark"
                    : "border border-white/10 text-white/60 hover:text-white hover:border-accent/40"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <ListingGrid lang={lang} type={deal} province={province} district={district} />

        <div className="max-w-7xl mx-auto px-6 pb-16">
          <a
            href="https://line.me/R/ti/p/@akthai59"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-6 py-4 rounded-2xl bg-[#06C755] text-white font-alt font-bold text-sm hover:opacity-90 transition"
          >
            {t.contactCta}
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
