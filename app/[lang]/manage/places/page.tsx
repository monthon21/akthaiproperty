import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import ManagePlacesClient, { PlaceRow } from "@/components/ManagePlacesClient";
import { getAllPlacesAction } from "@/lib/actions/place";

export default async function ManagePlacesPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth();
  const { lang = "th" } = await params;

  if (!session) redirect("/login");

  const { places } = await getAllPlacesAction();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">Admin Panel</span>
              <h1 className="text-3xl font-black tracking-tight">จัดการสถานที่ (Places)</h1>
              <p className="text-sm text-white/40 mt-2">
                รายชื่อสถานที่สำคัญสำหรับเลือกใน “สถานที่ใกล้เคียง” ตอนเพิ่ม / แก้ไขทรัพย์ — ไม่ต้องพิมพ์ชื่อใหม่ทุกครั้ง
              </p>
            </div>
            <Link
              href={`/${lang}/manage`}
              className="text-xs font-bold text-white/50 hover:text-white tracking-widest uppercase transition-colors"
            >
              ← จัดการทรัพย์สิน
            </Link>
          </div>

          <ManagePlacesClient initialPlaces={JSON.parse(JSON.stringify(places || [])) as PlaceRow[]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
