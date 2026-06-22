"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await forgotPasswordAction(email);
      if (res.success) {
        setStatus("success");
        setMessage("ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว (โปรดตรวจสอบในกล่องจดหมาย หรือโฟลเดอร์ขยะ/Spam)");
      } else {
        setStatus("error");
        setMessage(res.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setStatus("error");
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-40 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-accent/5 blur-[100px] rounded-full -ml-20 -mb-20"></div>
      
      <div className="w-full max-w-md bg-[#112240]/80 backdrop-blur-md p-8 md:p-10 rounded-xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-display font-black tracking-widest text-white mb-2">
            AK<span className="text-accent">THAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">ลืมรหัสผ่าน</h1>
          <p className="text-white/60 text-sm">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่านใหม่</p>
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
              className="inline-block w-full py-3 px-4 bg-white/5 border border-white/10 text-white rounded font-bold hover:bg-white/10 transition-colors"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
                {message}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                อีเมล (Email)
              </label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
                className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-all disabled:opacity-50"
                placeholder="email@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === "loading" || !email}
              className="w-full h-12 bg-accent text-primary-dark font-black tracking-widest rounded hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.15)] flex justify-center items-center"
            >
              {status === "loading" ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-sm text-white/50 hover:text-accent transition-colors">
                &larr; กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
