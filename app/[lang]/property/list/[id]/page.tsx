import { featuredProperties, Property } from "@/lib/properties";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { prisma } from "@/lib/prisma";
import { parseAmenities, AMENITY_MAP } from "@/lib/amenities";
import { isIndustrialType, isCondoType, publicTypeSpecFields, parseSpecs, formatSpecs, RENT_TERM_FIELDS, SALE_TERM_FIELDS } from "@/lib/assetSpecs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, lang } = await params;

  // Try static properties first
  const propertyId = parseInt(id);
  if (!isNaN(propertyId)) {
    const staticProp = featuredProperties.find((p) => p.id === propertyId);
    if (staticProp) {
      const desc = staticProp.description
        ? staticProp.description.slice(0, 160)
        : "รายละเอียดอสังหาริมทรัพย์ที่ AK Thai Property";
      return {
        title: `${staticProp.title} | AK Thai Property`,
        description: desc,
        openGraph: {
          title: `${staticProp.title} | AK Thai Property`,
          description: desc,
          images: staticProp.image ? [staticProp.image] : [],
        },
      };
    }
  }

  // Try DB
  const asset = await prisma.asset.findFirst({
    where: { OR: [{ id }, { code: id }] },
    select: {
      title: true,
      titleEn: true,
      titleZh: true,
      description: true,
      descriptionEn: true,
      descriptionZh: true,
      images: { where: { isFeature: true }, take: 1, select: { imageUrl: true } },
    },
  });

  if (!asset) {
    return { title: "Property Not Found | AK Thai Property" };
  }

  const title =
    (lang === "en" && asset.titleEn) ? asset.titleEn :
    (lang === "zh" && asset.titleZh) ? asset.titleZh :
    asset.title;

  const rawDesc =
    (lang === "en" && asset.descriptionEn) ? asset.descriptionEn :
    (lang === "zh" && asset.descriptionZh) ? asset.descriptionZh :
    asset.description || "";

  const description = rawDesc.slice(0, 160) || "รายละเอียดอสังหาริมทรัพย์ที่ AK Thai Property";
  const ogImage = asset.images[0]?.imageUrl;

  return {
    title: `${title} | AK Thai Property`,
    description,
    openGraph: {
      title: `${title} | AK Thai Property`,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}


export async function generateStaticParams() {
  return featuredProperties.map((property) => ({
    id: property.id.toString(),
  }));
}

function mapAssetToProperty(asset: any, lang: string): Property {
  const isRent = asset.isRent;
  const isSell = asset.isSell;

  let priceStr = "ติดต่อสอบถาม";
  if (lang === "en") priceStr = "Contact Us";
  if (lang === "zh") priceStr = "联系我们";

  const priceParts: string[] = [];
  if (isSell && asset.sellPrice) {
    priceParts.push(`${Number(asset.sellPrice).toLocaleString()}`);
  }
  if (isRent && asset.loanPrice) {
    let monthSuffix = " / เดือน";
    if (lang === "en") monthSuffix = " / month";
    if (lang === "zh") monthSuffix = " / 月";
    priceParts.push(`${Number(asset.loanPrice).toLocaleString()}${monthSuffix}`);
  }
  if (priceParts.length > 0) priceStr = priceParts.join(" | ");

  const sellPriceStr = isSell && asset.sellPrice && Number(asset.sellPrice) > 0 ? `${Number(asset.sellPrice).toLocaleString()}` : null;
  const rentPriceStr = isRent && asset.loanPrice && Number(asset.loanPrice) > 0 ? `${Number(asset.loanPrice).toLocaleString()}` : null;

  // Determine category
  let category = "House";
  if (asset.type === "DETACHED_HOUSE") category = "House";
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
  else if (asset.type === "CONDO") category = "Condo";
  else if (asset.type === "OTHER") category = "Other";

  // Fallback default image
  const featureImage = asset.images.find((img: any) => img.isFeature)?.imageUrl
    || asset.images[0]?.imageUrl
    || "/house1.png";

  let galleryUrls: string[] = [];
  if (asset.images && asset.images.length > 0) {
    const featureImgObj = asset.images.find((img: any) => img.isFeature) || asset.images[0];
    galleryUrls.push(featureImgObj.imageUrl);
    asset.images.forEach((img: any) => {
      if (img.id !== featureImgObj.id) {
        galleryUrls.push(img.imageUrl);
      }
    });
  } else {
    galleryUrls.push(featureImage);
  }

  // Fallback size
  let sqft = asset.usableArea ? Number(asset.usableArea) : (asset.landSize ? Number(asset.landSize) : 120);
  if (!asset.usableArea && !asset.landSize) {
    if (asset.type === "LAND") sqft = 200;
    else if (asset.type === "APARTMENT" || asset.type === "CONDO" || asset.type === "OFFICE" || asset.type === "RETAIL") sqft = 50;
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
    projectName: asset.projectName || undefined,
    location: `${asset.road ? "ถ." + asset.road + " " : ""}${asset.subdistrict ? asset.subdistrict + ", " : ""}${asset.district ? asset.district + ", " : ""}${asset.province || ""}`,
    zipCode: asset.zipCode || undefined,
    price: priceStr,
    sellPrice: sellPriceStr,
    rentPrice: rentPriceStr,
    type: isSell && isRent
      ? (lang === "en" ? "Sell / Rent" : lang === "zh" ? "售 / 租" : "ขาย / เช่า")
      : isRent
        ? (lang === "en" ? "Rent" : lang === "zh" ? "租" : "เช่า")
        : (lang === "en" ? "Sell" : lang === "zh" ? "售" : "ขาย"),
    category,
    beds: isIndustrialType(asset.type) ? undefined : asset.noBedroom || 0,
    baths: isIndustrialType(asset.type) ? undefined : asset.noBathroom || 0,
    isIndustrial: isIndustrialType(asset.type),
    specs: isIndustrialType(asset.type) || isCondoType(asset.type) ? formatSpecs(parseSpecs(asset.specs), lang, publicTypeSpecFields(asset.type)) : undefined,
    rentTerms: isRent ? formatSpecs(parseSpecs(asset.specs), lang, RENT_TERM_FIELDS) : undefined,
    saleTerms: isSell ? formatSpecs(parseSpecs(asset.specs), lang, SALE_TERM_FIELDS) : undefined,
    sqft,
    noFloor: asset.noFloor || undefined,
    maidRoom: asset.maidRoom || undefined,
    parkingLot: asset.parkingLot || undefined,
    facing: asset.facing || undefined,
    otherFeatures: asset.otherFeatures || undefined,
    googleMap: asset.googleMap || undefined,
    landSize: asset.landSize ? Number(asset.landSize) : undefined,
    landParts: parseSpecs(asset.specs).landParts,
    usableArea: asset.usableArea ? Number(asset.usableArea) : undefined,
    image: featureImage,
    description: description,
    facilities: (() => {
      const keys = parseAmenities(asset.amenities);
      const translated = keys.map(key => {
        const item = AMENITY_MAP[key];
        if (!item) return key;
        if (lang === "en") return item.labelEn || item.label;
        if (lang === "zh") return item.labelZh || item.label;
        return item.label;
      });
      if (translated.length > 0) return translated;
      if (isIndustrialType(asset.type)) return [];

      // Fallback
      if (lang === "en") return ["24-Hour Security", "CCTV", "Private Parking", "Public Park"];
      if (lang === "zh") return ["24小时保安", "闭路电视", "私人停车场", "公园"];
      return [
        "ระบบรักษาความปลอดภัย 24 ชม.",
        "กล้อง CCTV ทั่วโครงการ",
        "ที่จอดรถส่วนตัว",
        "สวนสาธารณะ/พื้นที่สีเขียว"
      ];
    })(),
    gallery: galleryUrls,
    agent: {
      name: "AK Thai Property",
      phone: "+66 82-444-8989",
      email: "[EMAIL_ADDRESS]",
      line: "@akproperty"
    },
    nearbyPlaces: asset.assetPlaces ? asset.assetPlaces.map((p: any) => ({
      placeName: p.placeName,
      distance: p.distance || undefined,
      travelTime: p.travelTime || undefined
    })) : []
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const propertyId = parseInt(resolvedParams.id);

  let property: Property | null = null;
  let similarProperties: Property[] = [];

  if (!isNaN(propertyId)) {
    const staticProp = featuredProperties.find((p) => p.id === propertyId);
    if (staticProp) {
      property = staticProp;
      similarProperties = featuredProperties
        .filter((p) => p.id !== staticProp.id)
        .slice(0, 3);
    }
  }

  if (!property) {
    const dbAsset = await prisma.asset.findFirst({
      where: {
        OR: [
          { id: resolvedParams.id },
          { code: resolvedParams.id }
        ]
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc"
          }
        },
        assetPlaces: true
      }
    });

    if (dbAsset) {
      property = mapAssetToProperty(dbAsset, resolvedParams.lang);

      // Similar listings: published, still available, same kind of deal — ranked by how close they are
      // to this one (project, type, area, price, bedrooms). Up to 8, shown as a carousel.
      const candidates = await prisma.asset.findMany({
        where: {
          id: { not: dbAsset.id },
          isDraft: false,
          isAvailable: true,
          OR: [...(dbAsset.isSell ? [{ isSell: true }] : []), ...(dbAsset.isRent ? [{ isRent: true }] : [])],
        },
        orderBy: { createdAt: "desc" },
        take: 80,
        include: {
          images: {
            orderBy: {
              sortOrder: "asc"
            }
          }
        }
      });

      const within = (x: unknown, y: unknown, ratio: number) => {
        const m = Number(x);
        const n = Number(y);
        return m > 0 && n > 0 && Math.abs(m - n) / n <= ratio;
      };
      const same = (x?: string | null, y?: string | null) => Boolean(x && y && x.trim() === y.trim());
      const score = (c: (typeof candidates)[number]) =>
        (c.type === dbAsset.type ? 3 : 0) +
        (same(c.projectName, dbAsset.projectName) ? 3 : 0) +
        (same(c.district, dbAsset.district) ? 2 : 0) +
        (same(c.province, dbAsset.province) ? 1 : 0) +
        (dbAsset.isSell && c.isSell && within(c.sellPrice, dbAsset.sellPrice, 0.3) ? 2 : 0) +
        (dbAsset.isRent && c.isRent && within(c.loanPrice, dbAsset.loanPrice, 0.3) ? 2 : 0) +
        (c.noBedroom !== null && c.noBedroom === dbAsset.noBedroom ? 1 : 0);

      similarProperties = candidates
        .map((asset) => ({ asset, points: score(asset) }))
        .sort((x, y) => y.points - x.points) // stable: ties keep newest first
        .slice(0, 8)
        .map(({ asset }) => mapAssetToProperty(asset, resolvedParams.lang));
    }
  }

  if (!property) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <PropertyDetailClient property={property} similarProperties={similarProperties} />
      <Footer />
    </>
  );
}

