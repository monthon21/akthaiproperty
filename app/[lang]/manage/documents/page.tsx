import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import { FileText, KeyRound, HandCoins } from "lucide-react";
import { DOCUMENT_TYPES, DealKind } from "@/lib/documents";

const SECTIONS: { deal: DealKind; title: string; Icon: typeof FileText }[] = [
  { deal: "rent", title: "เอกสารการเช่า", Icon: KeyRound },
  { deal: "sale", title: "เอกสารการซื้อขาย", Icon: HandCoins },
];

export default async function ManageDocumentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth();
  const { lang = "th" } = await params;
  if (!session) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">Admin Panel</span>
              <h1 className="text-3xl font-black tracking-tight">ออกเอกสารเช่า / ซื้อขาย</h1>
              <p className="text-sm text-white/40 mt-2">
                ระบบออกเอกสาร PDF จากข้อมูลทรัพย์ เจ้าของ และลูกค้า — กำลังพัฒนา
              </p>
            </div>
            <Link
              href={`/${lang}/manage`}
              className="text-xs font-bold text-white/50 hover:text-white tracking-widest uppercase transition-colors"
            >
              ← จัดการทรัพย์สิน
            </Link>
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ deal, title, Icon }) => (
              <section key={deal} className="space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  <Icon className="w-4 h-4" /> {title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DOCUMENT_TYPES.filter((d) => d.deal === deal).map((d) => (
                    <div
                      key={d.key}
                      className="relative bg-[#112240] border border-white/10 rounded-2xl p-5 flex gap-4 opacity-80"
                      aria-disabled={!d.ready}
                    >
                      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent shrink-0">
                        <FileText className="w-5 h-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white">{d.title}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">{d.titleEn}</p>
                        <p className="text-xs text-white/50 mt-2 leading-relaxed">{d.description}</p>
                      </div>
                      {!d.ready && (
                        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">
                          เร็วๆ นี้
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
