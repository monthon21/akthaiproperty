import { featuredProperties, Property } from "@/lib/properties";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { prisma } from "@/lib/prisma";
import { parseAmenities, AMENITY_MAP } from "@/lib/amenities";

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
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
  const priceParts: string[] = [];
  if (isSell && asset.sellPrice) {
    priceParts.push(`${Number(asset.sellPrice).toLocaleString()}`);
  }
  if (isRent && asset.loanPrice) {
    priceParts.push(`${Number(asset.loanPrice).toLocaleString()} / เดือน`);
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
    projectName: asset.projectName || undefined,
    location: `${asset.address ? asset.address + " " : ""}${asset.soi ? "ซ." + asset.soi + " " : ""}${asset.road ? "ถ." + asset.road + " " : ""}${asset.subdistrict ? asset.subdistrict + ", " : ""}${asset.district ? asset.district + ", " : ""}${asset.province || ""}`,
    zipCode: asset.zipCode || undefined,
    price: priceStr,
    sellPrice: sellPriceStr,
    rentPrice: rentPriceStr,
    type: isRent ? "เช่า" : "ขาย",
    category,
    beds: asset.noBedroom || 0,
    baths: asset.noBathroom || 0,
    sqft,
    noFloor: asset.noFloor || undefined,
    maidRoom: asset.maidRoom || undefined,
    parkingLot: asset.parkingLot || undefined,
    facing: asset.facing || undefined,
    otherFeatures: asset.otherFeatures || undefined,
    googleMap: asset.googleMap || undefined,
    landSize: asset.landSize ? Number(asset.landSize) : undefined,
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
      name: "AK Thai Property Office",
      phone: "081-234-5678",
      email: "info@akthaiproperty.com",
      line: "@akproperty"
    }
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
    const dbAsset = await prisma.asset.findUnique({
      where: { id: resolvedParams.id },
      include: {
        images: true
      }
    });

    if (dbAsset) {
      property = mapAssetToProperty(dbAsset, resolvedParams.lang);
      
      const dbSimilar = await prisma.asset.findMany({
        where: { id: { not: dbAsset.id } },
        take: 3,
        include: { images: true }
      });
      
      similarProperties = dbSimilar.map(asset => mapAssetToProperty(asset, resolvedParams.lang));
      if (similarProperties.length < 3) {
        const needed = 3 - similarProperties.length;
        const staticFill = featuredProperties
          .filter((p) => p.id !== property?.id)
          .slice(0, needed);
        similarProperties = [...similarProperties, ...staticFill];
      }
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

