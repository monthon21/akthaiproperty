"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ChecklistData, ChecklistKind, parseChecklist } from "@/lib/checklist";

export interface SaveChecklistInput {
  /** existing checklist to update; omit to create the first one */
  id?: number;
  kind: ChecklistKind;
  inspectedAt?: string; // yyyy-mm-dd
  inspector?: string;
  occupant?: string;
  data: ChecklistData;
}

export async function saveChecklistAction(assetId: string, input: SaveChecklistInput) {
  const session = await auth();
  if (!session) return { success: false as const, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };

  // round-trip through the parser so only the known shape is stored
  const clean = parseChecklist(JSON.stringify(input.data));
  if (!clean) return { success: false as const, error: "ข้อมูล Check list ไม่ถูกต้อง" };

  const fields = {
    kind: input.kind === "move_out" ? "move_out" : "move_in",
    inspectedAt: input.inspectedAt && /^\d{4}-\d{2}-\d{2}$/.test(input.inspectedAt) ? new Date(`${input.inspectedAt}T00:00:00Z`) : null,
    inspector: input.inspector?.trim() || null,
    occupant: input.occupant?.trim() || null,
    data: JSON.stringify(clean),
  };

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId }, select: { id: true, code: true } });
    if (!asset) return { success: false as const, error: "ไม่พบทรัพย์สินนี้" };

    const saved = input.id
      ? await prisma.assetChecklist.update({ where: { id: input.id, assetId: asset.id }, data: fields })
      : await prisma.assetChecklist.create({ data: { assetId: asset.id, ...fields } });

    revalidatePath("/[lang]/edit/[id]/checklist", "page");
    return { success: true as const, id: saved.id };
  } catch (error) {
    console.error("saveChecklistAction error:", error);
    return { success: false as const, error: "บันทึก Check list ไม่สำเร็จ" };
  }
}
