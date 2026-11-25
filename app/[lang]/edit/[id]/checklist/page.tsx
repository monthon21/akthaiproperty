import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import ChecklistClient from "@/components/ChecklistClient";
import { buildDefaultChecklist, parseChecklist, ChecklistKind } from "@/lib/checklist";

export default async function AssetChecklistPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const session = await auth();
  const { lang = "th", id } = await params;
  if (!session) redirect("/login");

  const asset = await prisma.asset.findFirst({
    where: { OR: [{ id }, { code: id }] },
    select: {
      id: true,
      code: true,
      title: true,
      type: true,
      noBedroom: true,
      noBathroom: true,
      checklists: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!asset) notFound();

  const saved = asset.checklists[0];
  const data = parseChecklist(saved?.data) ?? buildDefaultChecklist(asset);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">Check list · รหัส {asset.code}</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">ตรวจสภาพทรัพย์ก่อนเข้าอยู่</h1>
              <p className="text-sm text-white/50 mt-1.5 truncate">{asset.title}</p>
            </div>
            <Link href={`/${lang}/edit/${asset.code}`} className="text-xs font-bold text-white/50 hover:text-white transition-colors shrink-0">
              ← กลับหน้าแก้ไขทรัพย์
            </Link>
          </div>

          <ChecklistClient
            asset={{ id: asset.id, code: asset.code, title: asset.title }}
            initial={{
              id: saved?.id,
              kind: (saved?.kind === "move_out" ? "move_out" : "move_in") as ChecklistKind,
              inspectedAt: saved?.inspectedAt ? saved.inspectedAt.toISOString().slice(0, 10) : "",
              inspector: saved?.inspector || session.user?.name || "",
              occupant: saved?.occupant || "",
              data,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
