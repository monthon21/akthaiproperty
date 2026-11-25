"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isValidThaiNationalId } from "@/lib/format";

export async function updateUserAvatarAction(avatarUrl: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
    }

    // Get user ID from session. Handle both string/number types.
    const rawId = (session.user as any).id;
    if (!rawId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ใช้งานในระบบ" };
    }

    const userId = Number(rawId);
    if (isNaN(userId)) {
      return { success: false, error: "รหัสผู้ใช้ไม่ถูกต้อง" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    // Revalidate paths to refresh the profile display
    revalidatePath("/[lang]/myprofile", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user avatar:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกรูปโปรไฟล์" };
  }
}

// ── User management (admin only) ──────────────────────────────────────────────

const USER_ROLES = ["USER", "ADMIN", "LANDLORD", "AGENT", "MODERATOR"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string | number; role?: string } | undefined;
  if (user?.role !== "ADMIN") return null;
  return { id: Number(user.id) };
}

/** Every account, without passwords */
export async function getAllUsersAction() {
  if (!(await requireAdmin())) return { success: false as const, error: "เฉพาะผู้ดูแลระบบเท่านั้น", users: [] };
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        image: true,
        role: true,
        isBlocked: true,
        deletedAt: true,
        createdAt: true,
        profile: { select: { position: true, phone: true } },
      },
      orderBy: { id: "asc" },
    });
    return { success: true as const, users };
  } catch (error) {
    console.error("getAllUsersAction error:", error);
    return { success: false as const, error: "โหลดรายชื่อผู้ใช้ไม่สำเร็จ", users: [] };
  }
}

export async function updateUserRoleAction(userId: number, role: UserRoleValue) {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "เฉพาะผู้ดูแลระบบเท่านั้น" };
  if (!Number.isInteger(userId) || !USER_ROLES.includes(role)) return { success: false, error: "ข้อมูลไม่ถูกต้อง" };
  // changing your own role could lock you out of this page
  if (userId === admin.id) return { success: false, error: "ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตัวเองได้" };

  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/[lang]/manage/users", "page");
    return { success: true };
  } catch (error) {
    console.error("updateUserRoleAction error:", error);
    return { success: false, error: "บันทึกสิทธิ์ไม่สำเร็จ" };
  }
}

/** One account for the edit page, without the password */
export async function getUserAction(userId: number) {
  if (!(await requireAdmin())) return { success: false as const, error: "เฉพาะผู้ดูแลระบบเท่านั้น", user: null };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullname: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: { prefix: true, position: true, phone: true, lineId: true, nationalId: true, idCardCopyUrl: true, signatureUrl: true, address: true, subdistrict: true, district: true, province: true, postCode: true },
      },
    },
  });
  return { success: true as const, user };
}

export interface UserEditInput {
  fullname: string;
  username: string;
  email: string;
  role: UserRoleValue;
  /** leave empty to keep the current password */
  newPassword?: string;
  /** contact / ID details printed on documents (agents and above); omit to leave the profile untouched */
  profile?: UserDocProfileInput;
}

export interface UserDocProfileInput {
  prefix: string;
  position: string;
  phone: string;
  lineId: string;
  nationalId: string;
  /** uploaded copy of the ID card (image or PDF) */
  idCardCopyUrl: string;
  /** signature image printed on documents */
  signatureUrl: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postCode: string;
}

export async function updateUserAction(userId: number, input: UserEditInput) {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "เฉพาะผู้ดูแลระบบเท่านั้น" };

  const username = input.username.trim();
  const email = input.email.trim();
  const newPassword = input.newPassword ?? "";
  if (!Number.isInteger(userId) || !USER_ROLES.includes(input.role)) return { success: false, error: "ข้อมูลไม่ถูกต้อง" };
  if (!username) return { success: false, error: "กรุณากรอก username" };
  if (/\s/.test(username)) return { success: false, error: "username ห้ามมีช่องว่าง" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  if (newPassword && newPassword.length < 8) return { success: false, error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" };

  const text = (v?: string) => v?.trim() || null;
  const nationalId = input.profile?.nationalId.replace(/\D/g, "") || "";
  if (nationalId && !isValidThaiNationalId(nationalId)) return { success: false, error: "เลขบัตรประชาชนไม่ถูกต้อง (ตรวจสอบหลักสุดท้าย)" };
  // only these fields are touched — birth date and bank account stay as the user saved them
  const profileData = input.profile && {
    prefix: text(input.profile.prefix),
    position: text(input.profile.position),
    phone: text(input.profile.phone),
    lineId: text(input.profile.lineId),
    nationalId: nationalId || null,
    idCardCopyUrl: text(input.profile.idCardCopyUrl),
    signatureUrl: text(input.profile.signatureUrl),
    address: text(input.profile.address),
    subdistrict: text(input.profile.subdistrict),
    district: text(input.profile.district),
    province: text(input.profile.province),
    postCode: text(input.profile.postCode),
  };

  try {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!current) return { success: false, error: "ไม่พบผู้ใช้นี้" };
    if (userId === admin.id && input.role !== current.role) return { success: false, error: "ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตัวเองได้" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullname: input.fullname.trim() || null,
        username,
        email: email || null,
        role: input.role,
        // stored the same way as the login and reset-password flows read it
        ...(newPassword ? { password: newPassword } : {}),
        ...(profileData ? { profile: { upsert: { create: profileData, update: profileData } } } : {}),
      },
    });
    revalidatePath("/[lang]/manage/users", "page");
    return { success: true };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return { success: false, error: "username หรืออีเมลนี้มีผู้ใช้อื่นใช้อยู่แล้ว" };
    console.error("updateUserAction error:", error);
    return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ" };
  }
}


/** Shared guard for block / trash: admin only, never on your own account */
async function guardOtherUser(userId: number) {
  const admin = await requireAdmin();
  if (!admin) return "เฉพาะผู้ดูแลระบบเท่านั้น";
  if (!Number.isInteger(userId)) return "ข้อมูลไม่ถูกต้อง";
  if (userId === admin.id) return "ทำรายการนี้กับบัญชีตัวเองไม่ได้";
  return null;
}

/** Block / unblock: a blocked account cannot sign in */
export async function setUserBlockedAction(userId: number, blocked: boolean) {
  const denied = await guardOtherUser(userId);
  if (denied) return { success: false, error: denied };
  try {
    await prisma.user.update({ where: { id: userId }, data: { isBlocked: blocked } });
    revalidatePath("/[lang]/manage/users", "page");
    return { success: true };
  } catch (error) {
    console.error("setUserBlockedAction error:", error);
    return { success: false, error: "บันทึกไม่สำเร็จ" };
  }
}

/** Soft delete: the row stays (with its profile), the account can no longer sign in, and it can be restored */
export async function setUserTrashedAction(userId: number, trashed: boolean) {
  const denied = await guardOtherUser(userId);
  if (denied) return { success: false, error: denied };
  try {
    const deletedAt = trashed ? new Date() : null;
    await prisma.user.update({ where: { id: userId }, data: { deletedAt } });
    revalidatePath("/[lang]/manage/users", "page");
    return { success: true, deletedAt: deletedAt ? deletedAt.toISOString() : null };
  } catch (error) {
    console.error("setUserTrashedAction error:", error);
    return { success: false, error: "บันทึกไม่สำเร็จ" };
  }
}
