"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isValidThaiNationalId } from "@/lib/format";

export interface AgentProfileInput {
  fullname: string; // stored on User
  position?: string;
  prefix?: string;
  fullnameEn?: string;
  nationalId?: string;
  idCardExpiry?: string; // yyyy-mm-dd
  birthDate?: string; // yyyy-mm-dd
  nationality?: string;
  phone?: string;
  lineId?: string;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postCode?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  signatureUrl?: string;
}

async function currentUserId(): Promise<number | null> {
  const session = await auth();
  const id = Number((session?.user as { id?: string } | undefined)?.id);
  return session && !isNaN(id) ? id : null;
}

const text = (v?: string) => v?.trim() || null;
const date = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00Z`) : null);

/** Save the signed-in user's own profile (never someone else's) */
export async function updateMyProfileAction(input: AgentProfileInput) {
  const userId = await currentUserId();
  if (!userId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };

  const nationalId = input.nationalId?.replace(/\D/g, "") || "";
  if (nationalId && !isValidThaiNationalId(nationalId)) {
    return { success: false, error: "เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบหลักสุดท้าย)" };
  }
  if (!input.fullname?.trim()) return { success: false, error: "กรุณากรอกชื่อ-นามสกุล" };

  const data = {
    position: text(input.position),
    prefix: text(input.prefix),
    fullnameEn: text(input.fullnameEn),
    nationalId: nationalId || null,
    idCardExpiry: date(input.idCardExpiry),
    birthDate: date(input.birthDate),
    nationality: text(input.nationality),
    phone: text(input.phone),
    lineId: text(input.lineId),
    address: text(input.address),
    subdistrict: text(input.subdistrict),
    district: text(input.district),
    province: text(input.province),
    postCode: text(input.postCode),
    bankName: text(input.bankName),
    bankAccountNo: input.bankAccountNo?.replace(/[^\d-]/g, "") || null,
    bankAccountName: text(input.bankAccountName),
    signatureUrl: text(input.signatureUrl),
  };

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { fullname: input.fullname.trim() } }),
      prisma.userProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data }),
    ]);
    revalidatePath("/[lang]/myprofile", "page");
    return { success: true };
  } catch (error) {
    console.error("updateMyProfileAction error:", error);
    return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ" };
  }
}
