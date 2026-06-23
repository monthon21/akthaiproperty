"use server";

import { prisma } from "@/lib/prisma";
import { AssetType } from "@prisma/client";

export interface AssetImageInput {
  imageUrl: string;
  isFeature: boolean;
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
    images
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
      where: { code: finalCode }
    });
    if (existingAsset) {
      return { success: false, error: `รหัสทรัพย์ "${finalCode}" มีในระบบแล้ว กรุณาใช้รหัสอื่น` };
    }

    // Handle customer info (find or create)
    let customerId: number | null = null;
    if (ownerName && ownerName.trim()) {
      const oName = ownerName.trim();
      const oPhone = ownerPhone?.trim() || null;
      const oLine = ownerLine?.trim() || null;

      let existingCustomer = null;
      if (oPhone) {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            name: oName,
            phone: oPhone
          }
        });
      } else {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            name: oName
          }
        });
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        if (oLine && !existingCustomer.line) {
          await prisma.customer.update({
            where: { id: customerId },
            data: { line: oLine }
          });
        }
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: oName,
            phone: oPhone,
            line: oLine
          }
        });
        customerId = newCustomer.id;
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
        amenities: amenities && amenities.length > 0 ? JSON.stringify(amenities) : null,
        address,
        soi: soi || null,
        road: road || null,
        province,
        district,
        subdistrict,
        zipCode: zipCode || null,
        googleMap: googleMap || null,
        customerId: customerId,
        images: {
          create: images.map(img => ({
            imageUrl: img.imageUrl,
            isFeature: img.isFeature
          }))
        }
      }
    });

    return { success: true, id: asset.id };
  } catch (error: any) {
    console.error("Error creating asset:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างทรัพย์สิน" };
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
    images
  } = input;

  try {
    // Fetch current asset to check if price has changed
    const currentAsset = await prisma.asset.findUnique({
      where: { id }
    });

    if (!currentAsset) {
      return { success: false, error: "ไม่พบทรัพย์สินที่ต้องการแก้ไข" };
    }

    // Check code uniqueness excluding this asset
    const codeOwner = await prisma.asset.findUnique({
      where: { code }
    });
    if (codeOwner && codeOwner.id !== id) {
      return { success: false, error: `รหัสทรัพย์ "${code}" มีในระบบแล้ว กรุณาใช้รหัสอื่น` };
    }

    const currentSellPriceNum = currentAsset.sellPrice ? Number(currentAsset.sellPrice) : null;
    const currentLoanPriceNum = currentAsset.loanPrice ? Number(currentAsset.loanPrice) : null;
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
          loanPrice: currentAsset.loanPrice
        }
      });
    }

    // Handle customer info (find or create)
    let customerId: number | null = null;
    if (ownerName && ownerName.trim()) {
      const oName = ownerName.trim();
      const oPhone = ownerPhone?.trim() || null;
      const oLine = ownerLine?.trim() || null;

      let existingCustomer = null;
      if (oPhone) {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            name: oName,
            phone: oPhone
          }
        });
      } else {
        existingCustomer = await prisma.customer.findFirst({
          where: {
            name: oName
          }
        });
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        if (existingCustomer.line !== oLine || existingCustomer.phone !== oPhone) {
          await prisma.customer.update({
            where: { id: customerId },
            data: { 
              phone: oPhone || existingCustomer.phone,
              line: oLine || existingCustomer.line 
            }
          });
        }
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: oName,
            phone: oPhone,
            line: oLine
          }
        });
        customerId = newCustomer.id;
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
        amenities: amenities !== undefined ? (amenities && amenities.length > 0 ? JSON.stringify(amenities) : null) : undefined,
        address,
        soi: soi || null,
        road: road || null,
        province,
        district,
        subdistrict,
        zipCode: zipCode || null,
        googleMap: googleMap || null,
        customerId: customerId
      }
    });

    // Refresh images: delete existing and recreate
    await prisma.assetImage.deleteMany({
      where: { assetId: id }
    });

    if (images && images.length > 0) {
      await prisma.assetImage.createMany({
        data: images.map(img => ({
          assetId: id,
          imageUrl: img.imageUrl,
          isFeature: img.isFeature
        }))
      });
    }

    return { success: true, id };
  } catch (error: any) {
    console.error("Error updating asset:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการแก้ไขทรัพย์สิน" };
  }
}

// 3. Get Asset details
export async function getAssetAction(id: string) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        images: true,
        prices: {
          orderBy: { createdAt: "desc" }
        },
        customer: true
      }
    });

    if (!asset) {
      return { success: false, error: "ไม่พบข้อมูลทรัพย์สิน" };
    }

    return { success: true, asset };
  } catch (error: any) {
    console.error("Error getting asset:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" };
  }
}

// 4. Get next sequential 4-digit code starting from 1001
export async function getNextAssetCodeAction() {
  try {
    const assets = await prisma.asset.findMany({
      select: { code: true }
    });

    let maxCode = 1000;
    for (const asset of assets) {
      const codeNum = parseInt(asset.code, 10);
      if (!isNaN(codeNum) && codeNum > maxCode) {
        maxCode = codeNum;
      }
    }

    const nextCode = (maxCode + 1).toString();
    return { success: true, code: nextCode };
  } catch (error: any) {
    console.error("Error generating next asset code:", error);
    return { success: false, code: "1001" };
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
          take: 1
        },
        customer: true
      }
    });
    return { success: true, assets };
  } catch (error: any) {
    console.error("Error getting all assets:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" };
  }
}

// 6. Delete Asset
export async function deleteAssetAction(id: string) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return { success: false, error: "ไม่มีสิทธิ์ในการลบข้อมูล (เฉพาะ Admin เท่านั้น)" };
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สินที่ต้องการลบ" };
    }

    await prisma.asset.delete({
      where: { id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting asset:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

// 7. Toggle Asset Availability
export async function toggleAssetAvailabilityAction(id: string, isAvailable: boolean) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Explicitly use any to bypass TS error if prisma client generation failed
    await (prisma.asset as any).update({
      where: { id },
      data: { isAvailable }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling asset availability:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ" };
  }
}

// 8. Toggle Asset Recommendation (Home Page)
export async function toggleAssetRecommendationAction(id: string, isRecommended: boolean) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, error: "ไม่พบทรัพย์สิน" };
    }

    // Explicitly use any to bypass TS error if prisma client generation failed
    await (prisma.asset as any).update({
      where: { id },
      data: { isRecommended }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling asset recommendation:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะแนะนำ" };
  }
}

// 9. Search Autocomplete Suggestions
export async function searchAssetSuggestionsAction(query: string) {
  if (!query || query.length < 2) return { success: true, suggestions: [] };
  
  try {
    const assets = await prisma.asset.findMany({
      where: {
        isAvailable: true,
        OR: [
          { code: { contains: query } },
          { district: { contains: query } },
          { province: { contains: query } },
          { projectName: { contains: query } },
          { zipCode: { contains: query } },
          { title: { contains: query } },
          { titleEn: { contains: query } },
          { titleZh: { contains: query } }
        ]
      },
      take: 5,
      select: {
        id: true,
        code: true,
        title: true,
        projectName: true,
        district: true,
        province: true,
      }
    });
    
    return { success: true, suggestions: assets };
  } catch (error: any) {
    console.error("Error fetching search suggestions:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลค้นหา" };
  }
}

// 10. Search Customers for Owner autocomplete suggestions
export async function searchCustomersAction(query: string) {
  if (!query || query.length < 2) return { success: true, customers: [] };
  
  try {
    const customers = await prisma.customer.findMany({
      where: {
        name: { contains: query }
      },
      take: 10,
      select: {
        id: true,
        name: true,
        phone: true,
        line: true
      }
    });
    
    return { success: true, customers };
  } catch (error: any) {
    console.error("Error searching customers:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการค้นหาลูกค้า" };
  }
}

