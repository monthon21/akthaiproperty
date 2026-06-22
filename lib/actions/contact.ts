"use server";

import { prisma } from "@/lib/prisma";

export interface ContactInput {
  fullname: string;
  phone: string;
  subject: string;
  message: string;
}

export async function submitContactAction(input: ContactInput) {
  const { fullname, phone, subject, message } = input;

  if (!fullname || !phone || !subject || !message) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง" };
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        fullname,
        phone,
        subject,
        message,
      },
    });

    return { success: true, id: contact.id };
  } catch (error: any) {
    console.error("Error creating contact entry:", error);
    return { 
      success: false, 
      error: error.message || "เกิดข้อผิดพลาดของระบบในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" 
    };
  }
}
