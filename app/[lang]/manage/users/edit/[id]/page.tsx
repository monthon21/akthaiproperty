import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import UserForm from "@/components/UserForm";
import { getUserAction } from "@/lib/actions/user";
import { getDealsByAgentAction } from "@/lib/actions/deal";

export default async function EditUserPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const session = await auth();
  const { lang = "th", id } = await params;

  if (!session) redirect("/login");
  const me = session.user as { id?: string | number; role?: string };
  if (me.role !== "ADMIN") redirect(`/${lang}/manage`);

  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();
  const res = await getUserAction(userId);
  if (!res.success || !res.user) notFound();
  const u = res.user;
  const deals = await getDealsByAgentAction(u.id);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">ผู้ใช้งาน</span>
              <h1 className="text-3xl font-black tracking-tight">แก้ไขผู้ใช้: {u.fullname || u.username}</h1>
              <p className="text-sm text-white/40 mt-2">User ID {u.id}</p>
            </div>
            <Link href={`/${lang}/manage/users`} className="text-xs font-bold text-white/50 hover:text-white transition-colors">
              ← รายชื่อผู้ใช้งาน
            </Link>
          </div>

          <UserForm
            lang={lang}
            isSelf={Number(me.id) === u.id}
            deals={deals}
            user={{
              id: u.id,
              username: u.username,
              fullname: u.fullname || "",
              email: u.email || "",
              role: u.role,
              profile: {
                prefix: u.profile?.prefix || "",
                position: u.profile?.position || "",
                phone: u.profile?.phone || "",
                lineId: u.profile?.lineId || "",
                nationalId: u.profile?.nationalId || "",
                idCardCopyUrl: u.profile?.idCardCopyUrl || "",
                signatureUrl: u.profile?.signatureUrl || "",
                address: u.profile?.address || "",
                subdistrict: u.profile?.subdistrict || "",
                district: u.profile?.district || "",
                province: u.profile?.province || "",
                postCode: u.profile?.postCode || "",
              },
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
