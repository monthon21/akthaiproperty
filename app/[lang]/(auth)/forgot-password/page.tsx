"use client";

import { useState } from "react";
import Link from "next/link";
import { verifyUserAction, resetPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await verifyUserAction(username);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "ไม่พบผู้ใช้ในระบบ");
    } else {
      setFullname(res.fullname || "");
      setStep(2);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    const res = await resetPasswordAction(username, newPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "เกิดข้อผิดพลาด");
    } else {
      setSuccess("เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังพาท่านไปยังหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-dark text-white px-6">
      <div className="w-full max-w-md p-8 bg-[#112240] border border-accent/25 rounded shadow-2xl space-y-8">
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
          <h1 className="text-xl font-display font-bold text-white tracking-wider">ลืมรหัสผ่าน (RESET PASSWORD)</h1>
          <p className="mt-2 text-xs font-alt text-white/50 uppercase tracking-widest">
            {step === 1 ? "กรุณายืนยันชื่อผู้ใช้งานของคุณ" : "ตั้งค่ารหัสผ่านใหม่ของคุณ"}
          </p>
        </div>

        {error && (
          <p className="text-xs font-alt font-bold text-red-500 bg-red-500/10 border border-red-500/30 rounded p-3 text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-xs font-alt font-bold text-green-500 bg-green-500/10 border border-green-500/30 rounded p-3 text-center">
            {success}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
                ชื่อผู้ใช้งาน (USERNAME)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้งาน..."
                className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest uppercase rounded hover:bg-accent-dark disabled:opacity-50 transition-all shadow-lg shadow-accent/15 cursor-pointer"
            >
              {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบชื่อผู้ใช้"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="bg-black/30 border border-white/5 p-4 rounded text-center">
              <span className="text-[8px] font-alt font-bold text-accent uppercase tracking-widest block mb-1">บัญชีผู้ใช้</span>
              <span className="font-alt text-sm font-bold text-white">{fullname}</span>
            </div>

            <div>
              <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
                รหัสผ่านใหม่ (NEW PASSWORD)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร..."
                className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              />
            </div>

            <div>
              <label className="text-[8px] font-alt font-extrabold text-white/40 uppercase tracking-widest block mb-1">
                ยืนยันรหัสผ่านใหม่ (CONFIRM NEW PASSWORD)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                className="w-full h-11 bg-black/55 border border-white/10 rounded px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/60 transition-all font-alt font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full h-11 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest uppercase rounded hover:bg-accent-dark disabled:opacity-50 transition-all shadow-lg shadow-accent/15 cursor-pointer"
            >
              {loading ? "กำลังเปลี่ยนรหัส..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        )}

        <div className="text-center text-xs font-alt font-bold tracking-wider text-white/40 border-t border-white/5 pt-4">
          กลับไปยังหน้า{" "}
          <Link href="/login" className="text-accent hover:underline">
            เข้าสู่ระบบ (LOGIN)
          </Link>
        </div>
      </div>
    </div>
  );
}
