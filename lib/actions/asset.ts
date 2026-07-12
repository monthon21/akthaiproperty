"use server";

import { prisma } from "@/lib/prisma";
import { AssetType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface AssetImageInput {
  imageUrl: string;
  isFeature: boolean;
}

export interface AssetPlaceInput {
  placeName: string;
  distance?: string;
  travelTime?: string;
}

export interface AssetInput {
  id?: string;
  code: string;
  projectName?: string;
  title: string;
  titleEn?: string;
  titleZh?: string;
  description?: string;
  descriptionEn?: string;
  descriptionZh?: string;
  isRent: boolean;
  isSell: boolean;
  isDraft?: boolean;
  type: AssetType;
  sellPrice?: number;
  loanPrice?: number;
  noBedroom?: number;
  noBathroom?: number;
  noFloor?: number;
  landSize?: number;
  usableArea?: number;
  maidRoom?: number;
  parkingLot?: number;
  facing?: string;
  otherFeatures?: string;
  amenities?: string[];
  address?: string;
  soi?: string;
  road?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  zipCode?: string;
  googleMap?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerLine?: string;
  images: AssetImageInput[];
  assetPlaces?: AssetPlaceInput[];
}

// 1. Create Asset
export async function createAssetAction(input: AssetInput) {
  const {
    id,
    code,
    projectName,
    title,
    titleEn,
    titleZh,
    description,
    descriptionEn,
    descriptionZh,
    isRent,
    isSell,
    isDraft,
    type,
    sellPrice,
    loanPrice,
    noBedroom,
    noBathroom,
    noFloor,
    landSize,
    usableArea,
    maidRoom,
    parkingLot,
    facing,
    otherFeatures,
    amenities,
    address,
    soi,
    road,
    province,
    district,
    subdistrict,
    zipCode,
    googleMap,
    ownerName,
    ownerPhone,
    ownerLine,
    images,
    assetPlaces,
  } = input;

  if (!title || !type) {
    return { success: false, error: "กรุณาระบุชื่อทรัพย์ และประเภททรัพย์สิน" };
  }

  try {
    let finalCode = code?.trim();
    if (!finalCode) {
      const nextCodeRes = await getNextAssetCodeAction();
      finalCode = nextCodeRes.code;
    }

    // Check if code is unique
    const existingAsset = await prisma.asset.findUnique({
      where: { code: finalCode },
    });
    if (existingAsset) {
      return {
        success: false,
        error: `รหัสทรัพย์ "${finalCode}" มีในระบบแล้ว กรุณาใช้รหัสอื่น`,
      };
    }

    // Handle landlord info (find or create)
    let landlordId: number | null = null;
    if (ownerName && ownerName.trim()) {
      const oName = ownerName.trim();
      const oPhone = ownerPhone?.trim() || null;
      const oLine = ownerLine?.trim() || null;

      let existingLandlord = null;
      if (oPhone) {
        existingLandlord = await prisma.landlord.findFirst({
          where: {
            name: oName,
            phone: oPhone,
          },
        });
      } else {
        existingLandlord = await prisma.landlord.findFirst({
          where: {
            name: oName,
          },
        });
      }

      if (existingLandlord) {
        landlordId = existingLandlord.id;
        if (oLine && !existingLandlord.line) {
          await prisma.landlord.update({
            where: { id: landlordId },
            data: { line: oLine },
          });
        }
      } else {
        const newLandlord = await prisma.landlord.create({
          data: {
            name: oName,
            phone: oPhone,
            line: oLine,
          },
        });
        landlordId = newLandlord.id;
      }
    }

    const asset = await prisma.asset.create({
      data: {
        id: id || undefined,
        code: finalCode,
        projectName: projectName || null,
        title,
        titleEn: titleEn || null,
        titleZh: titleZh || null,
        description,
        descriptionEn: descriptionEn || null,
        descriptionZh: descriptionZh || null,
        isRent,
        isSell,
        isDraft: isDraft || false,
        type,
        sellPrice: sellPrice ? Number(sellPrice) : null,
        loanPrice: loanPrice ? Number(loanPrice) : null,
        noBedroom: noBedroom ? Number(noBedroom) : null,
        noBathroom: noBathroom ? Number(noBathroom) : null,
        noFloor: noFloor ? Number(noFloor) : null,
        landSize: landSize ? Number(landSize) : null,
        usableArea: usableArea ? Number(usableArea) : null,
        maidRoom: maidRoom ? Number(maidRoom) : null,
        parkingLot: parkingLot ? Number(parkingLot) : null,
        facing: facing || null,
        otherFeatures: otherFeatures || null,
        amenities:
          amenities && amenities.length > 0 ? JSON.stringify(amenities) : null,
        address,
        soi: soi || null,
        road: road || null,
        province,
        district,
        subdistrict,
        zipCode: zipCode || null,
        googleMap: googleMap || null,
        landlordId: landlordId,
        images: {
          create: images.map((img, idx) => ({
            imageUrl: img.imageUrl,
            isFeature: img.isFeature,
            sortOrder: idx,
          })),
        },
        assetPlaces:
          assetPlaces && assetPlaces.length > 0
            ? {
                create: assetPlaces.map((place) => ({
                  placeName: place.placeName,
                  distance: place.distance || null,
                  travelTime: place.travelTime || null,
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, id: asset.id, code: asset.code };
  } catch (error: any) {
    console.error("Error creating asset:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการสร้างทรัพย์สิน",
    };
  }
}

// 2. Update Asset (with automatic price history logging)
export async function updateAssetAction(id: string, input: AssetInput) {
  const {
    code,
    projectName,
    title,
    titleEn,
    titleZh,
    description,
    descriptionEn,
    descriptionZh,
    isRent,
    isSell,
    isDraft,
    type,
    sellPrice,
    loanPrice,
    noBedroom,
    noBathroom,
    noFloor,
    landSize,
    usableArea,
    maidRoom,
    parkingLot,
    facing,
    otherFeatures,
    amenities,
    address,
    soi,
    road,
    province,
    district,
    subdistrict,
    zipCode,
    googleMap,
    ownerName,
    ownerPhone,
    ownerLine,
    images,
    assetPlaces,
  } = input;

  try {
    require("fs").writeFileSync(
      "scratch/debug_input_images.json",
      JSON.stringify(images || [], null, 2),
    );
  } catch (e) {}

  try {
    // Fetch current asset to check if price has changed
    const currentAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!currentAsset) {
      return { success: false, error: "ไม่พบทรัพย์สินที่ต้องการแก้ไข" };
    }

    // Check code uniqueness excluding this asset
    const codeOwner = await prisma.asset.findUnique({
      where: { code },
    });
    if (codeOwner && codeOwner.id !== id) {
      return {
        success: false,
        error: `รหัสทรัพย์ "${code}" มีในระบบแล้ว กรุณาใช้รหัสอื่น`,
      };
    }

    const currentSellPriceNum = currentAsset.sellPrice
      ? Number(currentAsset.sellPrice)
      : null;
    const currentLoanPriceNum = currentAsset.loanPrice
      ? Number(currentAsset.loanPrice)
      : null;
    const newSellPriceNum = sellPrice ? Number(sellPrice) : null;
    const newLoanPriceNum = loanPrice ? Number(loanPrice) : null;

    // Log old prices to AssetPrice history if they changed
    const hasPriceChanged =
      currentSellPriceNum !== newSellPriceNum ||
      currentLoanPriceNum !== newLoanPriceNum;

    if (hasPriceChanged) {
      await prisma.assetPrice.create({
        data: {
          assetId: id,
          sellPrice: currentAsset.sellPrice,
          loanPrice: currentAsset.loanPrice,
        },
      });
    }

    // Handle landlord info (find or create)
    let landlordId: number | null = null;
    if (ownerName && ownerName.trim()) {
      const oName = ownerName.trim();
      const oPhone = ownerPhone?.trim() || null;
      const oLine = ownerLine?.trim() || null;

      let existingLandlord = null;
      if (oPhone) {
        existingLandlord = await prisma.landlord.findFirst({
          where: {
            name: oName,
            phone: oPhone,
          },
        });
      } else {
        existingLandlord = await prisma.landlord.findFirst({
          where: {
            name: oName,
          },
        });
      }

      if (existingLandlord) {
        landlordId = existingLandlord.id;
        if (
          existingLandlord.line !== oLine ||
          existingLandlord.phone !== oPhone
        ) {
          await prisma.landlord.update({
            where: { id: landlordId },
            data: {
              phone: oPhone || existingLandlord.phone,
              line: oLine || existingLandlord.line,
            },
          });
        }
      } else {
        const newLandlord = await prisma.landlord.create({
          data: {
            name: oName,
            phone: oPhone,
            line: oLine,
          },
        });
        landlordId = newLandlord.id;
      }
    }

    // Update asset info
    await prisma.asset.update({
      where: { id },
      data: {
        code,
        projectName: projectName || null,
        title,
        titleEn: titleEn || null,
        titleZh: titleZh || null,
        description,
        descriptionEn: descriptionEn || null,
        descriptionZh: descriptionZh || null,
        isRent,
        isSell,
        isDraft: isDraft || false,
        type,
        sellPrice: newSellPriceNum,
        loanPrice: newLoanPriceNum,
        noBedroom: noBedroom ? Number(noBedroom) : null,
        noBathroom: noBathroom ? Number(noBathroom) : null,
        noFloor: noFloor ? Number(noFloor) : null,
        landSize: landSize ? Number(landSize) : null,
        usableArea: usableArea ? Number(usableArea) : null,
        maidRoom: maidRoom ? Number(maidRoom) : null,
        parkingLot: parkingLot ? Number(parkingLot) : null,
        facing: facing || null,
        otherFeatures: otherFeatures || null,
        amenities:
          amenities !== undefined
            ? amenities && amenities.length > 0
              ? JSON.stringify(amenities)
              : null
            : undefined,
        address,
        soi: soi || null,
        road: road || null,
        province,
        district,
        subdistrict,
        zipCode: zipCode || null,
        googleMap: googleMap || null,
        landlordId: landlordId,
      },
    });

    // Refresh images: delete existing and recreate
    await prisma.assetImage.deleteMany({
      where: { assetId: id },
    });

    if (images && images.length > 0) {
      await prisma.assetImage.createMany({
        data: images.map((img, idx) => ({
          assetId: id,
          imageUrl: img.imageUrl,
          isFeature: img.isFeature,
          sortOrder: idx,
        })),
      });
    }

    // Refresh assetPlaces: delete existing and recreate
    await prisma.assetPlaces.deleteMany({
      where: { assetId: id },
    });

    if (assetPlaces && assetPlaces.length > 0) {
      await prisma.assetPlaces.createMany({
        data: assetPlaces.map((place) => ({
          assetId: id,
          placeName: place.placeName,
          distance: place.distance || null,
          travelTime: place.travelTime || null,
        })),
      });
    }

    revalidatePath("/", "layout");
    return { success: true, id, code: input.code };
  } catch (error: any) {
    console.error("Error updating asset:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการแก้ไขทรัพย์สิน",
    };
  }
}

// 3. Get Asset details
export async function getAssetAction(id: string) {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        assetPlaces: true,
        prices: {
          orderBy: { createdAt: "desc" },
        },
        landlord: true,
      },
    });

    if (!asset) {
      return { success: false, error: "ไม่พบข้อมูลทรัพย์สิน" };
    }

    const plainAsset = {
      ...asset,
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      loanPrice: asset.loanPrice ? Number(asset.loanPrice) : null,
      landSize: asset.landSize ? Number(asset.landSize) : null,
      usableArea: asset.usableArea ? Number(asset.usableArea) : null,
      prices: asset.prices.map((p: any) => ({
        ...p,
        sellPrice: p.sellPrice ? Number(p.sellPrice) : null,
        loanPrice: p.loanPrice ? Number(p.loanPrice) : null,
      }))
    };

    return { success: true, asset: plainAsset };
  } catch (error: any) {
    console.error("Error getting asset:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}

export async function getNextAssetCodeAction() {
  try {
    const currentYear = new Date().getFullYear();
    const yy = currentYear.toString().slice(-2);

    const assets = await prisma.asset.findMany({
      where: {
        code: {
          startsWith: yy,
        },
      },
      select: { code: true },
    });

    let maxSequence = 0;
    for (const asset of assets) {
      if (asset.code.length === 5) {
        const sequenceStr = asset.code.substring(2);
        const sequenceNum = parseInt(sequenceStr, 10);
        if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
          maxSequence = sequenceNum;
        }
      }
    }

    const nextSequence = maxSequence + 1;
    const nextCode = `${yy}${nextSequence.toString().padStart(3, "0")}`;

    return { success: true, code: nextCode };
  } catch (error: any) {
    console.error("Error generating next asset code:", error);
    const yy = new Date().getFullYear().toString().slice(-2);
    return { success: false, code: `${yy}001` };
  }
}

// 5. Get all assets for Admin Management
export async function getAllAssetsAction() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isFeature: true },
          take: 1,
        },
        landlord: true,
      },
    });
    const plainAssets = assets.map((a: any) => ({
      ...a,
      sellPrice: a.sellPrice ? Number(a.sellPrice) : null,
      loanPrice: a.loanPrice ? Number(a.loanPrice) : null,
      landSize: a.landSize ? Number(a.landSize) : null,
      usableArea: a.usableArea ? Number(a.usableArea) : null,
    }));
    return { success: true, assets: plainAssets };
  } catch (error: any) {
    console.error("Error getting all assets:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
    };
  }
}

// 6. Delete Asset
export async function deleteAssetAction(id: string) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ในการลบข้อมูล (เฉพาะ Admin เท่านั้น)",
      };
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สินที่ต้องการลบ" };
    }

    await prisma.asset.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting asset:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
    };
  }
}

// 7. Toggle Asset Availability
export async function toggleAssetAvailabilityAction(
  id: string,
  isAvailable: boolean,
) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Explicitly use any to bypass TS error if prisma client generation failed
    await (prisma.asset as any).update({
      where: { id },
      data: { isAvailable },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling asset availability:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ",
    };
  }
}

// 8. Toggle Asset Recommendation (Home Page)
export async function toggleAssetRecommendationAction(
  id: string,
  isRecommended: boolean,
) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Explicitly use any to bypass TS error if prisma client generation failed
    await (prisma.asset as any).update({
      where: { id },
      data: { isRecommended },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling asset recommendation:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะแนะนำ",
    };
  }
}

// 9. Search Autocomplete Suggestions
export async function searchAssetSuggestionsAction(query: string) {
  if (!query || query.length < 2) return { success: true, suggestions: [] };

  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const canSearchOwner = userRole === "ADMIN" || userRole === "USER";
    console.log("[searchAssetSuggestionsAction Debug] query:", query, "session user:", session?.user, "userRole:", userRole, "canSearchOwner:", canSearchOwner);

    const orConditions: any[] = [
      { code: { contains: query } },
      { address: { contains: query } },
      { district: { contains: query } },
      { province: { contains: query } },
      { projectName: { contains: query } },
      { zipCode: { contains: query } },
      { title: { contains: query } },
      { titleEn: { contains: query } },
      { titleZh: { contains: query } },
    ];

    if (canSearchOwner) {
      orConditions.push(
        {
          landlord: {
            name: { contains: query }
          }
        },
        {
          landlord: {
            details: {
              fullname: { contains: query }
            }
          }
        }
      );
    }

    const assets = await prisma.asset.findMany({
      where: {
        isAvailable: true,
        OR: orConditions,
      },
      take: 5,
      select: {
        id: true,
        code: true,
        title: true,
        projectName: true,
        address: true,
        district: true,
        province: true,
        landlord: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, suggestions: assets };
  } catch (error: any) {
    console.error("Error fetching search suggestions:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลค้นหา" };
  }
}

// 10. Search Landlords for Owner autocomplete suggestions
export async function searchLandlordsAction(query: string) {
  if (!query || query.length < 2) return { success: true, landlords: [] };

  try {
    const landlords = await prisma.landlord.findMany({
      where: {
        name: { contains: query },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        phone: true,
        line: true,
      },
    });

    return { success: true, landlords };
  } catch (error: any) {
    console.error("Error searching landlords:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการค้นหาลูกค้า",
    };
  }
}
