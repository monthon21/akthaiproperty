import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarUploader from "@/components/AvatarUploader";
import { prisma } from "@/lib/prisma";

export default async function MyProfilePage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const session = await auth();

  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  if (!session || !session.user) {
    redirect("/login");
  }

  const rawUserId = Number((session.user as any).id);
  if (isNaN(rawUserId)) {
    redirect("/login");
  }

  const userFromDb = await prisma.user.findUnique({
    where: { id: rawUserId }
  });

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">
                Account Settings
              </span>
              <h1 className="text-3xl font-black tracking-tight">ข้อมูลผู้ใช้งาน (Profile)</h1>
            </div>
            <Link
              href={`/${lang}`}
              className="text-xs font-bold text-white/50 hover:text-accent tracking-widest uppercase transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>

          <div className="bg-[#112240] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-accent/60 via-accent to-accent-dark"></div>

            <div className="p-8 md:p-10">
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center pb-8 border-b border-white/5 mb-8">
                {/* Avatar Uploader */}
                <AvatarUploader
                  currentImage={userFromDb?.image || null}
                  userName={userFromDb?.fullname || userFromDb?.username || "User"}
                />

                {/* Name / Role */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {userFromDb?.fullname || userFromDb?.username || "Anonymous User"}
                  </h2>
                  <p className="text-white/50 text-xs font-medium tracking-wide">
                    {userFromDb?.email || "ไม่มีข้อมูลอีเมล"}
                  </p>
                  <div className="pt-2">
                    <span className="text-[9px] font-bold text-primary-dark bg-accent uppercase tracking-widest px-2.5 py-1 rounded">
                      Authorized Agent
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 bg-black/25 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">User ID</span>
                  <span className="text-xs font-mono font-medium text-white/95 break-all">{userFromDb?.id}</span>
                </div>
                <div className="p-5 bg-black/25 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">ประเภทผู้ใช้ (Role)</span>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">ADMIN / AGENT</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                  Quick Actions (การจัดการข้อมูล)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link 
                    href={`/${lang}/addnew`}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-accent transition-colors block">เพิ่มทรัพย์สินใหม่</span>
                      <span className="text-[10px] text-white/40 block">ลงประกาศอสังหาริมทรัพย์ขาย/เช่า</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </Link>

                  <Link 
                    href={`/${lang}/manage`}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-accent transition-colors block">ดูรายการทรัพย์ทั้งหมด</span>
                      <span className="text-[10px] text-white/40 block">จัดการ ลบ หรือแก้ไขข้อมูลทรัพย์สินได้ที่นี่</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-8 mt-8 border-t border-white/5 flex justify-end">
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="px-8 py-3 border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:border-red-500 hover:text-white text-red-400 font-bold text-xs tracking-widest uppercase rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    ออกจากระบบ (Sign Out)
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
