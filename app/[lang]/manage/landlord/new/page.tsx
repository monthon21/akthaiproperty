import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import LandlordForm from "@/components/LandlordForm";

export default async function NewLandlordPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth();
  const { lang = "th" } = await params;

  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN") redirect(`/${lang}/manage`);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">เจ้าของทรัพย์</span>
              <h1 className="text-3xl font-black tracking-tight">เพิ่มเจ้าของทรัพย์ใหม่</h1>
              <p className="text-sm text-white/40 mt-2">กรอกชื่อเรียกอย่างน้อย 1 ช่อง ข้อมูลที่เหลือเพิ่มภายหลังได้</p>
            </div>
            <Link href={`/${lang}/manage/landlord`} className="text-xs font-bold text-white/50 hover:text-white transition-colors">
              ← รายชื่อเจ้าของทรัพย์
            </Link>
          </div>

          <LandlordForm lang={lang} />
        </div>
      </main>
      <Footer />
    </>
  );
}
