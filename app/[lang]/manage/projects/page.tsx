import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageProjectsClient from "@/components/ManageProjectsClient";
import { getAllProjectTemplatesAction } from "@/lib/actions/project-template";

export default async function ManageProjectsPage({
  params,
}: {
  params: Promise<{ lang: string }> | { lang: string };
}) {
  const session = await auth();
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  if (!session) redirect("/login");

  const { templates } = await getAllProjectTemplatesAction();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">
                Admin Panel
              </span>
              <h1 className="text-3xl font-black tracking-tight">
                จัดการโครงการ (Project Templates)
              </h1>
              <p className="text-sm text-white/40 mt-2 leading-relaxed">
                สร้างเทมเพลตโครงการล่วงหน้า — เมื่อเลือกชื่อโครงการในฟอร์มเพิ่มทรัพย์
                <br />ระบบจะ auto-fill พิกัดแผนที่และสถานที่ใกล้เคียงให้อัตโนมัติ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/${lang}/manage`}
                className="text-xs font-bold text-white/50 hover:text-white tracking-widest uppercase transition-colors"
              >
                ← จัดการทรัพย์สิน
              </Link>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div className="text-xs text-white/60 leading-relaxed">
              <span className="font-bold text-accent">วิธีใช้งาน: </span>
              เพิ่มโครงการที่นี่ก่อน → ไปหน้า
              <Link href={`/${lang}/addnew`} className="text-accent hover:underline mx-1">เพิ่มทรัพย์สิน</Link>
              → พิมพ์ชื่อโครงการ → เลือกจาก dropdown → พิกัดและสถานที่ใกล้เคียงจะถูกกรอกอัตโนมัติ
            </div>
          </div>

          <ManageProjectsClient
            initialTemplates={JSON.parse(JSON.stringify(templates || []))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
