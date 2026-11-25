import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageAssetsClient from "@/components/ManageAssetsClient";
import { getAllAssetsAction } from "@/lib/actions/asset";
import AdminNav from "@/components/AdminNav";

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

  type AssetSummary = { isSell: boolean; isRent: boolean; isAvailable: boolean; isDraft: boolean };
  const list: AssetSummary[] = success ? (assets as AssetSummary[]) : [];
  const stats = [
    { label: "ทรัพย์ทั้งหมด", value: list.length, tone: "text-white" },
    { label: "ขาย", value: list.filter((a) => a.isSell).length, tone: "text-accent" },
    { label: "เช่า", value: list.filter((a) => a.isRent).length, tone: "text-sky-400" },
    { label: "ออนไลน์", value: list.filter((a) => a.isAvailable && !a.isDraft).length, tone: "text-emerald-400" },
  ];


  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">
                Admin Panel
              </span>
              <h1 className="text-3xl font-black tracking-tight">Asset Management</h1>
              <p className="text-sm text-white/50 mt-1.5">
                สวัสดี{session.user?.name ? `, ${session.user.name}` : ""} — ภาพรวมทรัพย์สินทั้งหมดในระบบ
              </p>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 max-w-xl">
                {stats.map(({ label, value, tone }) => (
                  <div
                    key={label}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <dt className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</dt>
                    <dd className={`text-2xl font-black leading-tight mt-0.5 ${tone}`}>{value.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <AdminNav variant="grid" />
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
