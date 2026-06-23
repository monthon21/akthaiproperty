"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateUserAvatarAction } from "@/lib/actions/user";

interface AvatarUploaderProps {
  currentImage: string | null;
  userName: string;
}

export default function AvatarUploader({ currentImage, userName }: AvatarUploaderProps) {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Basic validation
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("รองรับไฟล์รูปภาพประเภท JPG, PNG, WEBP, GIF เท่านั้น");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดรูปภาพต้องไม่เกิน 10 MB");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัพโหลด");
      }

      const uploadedUrl = data.url;

      // Update in database
      const dbRes = await updateUserAvatarAction(uploadedUrl);
      if (!dbRes.success) {
        throw new Error(dbRes.error || "ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้");
      }

      // Update state and refresh
      setImage(uploadedUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setError(err.message || "อัพโหลดรูปล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const initial = (userName?.[0] || "U").toUpperCase();

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={isUploading}
        />

        {/* Avatar Container */}
        <div className="w-24 h-24 bg-accent/15 border-2 border-accent/40 rounded-2xl flex items-center justify-center text-3xl font-black text-accent shadow-xl shadow-accent/5 overflow-hidden relative">
          {image ? (
            <Image
              src={image}
              alt={userName}
              width={96}
              height={96}
              className="rounded-xl object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              unoptimized={image.startsWith("/")}
            />
          ) : (
            <span className="transition-transform duration-300 group-hover:scale-105">{initial}</span>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-accent animate-pulse"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            <span className="text-[8px] font-bold text-white uppercase tracking-widest text-center px-1">
              เปลี่ยนรูป
            </span>
          </div>

          {/* Uploading Spinner */}
          {isUploading && (
            <div className="absolute inset-0 bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Edit Button Badge */}
        {!isUploading && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent text-primary-dark rounded-lg flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1 hover:bg-accent-dark transition-colors border border-primary-dark/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.089a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] font-medium text-red-400 max-w-xs text-center sm:text-left mt-1">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
