import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import ProjectForm from "@/components/ProjectForm";
import { getProjectTemplateAction } from "@/lib/actions/project-template";

export default async function EditProjectPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const session = await auth();
  const { lang = "th", id } = await params;

  if (!session) redirect("/login");

  const templateId = Number(id);
  if (!Number.isInteger(templateId)) notFound();
  const res = await getProjectTemplateAction(templateId);
  if (!res.success || !res.template) notFound();
  const template = res.template;

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">โครงการ</span>
              <h1 className="text-3xl font-black tracking-tight">แก้ไขโครงการ: {template.name}</h1>
              <p className="text-sm text-white/40 mt-2">แก้ไขพิกัดและสถานที่ใกล้เคียงของโครงการ</p>
            </div>
            <Link href={`/${lang}/manage/projects`} className="text-xs font-bold text-white/50 hover:text-white transition-colors">
              ← รายการโครงการ
            </Link>
          </div>

          <ProjectForm lang={lang} template={JSON.parse(JSON.stringify(template))} />
        </div>
      </main>
      <Footer />
    </>
  );
}
