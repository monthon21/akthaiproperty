import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import { FileText, KeyRound, HandCoins, FolderCheck } from "lucide-react";
import { DOCUMENT_TYPES, DEAL_DOCUMENT_SET, DealKind } from "@/lib/documents";

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

          {/* the set of documents that goes with one transaction */}
          <section className="mb-10 bg-[#112240] border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-widest">
                <FolderCheck className="w-4 h-4" /> ชุดเอกสารต่อ 1 ธุรกรรม
              </h2>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                การเช่าหรือซื้อขายแต่ละครั้ง เอกสารทั้งหมดนี้จะอยู่ในชุดเดียวกัน — รายการที่มี <span className="text-accent font-bold">*</span> ควรมีในชุด
                แต่ยังไม่มีก็ทำรายการต่อได้ เพราะบางครั้งให้กันวันเซ็นสัญญา
              </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEAL_DOCUMENT_SET.map((d, i) => (
                <li key={d.key} className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent text-xs font-black shrink-0">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-white">
                      {d.title}
                      {d.expected && <span className="text-accent ml-1" title="ควรมีในชุด">*</span>}
                    </span>
                    <span className="block text-[10px] text-white/30 uppercase tracking-wider">{d.titleEn}</span>
                  </span>
                  {d.note && <span className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 shrink-0">{d.note}</span>}
                </li>
              ))}
            </ol>
          </section>

          <div className="space-y-10">
            {SECTIONS.map(({ deal, title, Icon }) => (
              <section key={deal} className="space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  <Icon className="w-4 h-4" /> {title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DOCUMENT_TYPES.filter((d) => d.deal === deal).map((d) => {
                    const body = (
                      <>
                        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent shrink-0">
                          <FileText className="w-5 h-5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white">{d.title}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">{d.titleEn}</p>
                          <p className="text-xs text-white/50 mt-2 leading-relaxed">{d.description}</p>
                        </div>
                        <span
                          className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                            d.ready ? "text-primary-dark bg-accent border-accent" : "text-accent bg-accent/10 border-accent/20"
                          }`}
                        >
                          {d.ready ? "สร้างเอกสาร" : "เร็วๆ นี้"}
                        </span>
                      </>
                    );
                    const cls = "relative bg-[#112240] border border-white/10 rounded-2xl p-5 flex gap-4";
                    return d.ready && d.path ? (
                      <Link key={d.key} href={`/${lang}/manage/documents/${d.path}`} className={`${cls} hover:border-accent/60 transition-colors`}>
                        {body}
                      </Link>
                    ) : (
                      <div key={d.key} className={`${cls} opacity-80`} aria-disabled>
                        {body}
                      </div>
                    );
                  })}
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
