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

// 1. Get all customers
export async function getAllCustomersAction() {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        details: true,
        _count: {
          select: { assets: true }
        }
      }
    });
    return { success: true, customers };
  } catch (error: any) {
    console.error("Error getting all customers:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลเจ้าของทรัพย์" };
  }
}

// 2. Get details for a specific customer
export async function getCustomerDetailsAction(customerId: number) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
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

    if (!customer) {
      return { success: false, error: "ไม่พบข้อมูลเจ้าของทรัพย์สินนี้" };
    }

    return { success: true, customer };
  } catch (error: any) {
    console.error("Error getting customer details:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายละเอียด" };
  }
}

// 3. Update customer details (upsert CustomerDetails & update Customer basic info)
export async function updateCustomerDetailsAction(
  customerId: number,
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
    // 1. Update basic Customer record
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        line: line?.trim() || null
      }
    });

    // 2. Upsert CustomerDetails record
    const updatedDetails = await prisma.customerDetails.upsert({
      where: { customerId: customerId },
      update: {
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      },
      create: {
        customerId: customerId,
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      }
    });

    return { success: true, customer: updatedCustomer, details: updatedDetails };
  } catch (error: any) {
    console.error("Error updating customer details:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

// 4. Create new customer manually
export async function createCustomerAction(
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
    // 1. Create basic Customer record
    const newCustomer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        line: line?.trim() || null
      }
    });

    // 2. Create CustomerDetails record
    const newDetails = await prisma.customerDetails.create({
      data: {
        customerId: newCustomer.id,
        fullname: fullname?.trim() || name.trim(),
        phone: detailPhone?.trim() || phone?.trim() || null,
        idcard: idcard?.trim() || null,
        email: email?.trim() || null,
        line: detailLine?.trim() || line?.trim() || null,
        address: address?.trim() || null
      }
    });

    return { success: true, customer: newCustomer, details: newDetails };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
  }
}

// 5. Delete Customer
export async function deleteCustomerAction(customerId: number) {
  const authCheck = await checkAdminSession();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Will automatically cascade delete details because of:
    // customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
    // Assets will have customerId set to null because of:
    // customer Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
    await prisma.customer.delete({
      where: { id: customerId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
