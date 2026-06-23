"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
