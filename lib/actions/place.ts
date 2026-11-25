"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { parseLatLng, distanceKm, isShortMapsLink } from "@/lib/geo";

export interface PlaceInput {
  placeNameTH: string;
  placeNameEN?: string;
  location?: string;
  province?: string;
  postCode?: string;
  isActive?: boolean;
}

export interface PlaceOption {
  id: number;
  placeNameTH: string;
  placeNameEN: string | null;
  province: string | null;
}

/**
 * Short share links (maps.app.goo.gl/...) don't contain coordinates. Follow the
 * redirect and store "lat,lng" when we can find it; otherwise keep the original text.
 */
async function normalizeLocation(location: string | undefined): Promise<string | null> {
  const value = location?.trim();
  if (!value) return null;
  const parsed = parseLatLng(value);
  if (parsed) return /^-?\d/.test(value) ? `${parsed.lat},${parsed.lng}` : value;
  if (!isShortMapsLink(value)) return value;
  try {
    let url = value;
    for (let i = 0; i < 4; i++) {
      const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
      const next = res.headers.get("location");
      if (!next) break;
      const p = parseLatLng(next);
      if (p) return `${p.lat},${p.lng}`;
      url = new URL(next, url).toString();
    }
  } catch (error) {
    console.warn("normalizeLocation: could not resolve", value, error);
  }
  return value;
}

async function clean(data: PlaceInput) {
  return {
    placeNameTH: data.placeNameTH.trim(),
    placeNameEN: data.placeNameEN?.trim() || null,
    location: await normalizeLocation(data.location),
    province: data.province?.trim() || null,
    postCode: data.postCode?.trim() || null,
    isActive: data.isActive ?? true,
  };
}

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("กรุณาเข้าสู่ระบบ");
}

function errMsg(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** ทั้งหมด (หน้า admin) */
export async function getAllPlacesAction() {
  try {
    const places = await prisma.place.findMany({ orderBy: { id: "asc" } });
    return { success: true, places };
  } catch (error) {
    console.error("getAllPlacesAction error:", error);
    return { success: false, error: errMsg(error, "โหลดข้อมูลไม่สำเร็จ"), places: [] };
  }
}

/** ค้นหาสถานที่ที่เปิดใช้งาน (dropdown ในฟอร์ม) */
export async function searchPlacesAction(query: string): Promise<PlaceOption[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    return await prisma.place.findMany({
      where: {
        isActive: true,
        OR: [{ placeNameTH: { contains: q } }, { placeNameEN: { contains: q } }],
      },
      select: { id: true, placeNameTH: true, placeNameEN: true, province: true },
      orderBy: { placeNameTH: "asc" },
      take: 10,
    });
  } catch (error) {
    console.error("searchPlacesAction error:", error);
    return [];
  }
}

export interface NearbyPlace extends PlaceOption {
  distanceKm: number;
}

/** Active places with coordinates within `radiusKm` of a point, nearest first */
export async function findNearbyPlacesAction(
  lat: number,
  lng: number,
  radiusKm = 15,
  limit = 15
): Promise<{ places: NearbyPlace[]; withCoords: number }> {
  try {
    const places = await prisma.place.findMany({
      where: { isActive: true, location: { not: null } },
      select: { id: true, placeNameTH: true, placeNameEN: true, province: true, location: true },
    });
    const origin = { lat, lng };
    let withCoords = 0;
    const nearby = places
      .map((p) => {
        const pos = parseLatLng(p.location);
        if (!pos) return null;
        withCoords++;
        return {
          id: p.id,
          placeNameTH: p.placeNameTH,
          placeNameEN: p.placeNameEN,
          province: p.province,
          distanceKm: distanceKm(origin, pos),
        };
      })
      .filter((p): p is NearbyPlace => p !== null && p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
    return { places: nearby, withCoords };
  } catch (error) {
    console.error("findNearbyPlacesAction error:", error);
    return { places: [], withCoords: 0 };
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createPlaceAction(data: PlaceInput) {
  try {
    await requireSession();
    if (!data.placeNameTH?.trim()) return { success: false, error: "กรุณากรอกชื่อสถานที่ (ไทย)" };
    const place = await prisma.place.create({ data: await clean(data) });
    revalidatePath("/[lang]/manage/places", "page");
    return { success: true, place };
  } catch (error) {
    console.error("createPlaceAction error:", error);
    return { success: false, error: errMsg(error, "บันทึกไม่สำเร็จ") };
  }
}

export async function updatePlaceAction(id: number, data: PlaceInput) {
  try {
    await requireSession();
    if (!data.placeNameTH?.trim()) return { success: false, error: "กรุณากรอกชื่อสถานที่ (ไทย)" };
    const place = await prisma.place.update({ where: { id }, data: await clean(data) });
    revalidatePath("/[lang]/manage/places", "page");
    return { success: true, place };
  } catch (error) {
    console.error("updatePlaceAction error:", error);
    return { success: false, error: errMsg(error, "บันทึกไม่สำเร็จ") };
  }
}

export async function togglePlaceActiveAction(id: number, isActive: boolean) {
  try {
    await requireSession();
    const place = await prisma.place.update({ where: { id }, data: { isActive } });
    return { success: true, place };
  } catch (error) {
    console.error("togglePlaceActiveAction error:", error);
    return { success: false, error: errMsg(error, "เปลี่ยนสถานะไม่สำเร็จ") };
  }
}

export async function deletePlaceAction(id: number) {
  try {
    await requireSession();
    await prisma.place.delete({ where: { id } });
    revalidatePath("/[lang]/manage/places", "page");
    return { success: true };
  } catch (error) {
    console.error("deletePlaceAction error:", error);
    return { success: false, error: errMsg(error, "ลบไม่สำเร็จ") };
  }
}
