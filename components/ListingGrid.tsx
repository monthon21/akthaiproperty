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
  code?: string;
  province?: string;
  zipCode?: string;
  projectName?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

function mapAssetToProperty(asset: any, lang: string): Property {
  const isRent = asset.isRent;
  const isSell = asset.isSell;
  
  let priceStr = "ติดต่อสอบถาม";
  const parts: string[] = [];
  if (isSell && asset.sellPrice) {
    parts.push(`${Number(asset.sellPrice).toLocaleString()}`);
  }
  if (isRent && asset.loanPrice) {
    parts.push(`${Number(asset.loanPrice).toLocaleString()} / เดือน`);
  }
  if (parts.length > 0) priceStr = parts.join(" | ");

  const sellPriceStr = isSell && asset.sellPrice && Number(asset.sellPrice) > 0 ? `${Number(asset.sellPrice).toLocaleString()}` : null;
  const rentPriceStr = isRent && asset.loanPrice && Number(asset.loanPrice) > 0 ? `${Number(asset.loanPrice).toLocaleString()}` : null;

  // Determine category
  let category = "House";
  if (asset.type === "SINGLE_HOUSE") category = "House";
  else if (asset.type === "TOWNHOUSE") category = "Townhouse";
  else if (asset.type === "SEMI_DETACHED") category = "Semi-Detached";
  else if (asset.type === "VILLA") category = "Villa";
  else if (asset.type === "FACTORY") category = "Factory";
  else if (asset.type === "WAREHOUSE") category = "Warehouse";
  else if (asset.type === "OFFICE") category = "Office";
  else if (asset.type === "RETAIL") category = "Retail";
  else if (asset.type === "LAND") category = "Land";
  else if (asset.type === "COMMERCIAL") category = "Commercial";
  else if (asset.type === "APARTMENT") category = "Apartment";
  else if (asset.type === "OTHER") category = "Other";

  // Fallback default image
  const featureImage = asset.images.find((img: any) => img.isFeature)?.imageUrl 
    || asset.images[0]?.imageUrl 
    || "/house1.png";

  // Fallback size
  let sqft = asset.usableArea ? Number(asset.usableArea) : (asset.landSize ? Number(asset.landSize) : 120);
  if (!asset.usableArea && !asset.landSize) {
    if (asset.type === "LAND") sqft = 200;
    else if (asset.type === "APARTMENT" || asset.type === "OFFICE" || asset.type === "RETAIL") sqft = 50;
  }

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
    sellPrice: sellPriceStr,
    rentPrice: rentPriceStr,
    type: isRent ? "เช่า" : "ขาย",
    category,
    beds: asset.noBedroom || 0,
    baths: asset.noBathroom || 0,
    sqft,
    landSize: asset.landSize ? Number(asset.landSize) : undefined,
    usableArea: asset.usableArea ? Number(asset.usableArea) : undefined,
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

export default async function ListingGrid({ 
  type, 
  lang = "th", 
  isRecommendedOnly = false, 
  searchQuery = "",
  code,
  province,
  zipCode,
  projectName,
  propertyType,
  minPrice,
  maxPrice
}: ListingGridProps) {
  const dict = await getDictionary(lang as Locale);

  // Construct dynamic database query
  const whereConditions: any = {
    isAvailable: true,
  };

  if (type === "sell") {
    whereConditions.isSell = true;
  } else if (type === "rent") {
    whereConditions.isRent = true;
  }

  if (propertyType && propertyType !== "ALL") {
    whereConditions.type = propertyType;
  }

  if (code && code.trim()) {
    whereConditions.code = { contains: code.trim() };
  }
  if (province && province.trim()) {
    whereConditions.province = { contains: province.trim() };
  }
  if (zipCode && zipCode.trim()) {
    whereConditions.zipCode = { contains: zipCode.trim() };
  }
  if (projectName && projectName.trim()) {
    whereConditions.projectName = { contains: projectName.trim() };
  }
  if (isRecommendedOnly) {
    whereConditions.isRecommended = true;
  }

  if (searchQuery && searchQuery.trim()) {
    whereConditions.OR = [
      { code: { contains: searchQuery.trim() } },
      { district: { contains: searchQuery.trim() } },
      { province: { contains: searchQuery.trim() } },
      { projectName: { contains: searchQuery.trim() } },
      { zipCode: { contains: searchQuery.trim() } },
      { title: { contains: searchQuery.trim() } },
      { titleEn: { contains: searchQuery.trim() } },
      { titleZh: { contains: searchQuery.trim() } }
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const minVal = minPrice ?? 0;
    const maxVal = maxPrice ?? Number.MAX_SAFE_INTEGER;

    if (type === "sell") {
      whereConditions.sellPrice = {
        gte: minVal,
        lte: maxVal
      };
    } else if (type === "rent") {
      whereConditions.loanPrice = {
        gte: minVal,
        lte: maxVal
      };
    } else {
      whereConditions.AND = whereConditions.AND || [];
      whereConditions.AND.push({
        OR: [
          {
            isSell: true,
            sellPrice: {
              gte: minVal,
              lte: maxVal
            }
          },
          {
            isRent: true,
            loanPrice: {
              gte: minVal,
              lte: maxVal
            }
          }
        ]
      });
    }
  }

  // Query database assets
  const dbAssets = await prisma.asset.findMany({
    where: whereConditions,
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
