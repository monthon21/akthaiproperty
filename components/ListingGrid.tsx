import PropertyCard from "./PropertyCard";
import { Property } from "@/lib/properties";
import { prisma } from "@/lib/prisma";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";
import Link from "next/link";

interface ListingGridProps {
  type?: "sell" | "rent";
  lang?: string;
  isRecommendedOnly?: boolean;
  searchQuery?: string;
}

function mapAssetToProperty(asset: any, lang: string): Property {
  const isRent = asset.isRent;
  const isSell = asset.isSell;
  
  let priceStr = "ติดต่อสอบถาม";
  if (asset.sellPrice) {
    priceStr = `฿${Number(asset.sellPrice).toLocaleString()}`;
    if (isRent && !isSell) {
      priceStr += " / เดือน";
    }
  } else if (asset.loanPrice) {
    priceStr = `฿${Number(asset.loanPrice).toLocaleString()} (ประเมิน)`;
  }

  // Determine category
  let category = "House";
  if (asset.type === "CONDO") category = "Condo";
  else if (asset.type === "LAND") category = "Land";

  // Fallback default image
  const featureImage = asset.images.find((img: any) => img.isFeature)?.imageUrl 
    || asset.images[0]?.imageUrl 
    || "/house1.png";

  // Fallback size
  let sqft = 120;
  if (asset.type === "CONDO") sqft = 50;
  else if (asset.type === "LAND") sqft = 200;

  let title = asset.title;
  if (lang === "en" && asset.titleEn) title = asset.titleEn;
  if (lang === "zh" && asset.titleZh) title = asset.titleZh;

  let description = asset.description || "";
  if (lang === "en" && asset.descriptionEn) description = asset.descriptionEn;
  if (lang === "zh" && asset.descriptionZh) description = asset.descriptionZh;

  return {
    id: asset.id,
    id_string: asset.code,
    title: title,
    location: `${asset.subdistrict ? asset.subdistrict + ", " : ""}${asset.district ? asset.district + ", " : ""}${asset.province || ""}`,
    price: priceStr,
    type: isRent ? "เช่า" : "ขาย",
    category,
    beds: asset.noBedroom || 0,
    baths: asset.noBathroom || 0,
    sqft,
    image: featureImage,
    description: description,
    facilities: [
      "ระบบรักษาความปลอดภัย 24 ชม.",
      "กล้อง CCTV ทั่วโครงการ",
      "ที่จอดรถส่วนตัว",
      "สวนสาธารณะ/พื้นที่สีเขียว"
    ],
    gallery: [featureImage],
    agent: {
      name: "AK Thai Property Office",
      phone: "081-234-5678",
      email: "info@akthaiproperty.com",
      line: "@akproperty"
    }
  };
}

export default async function ListingGrid({ type, lang = "th", isRecommendedOnly = false, searchQuery = "" }: ListingGridProps) {
  const dict = await getDictionary(lang as Locale);

  // Query database assets
  const dbAssets = await prisma.asset.findMany({
    where: {
      isAvailable: true,
      ...(type === "sell" ? { isSell: true } : {}),
      ...(type === "rent" ? { isRent: true } : {}),
      ...(isRecommendedOnly ? { isRecommended: true } : {}),
      ...(searchQuery ? {
        OR: [
          { code: { contains: searchQuery } },
          { district: { contains: searchQuery } },
          { province: { contains: searchQuery } },
          { projectName: { contains: searchQuery } },
          { zipCode: { contains: searchQuery } },
          { title: { contains: searchQuery } },
          { titleEn: { contains: searchQuery } },
          { titleZh: { contains: searchQuery } }
        ]
      } : {})
    },
    include: {
      images: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const mappedDbAssets = dbAssets.map(asset => mapAssetToProperty(asset, lang));

  const allProperties = mappedDbAssets;

  return (
    <section className="py-24 px-6 bg-primary-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-[10px] font-alt font-extrabold text-accent uppercase tracking-[0.35em] mb-4">{dict.listing_grid.subtitle}</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
              {dict.listing_grid.title_part1} <span className="text-gradient">{dict.listing_grid.title_part2}</span>
            </h3>
          </div>
          <Link href={`/${lang}/search`} className="px-6 py-3 border border-accent/30 text-accent font-alt font-bold text-xs tracking-widest rounded hover:bg-accent hover:text-primary-dark transition-all duration-300 shadow-md hover:shadow-accent/10 cursor-pointer text-center inline-block">
            {dict.listing_grid.view_all}
          </Link>
        </div>

        {allProperties.length === 0 ? (
          <div className="text-center py-16 border border-white/5 rounded-2xl bg-black/25">
            <p className="text-sm text-white/40">{dict.listing_grid.not_found}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {allProperties.map((property) => (
              <PropertyCard key={property.id} property={property} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
