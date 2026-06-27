"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

export interface ImageItem {
  imageUrl: string;
  isFeature: boolean;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append("file", file);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) return data.url as string;
      setUploadError(data.error || "อัพโหลดล้มเหลว");
      return null;
    } catch {
      setUploadError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      return null;
    }
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError("");
      const arr = Array.from(files);
      setUploadingCount((n) => n + arr.length);

      const results = await Promise.all(arr.map(uploadFile));
      const newImages: ImageItem[] = [];

      results.forEach((url) => {
        if (url) {
          const isFirst = images.length === 0 && newImages.length === 0;
          newImages.push({ imageUrl: url, isFeature: isFirst });
        }
      });

      setUploadingCount((n) => n - arr.length);

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetFeature = (idx: number) => {
    onChange(images.map((img, i) => ({ ...img, isFeature: i === idx })));
  };

  const handleRemove = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    if (images[idx].isFeature && updated.length > 0) {
      updated[0] = { ...updated[0], isFeature: true };
    }
    onChange(updated);
  };

  const isUploading = uploadingCount > 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl p-8 text-center
          cursor-pointer transition-all duration-200 select-none
          ${isDragOver
            ? "border-accent bg-accent/10 scale-[1.01]"
            : "border-white/15 bg-black/25 hover:border-white/30 hover:bg-black/35"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {isUploading ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-accent tracking-wider uppercase">
              กำลังอัพโหลด {uploadingCount} ไฟล์...
            </p>
          </>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragOver ? "bg-accent/20" : "bg-white/5"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${isDragOver ? "text-accent" : "text-white/30"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 tracking-wider">
                <span className="text-accent">คลิกเลือกไฟล์</span> หรือลากรูปมาวางที่นี่
              </p>
              <p className="text-[10px] text-white/25 mt-1 tracking-wider uppercase">
                JPG · PNG · WEBP · GIF — สูงสุด 10MB ต่อไฟล์ · เลือกได้หลายไฟล์พร้อมกัน
              </p>
            </div>
          </>
        )}
      </div>

      {/* Upload Error */}
      {uploadError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          ⚠ {uploadError}
        </p>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.imageUrl + idx}
              className={`
                relative group rounded-xl overflow-hidden border-2 transition-all duration-200
                ${img.isFeature ? "border-accent shadow-lg shadow-accent/20" : "border-white/10 hover:border-white/25"}
              `}
            >
              {/* Thumbnail */}
              <div className="aspect-square relative bg-black/40">
                <Image
                  src={img.imageUrl}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={img.imageUrl.startsWith("/")}
                />
                {/* Feature badge */}
                {img.isFeature && (
                  <div className="absolute top-1.5 left-1.5 bg-accent text-primary-dark text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow">
                    ⭐ Featured
                  </div>
                )}
                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 items-center justify-center p-2">
                  {!img.isFeature && (
                    <button
                      type="button"
                      onClick={() => handleSetFeature(idx)}
                      className="w-full text-[9px] font-bold uppercase tracking-wider bg-accent text-primary-dark rounded-lg py-1.5 hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      ⭐ Set as Feature
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="w-full text-[9px] font-bold uppercase tracking-wider bg-red-500/80 text-white rounded-lg py-1.5 hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    🗑 ลบรูป
                  </button>
                </div>
              </div>

              {/* Caption */}
              <div className="px-2 py-1.5 bg-black/40">
                <p className={`text-[9px] font-bold uppercase tracking-wider truncate ${img.isFeature ? "text-accent" : "text-white/40"}`}>
                  {img.isFeature ? "Feature Image" : `ภาพที่ ${idx + 1}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation hint */}
      {images.length > 0 && !images.some(i => i.isFeature) && (
        <p className="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
          ⚠ กรุณา Hover ที่รูปภาพแล้วกด &quot;Set as Feature&quot; เพื่อกำหนดรูปหลัก 1 รูป
        </p>
      )}
      {images.length > 0 && images.some(i => i.isFeature) && (
        <p className="text-[10px] text-accent/70 bg-accent/5 border border-accent/15 rounded-xl px-4 py-2.5">
          ✓ มีรูปภาพ {images.length} รูป — กำหนด Feature Image แล้ว
        </p>
      )}
    </div>
  );
}
