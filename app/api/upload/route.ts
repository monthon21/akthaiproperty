import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assetId = formData.get("assetId") as string | null;
    const type = formData.get("type") as string | null; // "image" | "avatar" | "document"

    if (!file) {
      return NextResponse.json({ success: false, error: "ไม่พบไฟล์ที่อัพโหลด" }, { status: 400 });
    }

    const isDoc = type === "document";
    const allowedTypes = isDoc ? ALLOWED_DOC_MIME_TYPES : ALLOWED_MIME_TYPES;
    const maxSize = isDoc ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = isDoc
        ? "ประเภทเอกสารไม่ถูกต้อง รองรับ PDF, DOC, DOCX เท่านั้น"
        : "ประเภทรูปภาพไม่ถูกต้อง รองรับ JPG, PNG, WEBP, GIF เท่านั้น";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    if (file.size > maxSize) {
      const errorMsg = isDoc
        ? `ขนาดเอกสารต้องไม่เกิน ${maxSize / (1024 * 1024)} MB`
        : `ขนาดรูปภาพต้องไม่เกิน ${maxSize / (1024 * 1024)} MB`;
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get proper file extension
    let ext = "bin";
    if (file.type === "application/pdf") {
      ext = "pdf";
    } else if (file.type === "application/msword") {
      ext = "doc";
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      ext = "docx";
    } else if (file.type.startsWith("image/")) {
      ext = file.type.split("/")[1].replace("jpeg", "jpg");
    } else {
      const parts = file.name.split(".");
      if (parts.length > 1) {
        ext = parts[parts.length - 1].toLowerCase();
      }
    }
    const fileName = `${crypto.randomUUID()}.${ext}`;

    // Save to local storage (public/uploads)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileId: fileName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
      { status: 500 }
    );
  }
}
