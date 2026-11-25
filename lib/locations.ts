import { prisma } from "@/lib/prisma";

export interface LocationSummary {
  province: string;
  district: string;
  count: number;
  image: string | null;
  href: string; // path without the /[lang] prefix
}

export function locationPath(province: string, district: string) {
  return `/location/${encodeURIComponent(province)}/${encodeURIComponent(district)}`;
}

/** Route params may arrive URL-encoded (Thai text); decode safely. */
export function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Areas (province + district) that currently have available listings,
 * most listings first. Built from real data, so new areas appear automatically.
 */
export async function getLocations(limit?: number): Promise<LocationSummary[]> {
  const groups = await prisma.asset.groupBy({
    by: ["province", "district"],
    where: {
      isAvailable: true,
      province: { not: null },
      district: { not: null },
    },
    _count: { _all: true },
  });

  const rows = groups
    .filter((g) => g.province?.trim() && g.district?.trim())
    .map((g) => ({
      province: g.province!.trim(),
      district: g.district!.trim(),
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count || a.district.localeCompare(b.district, "th"));

  const selected = typeof limit === "number" ? rows.slice(0, limit) : rows;

  // One cover photo per area: the feature image of its newest listing.
  return Promise.all(
    selected.map(async (row) => {
      const asset = await prisma.asset.findFirst({
        where: { isAvailable: true, province: row.province, district: row.district },
        orderBy: { createdAt: "desc" },
        select: { images: { select: { imageUrl: true, isFeature: true } } },
      });
      const image =
        asset?.images.find((img) => img.isFeature)?.imageUrl || asset?.images[0]?.imageUrl || null;
      return { ...row, image, href: locationPath(row.province, row.district) };
    })
  );
}

export const LOCATION_TEXT = {
  th: {
    sectionSubtitle: "POPULAR LOCATIONS",
    sectionTitle1: "ทำเล",
    sectionTitle2: "ยอดนิยม",
    viewAll: "ดูทำเลทั้งหมด →",
    listings: "รายการ",
    indexTitle: "ค้นหาบ้านตามทำเล",
    indexDesc: "เลือกทำเลที่สนใจ ดูบ้าน ทาวน์เฮาส์ ที่ดิน ขายและให้เช่า ที่ AK Thai Property คัดมาให้ในแต่ละพื้นที่",
    noLocations: "ยังไม่มีข้อมูลทำเลในขณะนี้",
    allDeals: "ทั้งหมด",
    sell: "ขาย",
    rent: "เช่า",
    breadcrumbHome: "หน้าแรก",
    breadcrumbLocations: "ทำเล",
    pageTitle: (d: string, p: string) => `บ้าน ขาย-เช่า ย่าน${d} ${p}`,
    pageDesc: (d: string, p: string, n: number) =>
      `รวม ${n} รายการ บ้านเดี่ยว ทาวน์เฮาส์ ที่ดิน ขายและให้เช่า ย่าน${d} ${p} คัดสรรโดย AK Thai Property ติดต่อดูบ้านได้ทันที`,
    contactCta: "หาบ้านในย่านนี้ไม่เจอ? ทักไลน์ให้ทีมงานหาให้",
  },
  en: {
    sectionSubtitle: "POPULAR LOCATIONS",
    sectionTitle1: "Popular",
    sectionTitle2: "Locations",
    viewAll: "View all locations →",
    listings: "listings",
    indexTitle: "Find a home by location",
    indexDesc: "Pick an area to browse houses, townhouses and land for sale or rent, curated by AK Thai Property.",
    noLocations: "No locations available yet",
    allDeals: "All",
    sell: "Sale",
    rent: "Rent",
    breadcrumbHome: "Home",
    breadcrumbLocations: "Locations",
    pageTitle: (d: string, p: string) => `Houses for sale & rent in ${d}, ${p}`,
    pageDesc: (d: string, p: string, n: number) =>
      `${n} houses, townhouses and land for sale or rent in ${d}, ${p}, curated by AK Thai Property. Book a viewing today.`,
    contactCta: "Can't find the right home here? Message us on LINE and we'll find it for you",
  },
  zh: {
    sectionSubtitle: "POPULAR LOCATIONS",
    sectionTitle1: "热门",
    sectionTitle2: "地段",
    viewAll: "查看所有地段 →",
    listings: "套房源",
    indexTitle: "按地段找房",
    indexDesc: "选择您感兴趣的地段，浏览 AK Thai Property 精选的出售和出租的别墅、联排别墅和土地。",
    noLocations: "暂无地段信息",
    allDeals: "全部",
    sell: "出售",
    rent: "出租",
    breadcrumbHome: "首页",
    breadcrumbLocations: "地段",
    pageTitle: (d: string, p: string) => `${p}${d} 房屋出售与出租`,
    pageDesc: (d: string, p: string, n: number) =>
      `${p}${d} 共 ${n} 套出售和出租的别墅、联排别墅和土地，由 AK Thai Property 精选。欢迎预约看房。`,
    contactCta: "没有找到合适的房子？通过 LINE 联系我们，我们帮您找",
  },
};

export type LocationLang = keyof typeof LOCATION_TEXT;

export function locationText(lang: string) {
  return LOCATION_TEXT[(lang in LOCATION_TEXT ? lang : "th") as LocationLang];
}
