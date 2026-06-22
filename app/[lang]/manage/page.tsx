import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageAssetsClient from "@/components/ManageAssetsClient";
import { getAllAssetsAction } from "@/lib/actions/asset";

export default async function ManageAssetsPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const session = await auth();
  
  // Handle both Next.js 14 (sync params) and 15 (async params)
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  if (!session) {
    redirect("/login");
  }

  // Fetch all assets from DB
  const { success, assets } = await getAllAssetsAction();
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">
                Admin Panel
              </span>
              <h1 className="text-3xl font-black tracking-tight">จัดการรายการทรัพย์สิน (Asset Management)</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/myprofile`}
                className="text-xs font-bold text-white/50 hover:text-white tracking-widest uppercase transition-colors"
              >
                กลับหน้า Profile
              </Link>
              <Link
                href={`/${lang}/manage/customers`}
                className="border border-accent/40 hover:border-accent bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-md active:scale-95"
              >
                ข้อมูลเจ้าของทรัพย์
              </Link>
              <Link
                href={`/${lang}/addnew`}
                className="bg-accent hover:bg-accent-dark text-primary-dark text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95"
              >
                + เพิ่มทรัพย์สิน
              </Link>
            </div>
          </div>

          <ManageAssetsClient 
            initialAssets={success ? JSON.parse(JSON.stringify(assets || [])) : []} 
            currentLang={lang} 
            isAdmin={(session.user as any)?.role === 'ADMIN'}
          />
          
        </div>
      </main>
      <Footer />
    </>
  );
}
