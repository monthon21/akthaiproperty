"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-dark text-white px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#112240] border border-accent/25 rounded shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <span className="text-primary-dark font-display font-black text-lg tracking-wider">AK</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-lg tracking-widest text-white leading-none group-hover:text-accent transition-colors">AK THAI</span>
              <span className="text-[8px] tracking-[0.4em] font-alt font-extrabold text-accent uppercase mt-0.5">PROPERTY</span>
            </div>
          </Link>
          <h1 className="text-xl font-display font-bold text-white tracking-wider">เข้าสู่ระบบ (LOGIN)</h1>
          <p className="mt-2 text-xs font-alt text-white/50 uppercase tracking-widest">ยินดีต้อนรับกลับเข้าสู่ AK Thai Property</p>
        </div>
        
        <form action={formAction} className="space-y-6">
          {error && (
            <p className="text-xs font-alt font-bold text-red-500 bg-red-500/10 border border-red-500/30 rounded p-3 text-center">
              {error}
            </p>
          )}
          
          <div>
            <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
              ชื่อผู้ใช้งาน (USERNAME)
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              placeholder="กรอกชื่อผู้ใช้งาน..."
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block">
                รหัสผ่าน (PASSWORD)
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[9px] font-alt font-bold text-accent uppercase tracking-widest hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest uppercase rounded hover:bg-accent-dark disabled:opacity-50 transition-all shadow-lg shadow-accent/15 cursor-pointer"
          >
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ (SIGN IN)"}
          </button>
        </form>
        
        <p className="text-center text-xs font-alt font-bold tracking-wider text-white/40 border-t border-white/5 pt-4">
          ยังไม่มีบัญชีผู้ใช้งาน?{" "}
          <Link href="/register" className="text-accent hover:underline">
            สมัครสมาชิก (REGISTER)
          </Link>
        </p>
      </div>
    </div>
  );
}
