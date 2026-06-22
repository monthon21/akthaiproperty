"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid username or password.";
    }
    throw error; // Re-throw NEXT_REDIRECT
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const fullname = formData.get("fullname") as string;

  if (!username || !password) {
    throw new Error("Missing username or password");
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  await prisma.user.create({
    data: {
      username,
      password,
      fullname,
    },
  });

  redirect("/login");
}

export async function verifyUserAction(username: string) {
  if (!username) {
    return { success: false, error: "กรุณากรอกชื่อผู้ใช้" };
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return { success: false, error: "ไม่พบชื่อผู้ใช้นี้ในระบบ" };
    }
    return { success: true, fullname: user.fullname || user.username };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้" };
  }
}

export async function resetPasswordAction(username: string, newPassword: string) {
  if (!username || !newPassword) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return { success: false, error: "ไม่พบชื่อผู้ใช้นี้ในระบบ" };
    }
    
    await prisma.user.update({
      where: { username },
      data: { password: newPassword }
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" };
  }
}

export async function getSessionAction() {
  const session = await auth();
  return { session };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(email: string) {
  if (!email) {
    return { success: false, error: "กรุณากรอกอีเมล" };
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return { success: false, error: "ไม่พบอีเมลนี้ในระบบ" };
    }

    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const { sendPasswordResetEmail } = await import("@/lib/mail");
    await sendPasswordResetEmail(email, token);

    return { success: true };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการขอรหัสผ่านใหม่" };
  }
}

export async function resetPasswordWithTokenAction(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { success: false, error: "ข้อมูลไม่ครบถ้วน" };
  }
  
  if (newPassword.length < 6) {
    return { success: false, error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง" };
    }

    if (resetToken.expires < new Date()) {
      return { success: false, error: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว" };
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { success: false, error: "ไม่พบผู้ใช้งานนี้ในระบบ" };
    }

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: newPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" };
  }
}
