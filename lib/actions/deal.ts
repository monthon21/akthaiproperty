"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface DealRow {
  id: string;
  kind: "sale" | "rent";
  assetCode: string;
  assetTitle: string | null;
  customerName: string | null;
  customerPhone: string | null;
  price: number | null;
  commission: number | null;
  closedAt: string; // yyyy-mm-dd
  note: string | null;
}

export interface DealInput {
  kind: "sale" | "rent";
  assetCode: string;
  customerName?: string;
  customerPhone?: string;
  price?: string;
  commission?: string;
  closedAt: string; // yyyy-mm-dd
  note?: string;
}

async function isAdmin() {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN";
}

const amount = (v?: string) => {
  const n = Number((v ?? "").replace(/,/g, ""));
  return v && isFinite(n) && n >= 0 ? n : null;
};

type DbDeal = Awaited<ReturnType<typeof prisma.deal.findFirstOrThrow>>;
const toRow = (d: DbDeal): DealRow => ({
  id: d.id,
  kind: d.kind === "rent" ? "rent" : "sale",
  assetCode: d.assetCode,
  assetTitle: d.assetTitle,
  customerName: d.customerName,
  customerPhone: d.customerPhone,
  price: d.price === null ? null : Number(d.price),
  commission: d.commission === null ? null : Number(d.commission),
  closedAt: d.closedAt.toISOString().slice(0, 10),
  note: d.note,
});

/** Closed deals of one agent, newest first. `ready: false` = the Deal table isn't in the database yet. */
export async function getDealsByAgentAction(agentId: number): Promise<{ ready: boolean; deals: DealRow[] }> {
  if (!(await isAdmin())) return { ready: true, deals: [] };
  try {
    const deals = await prisma.deal.findMany({ where: { agentId }, orderBy: [{ closedAt: "desc" }, { createdAt: "desc" }] });
    return { ready: true, deals: deals.map(toRow) };
  } catch (error) {
    console.error("getDealsByAgentAction error:", error);
    return { ready: false, deals: [] };
  }
}

export async function createDealAction(agentId: number, input: DealInput) {
  if (!(await isAdmin())) return { success: false as const, error: "เฉพาะผู้ดูแลระบบเท่านั้น" };
  const code = input.assetCode.trim();
  if (!code) return { success: false as const, error: "กรุณากรอกรหัสทรัพย์" };
  if (input.kind !== "sale" && input.kind !== "rent") return { success: false as const, error: "ข้อมูลไม่ถูกต้อง" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.closedAt)) return { success: false as const, error: "กรุณาระบุวันที่ปิดดีล" };

  try {
    const [asset, agent] = await Promise.all([
      prisma.asset.findUnique({ where: { code }, select: { id: true, code: true, title: true } }),
      prisma.user.findUnique({ where: { id: agentId }, select: { id: true } }),
    ]);
    if (!asset) return { success: false as const, error: `ไม่พบทรัพย์รหัส ${code}` };
    if (!agent) return { success: false as const, error: "ไม่พบผู้ใช้นี้" };

    const deal = await prisma.deal.create({
      data: {
        kind: input.kind,
        assetId: asset.id,
        assetCode: asset.code,
        assetTitle: asset.title,
        agentId,
        customerName: input.customerName?.trim() || null,
        customerPhone: input.customerPhone?.trim() || null,
        price: amount(input.price),
        commission: amount(input.commission),
        closedAt: new Date(`${input.closedAt}T00:00:00Z`),
        note: input.note?.trim() || null,
      },
    });
    revalidatePath("/[lang]/manage/users/edit/[id]", "page");
    return { success: true as const, deal: toRow(deal) };
  } catch (error) {
    console.error("createDealAction error:", error);
    return { success: false as const, error: "บันทึกดีลไม่สำเร็จ" };
  }
}

export async function deleteDealAction(dealId: string) {
  if (!(await isAdmin())) return { success: false, error: "เฉพาะผู้ดูแลระบบเท่านั้น" };
  try {
    await prisma.deal.delete({ where: { id: dealId } });
    revalidatePath("/[lang]/manage/users/edit/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("deleteDealAction error:", error);
    return { success: false, error: "ลบรายการไม่สำเร็จ" };
  }
}
