"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Called with a transparent PNG of the signature, cropped to the ink */
  onConfirm: (file: File) => void | Promise<void>;
  onCancel: () => void;
  busy?: boolean;
}

const INK = "#0A192F";
const PAD = 12; // px of empty space kept around the ink when cropping

/** Draw a signature with mouse, finger or stylus */
export default function SignaturePad({ onConfirm, onCancel, busy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const bounds = useRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Match the canvas bitmap to its on-screen size (sharp on retina screens)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const grow = (x: number, y: number) => {
    const b = bounds.current;
    bounds.current = b
      ? { minX: Math.min(b.minX, x), minY: Math.min(b.minY, y), maxX: Math.max(b.maxX, x), maxY: Math.max(b.maxY, y) }
      : { minX: x, minY: y, maxX: x, maxY: y };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    drawing.current = true;
    last.current = p;
    grow(p.x, p.y);
    // a tap leaves a dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
    ctx.fill();
    setHasInk(true);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    grow(p.x, p.y);
  };

  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    bounds.current = null;
    setHasInk(false);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    const b = bounds.current;
    if (!canvas || !b) return;
    const dpr = canvas.width / canvas.getBoundingClientRect().width;
    // crop to the ink (+ padding), in bitmap pixels
    const sx = Math.max(0, Math.floor((b.minX - PAD) * dpr));
    const sy = Math.max(0, Math.floor((b.minY - PAD) * dpr));
    const sw = Math.min(canvas.width - sx, Math.ceil((b.maxX - b.minX + PAD * 2) * dpr));
    const sh = Math.min(canvas.height - sy, Math.ceil((b.maxY - b.minY + PAD * 2) * dpr));
    const out = document.createElement("canvas");
    out.width = sw;
    out.height = sh;
    out.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    out.toBlob((blob) => {
      if (blob) onConfirm(new File([blob], `signature-${Date.now()}.png`, { type: "image/png" }));
    }, "image/png");
  };

  return (
    <div className="space-y-3 w-full max-w-lg">
      <div className="relative rounded-xl border border-white/15 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="block w-full h-44 touch-none cursor-crosshair"
          aria-label="พื้นที่เขียนลายเซ็น"
        />
        {/* signature baseline */}
        <div className="pointer-events-none absolute left-6 right-6 bottom-9 border-b border-dashed border-gray-300" />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            เขียนลายเซ็นตรงนี้ (ใช้เมาส์ นิ้ว หรือปากกา)
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={!hasInk || busy}
          className="h-10 px-5 rounded-xl bg-accent text-primary-dark text-xs font-black hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {busy ? "กำลังบันทึกรูป..." : "ใช้ลายเซ็นนี้"}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk || busy}
          className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold disabled:opacity-40 cursor-pointer"
        >
          ล้าง เขียนใหม่
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="h-10 px-3 text-xs text-white/40 hover:text-white cursor-pointer">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
