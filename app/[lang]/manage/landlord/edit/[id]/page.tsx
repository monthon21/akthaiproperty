import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import LandlordForm from "@/components/LandlordForm";
import { getLandlordDetailsAction } from "@/lib/actions/landlord";

export default async function EditLandlordPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const session = await auth();
  const { lang = "th", id } = await params;

  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN") redirect(`/${lang}/manage`);

  const landlordId = Number(id);
  if (!Number.isInteger(landlordId)) notFound();

  const res = await getLandlordDetailsAction(landlordId);
  if (!res.success || !res.landlord) notFound();
  const c = res.landlord;

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">เจ้าของทรัพย์</span>
              <h1 className="text-3xl font-black tracking-tight">แก้ไขข้อมูล: {c.name}</h1>
              <p className="text-sm text-white/40 mt-2">ข้อมูลติดต่อและข้อมูลสำหรับทำสัญญา</p>
            </div>
            <Link href={`/${lang}/manage/landlord`} className="text-xs font-bold text-white/50 hover:text-white transition-colors">
              ← รายชื่อเจ้าของทรัพย์
            </Link>
          </div>

          <LandlordForm
            lang={lang}
            landlordId={c.id}
            initial={{
              name: c.name || "",
              phone: c.phone || "",
              line: c.line || "",
              fullname: c.details?.fullname || "",
              detailPhone: c.details?.phone || "",
              idcard: c.details?.idcard || "",
              email: c.details?.email || "",
              detailLine: c.details?.line || "",
              address: c.details?.address || "",
              houseNo: c.details?.houseNo || "",
              moo: c.details?.moo || "",
              village: c.details?.village || "",
              soi: c.details?.soi || "",
              road: c.details?.road || "",
              subdistrict: c.details?.subdistrict || "",
              district: c.details?.district || "",
              province: c.details?.province || "",
              postCode: c.details?.postCode || "",
            }}
            assets={c.assets.map((a: { id: string; code: string; title: string }) => ({ id: a.id, code: a.code, title: a.title }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
