"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordWithTokenAction } from "@/lib/actions/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("ลิงก์ไม่ถูกต้อง หรือไม่มีรหัสอ้างอิงสำหรับตั้งรหัสผ่านใหม่");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) return;

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await resetPasswordWithTokenAction(token, password);
      if (res.success) {
        setStatus("success");
        setMessage("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
      } else {
        setStatus("error");
        setMessage(res.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
    } catch (err) {
      setStatus("error");
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="w-full max-w-md bg-[#112240]/80 backdrop-blur-md p-8 md:p-10 rounded-xl border border-white/10 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-display font-black tracking-widest text-white mb-2">
          AK<span className="text-accent">THAI</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-white/60 text-sm">กรุณากำหนดรหัสผ่านใหม่ของคุณ</p>
      </div>

      {status === "success" ? (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-white font-medium mb-6 leading-relaxed">{message}</p>
          <Link 
            href="/login" 
            className="inline-block w-full py-3 px-4 bg-accent text-primary-dark rounded font-black tracking-widest hover:bg-accent-dark transition-colors shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            เข้าสู่ระบบเลย
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === "error" && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
              รหัสผ่านใหม่ (New Password)
            </label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status === "loading" || !token}
              className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-all disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
              ยืนยันรหัสผ่านใหม่ (Confirm Password)
            </label>
            <input 
              id="confirmPassword"
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={status === "loading" || !token}
              className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-all disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === "loading" || !token || !password || !confirmPassword}
            className="w-full h-12 bg-accent text-primary-dark font-black tracking-widest rounded hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.15)] flex justify-center items-center mt-6"
          >
            {status === "loading" ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "ยืนยันการเปลี่ยนรหัสผ่าน"}
          </button>

          <div className="text-center pt-4">
            <Link href="/login" className="text-sm text-white/50 hover:text-accent transition-colors">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -ml-40 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-accent/5 blur-[100px] rounded-full -mr-20 -mb-20"></div>
      
      <Suspense fallback={<div className="text-white/50">กำลังโหลดข้อมูล...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
