import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
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
          <h1 className="text-xl font-display font-bold text-white tracking-wider">สมัครสมาชิก (REGISTER)</h1>
          <p className="mt-2 text-xs font-alt text-white/50 uppercase tracking-widest">เข้าร่วมกับ AK Thai Property วันนี้</p>
        </div>
        
        <form action={registerAction} className="space-y-6">
          <div>
            <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
              ชื่อ-นามสกุล (FULL NAME)
            </label>
            <input
              name="fullname"
              type="text"
              className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              placeholder="กรอกชื่อ-นามสกุล..."
            />
          </div>
          
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
            <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
              รหัสผ่าน (PASSWORD)
            </label>
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
            className="w-full h-11 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest uppercase rounded hover:bg-accent-dark transition-all shadow-lg shadow-accent/15 cursor-pointer"
          >
            สร้างบัญชีผู้ใช้ (CREATE ACCOUNT)
          </button>
        </form>
        
        <p className="text-center text-xs font-alt font-bold tracking-wider text-white/40 border-t border-white/5 pt-4">
          มีบัญชีผู้ใช้งานแล้ว?{" "}
          <Link href="/login" className="text-accent hover:underline">
            เข้าสู่ระบบ (LOGIN)
          </Link>
        </p>
      </div>
    </div>
  );
}
