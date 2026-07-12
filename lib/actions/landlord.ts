"use server";

import { prisma } from "@/lib/prisma";

// Helper to check admin authorization
async function checkAdminSession() {
  const { auth } = await import("@/auth");
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { authorized: false, error: "ไม่มีสิทธิ์ในการเข้าถึงข้อมูล (เฉพาะ Admin เท่านั้น)" };
  }
  return { authorized: true };
}

// 1. Get all landlords
export async function getAllLandlordsAction() {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const landlords = await prisma.landlord.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        details: true,
        assets: {
          select: {
            id: true,
            code: true,
            title: true
          }
        },
        _count: {
          select: { assets: true }
        }
      }
    });
    return { success: true, landlords };
  } catch (error: any) {
    console.error("Error getting all landlords:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลเจ้าของทรัพย์" };
  }
}

// 2. Get details for a specific landlord
export async function getLandlordDetailsAction(landlordId: number) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const landlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
      include: {
        details: true,
        assets: {
          select: {
            id: true,
            code: true,
            title: true,
            sellPrice: true,
            loanPrice: true,
            isSell: true,
            isRent: true,
            type: true
          }
        }
      }
    });

    if (!landlord) {
      return { success: false, error: "ไม่พบข้อมูลเจ้าของทรัพย์สินนี้" };
    }

    const plainLandlord = {
      ...landlord,
      assets: landlord.assets.map((a: any) => ({
        ...a,
        sellPrice: a.sellPrice ? Number(a.sellPrice) : null,
        loanPrice: a.loanPrice ? Number(a.loanPrice) : null,
      }))
    };

    return { success: true, landlord: plainLandlord };
  } catch (error: any) {
    console.error("Error getting landlord details:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายละเอียด" };
  }
}

// 3. Update landlord details (upsert LandlordDetails & update Landlord basic info)
export async function updateLandlordDetailsAction(
  landlordId: number,
  input: {
    name: string;
    phone?: string;
    line?: string;
    fullname?: string;
    detailPhone?: string;
    idcard?: string;
    email?: string;
    detailLine?: string;
    address?: string;
  }
) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  const {
    name,
    phone,
    line,
    fullname,
    detailPhone,
    idcard,
    email,
    detailLine,
    address
  } = input;

  if (!name.trim()) {
    return { success: false, error: "กรุณาระบุชื่อเจ้าของทรัพย์สิน" };
  }

  try {
    // 1. Update basic Landlord record
    const updatedLandlord = await prisma.landlord.update({
      where: { id: landlordId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        line: line?.trim() || null
      }
    });

    // 2. Upsert LandlordDetails record
    const updatedDetails = await prisma.landlordDetails.upsert({
      where: { landlordId: landlordId },
      update: {
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      },
      create: {
        landlordId: landlordId,
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      }
    });

    return { success: true, landlord: updatedLandlord, details: updatedDetails };
  } catch (error: any) {
    console.error("Error updating landlord details:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

// 4. Create new landlord manually
export async function createLandlordAction(
  input: {
    name: string;
    phone?: string;
    line?: string;
    fullname?: string;
    detailPhone?: string;
    idcard?: string;
    email?: string;
    detailLine?: string;
    address?: string;
  }
) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  const {
    name,
    phone,
    line,
    fullname,
    detailPhone,
    idcard,
    email,
    detailLine,
    address
  } = input;

  if (!name.trim()) {
    return { success: false, error: "กรุณาระบุชื่อเจ้าของทรัพย์สิน" };
  }

  try {
    // 1. Create basic Landlord record
    const newLandlord = await prisma.landlord.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        line: line?.trim() || null
      }
    });

    // 2. Create LandlordDetails record
    const newDetails = await prisma.landlordDetails.create({
      data: {
        landlordId: newLandlord.id,
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      }
    });

    return { success: true, landlord: newLandlord, details: newDetails };
  } catch (error: any) {
    console.error("Error creating landlord:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
  }
}

// 5. Delete Landlord
export async function deleteLandlordAction(landlordId: number) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Will automatically cascade delete details because of:
    // landlord Landlord @relation(fields: [landlordId], references: [id], onDelete: Cascade)
    // Assets will have landlordId set to null because of:
    // landlord Landlord? @relation(fields: [landlordId], references: [id], onDelete: SetNull)
    await prisma.landlord.delete({
      where: { id: landlordId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting landlord:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
