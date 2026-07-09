"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProjectTemplatePlace {
  id?: number;
  placeName: string;
  distance?: string;
  travelTime?: string;
  sortOrder?: number;
}

export interface ProjectTemplateData {
  name: string;
  googleMap?: string;
  places?: ProjectTemplatePlace[];
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** ดึงทั้งหมดพร้อม places (สำหรับหน้า admin) */
export async function getAllProjectTemplatesAction() {
  try {
    const templates = await prisma.projectTemplate.findMany({
      include: {
        places: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, templates };
  } catch (error: any) {
    console.error("getAllProjectTemplatesAction error:", error);
    return { success: false, error: error.message, templates: [] };
  }
}

/** ดึงรายชื่อ + googleMap + places (สำหรับ dropdown auto-fill ในฟอร์ม) */
export async function getProjectTemplatesListAction() {
  try {
    const templates = await prisma.projectTemplate.findMany({
      select: {
        id: true,
        name: true,
        googleMap: true,
        places: {
          select: {
            id: true,
            placeName: true,
            distance: true,
            travelTime: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, templates };
  } catch (error: any) {
    console.error("getProjectTemplatesListAction error:", error);
    return { success: false, error: error.message, templates: [] };
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createProjectTemplateAction(data: ProjectTemplateData) {
  try {
    const template = await prisma.projectTemplate.create({
      data: {
        name: data.name.trim(),
        googleMap: data.googleMap || null,
        places: {
          create: (data.places || [])
            .filter((p) => p.placeName.trim())
            .map((p, idx) => ({
              placeName: p.placeName.trim(),
              distance: p.distance || null,
              travelTime: p.travelTime || null,
              sortOrder: p.sortOrder ?? idx,
            })),
        },
      },
      include: { places: true },
    });
    revalidatePath("/manage/projects");
    return { success: true, template };
  } catch (error: any) {
    console.error("createProjectTemplateAction error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "ชื่อโครงการนี้มีอยู่ในระบบแล้ว" };
    }
    return { success: false, error: error.message };
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateProjectTemplateAction(id: number, data: ProjectTemplateData) {
  try {
    // Delete existing places then recreate (simplest approach)
    await prisma.projectTemplatePlace.deleteMany({ where: { templateId: id } });

    const template = await prisma.projectTemplate.update({
      where: { id },
      data: {
        name: data.name.trim(),
        googleMap: data.googleMap || null,
        places: {
          create: (data.places || [])
            .filter((p) => p.placeName.trim())
            .map((p, idx) => ({
              placeName: p.placeName.trim(),
              distance: p.distance || null,
              travelTime: p.travelTime || null,
              sortOrder: p.sortOrder ?? idx,
            })),
        },
      },
      include: { places: true },
    });
    revalidatePath("/manage/projects");
    return { success: true, template };
  } catch (error: any) {
    console.error("updateProjectTemplateAction error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "ชื่อโครงการนี้มีอยู่ในระบบแล้ว" };
    }
    return { success: false, error: error.message };
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteProjectTemplateAction(id: number) {
  try {
    await prisma.projectTemplate.delete({ where: { id } });
    revalidatePath("/manage/projects");
    return { success: true };
  } catch (error: any) {
    console.error("deleteProjectTemplateAction error:", error);
    return { success: false, error: error.message };
  }
}
