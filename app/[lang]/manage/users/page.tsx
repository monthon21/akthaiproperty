import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import ManageUsersClient from "@/components/ManageUsersClient";
import { getAllUsersAction } from "@/lib/actions/user";

export default async function ManageUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth();
  const { lang = "th" } = await params;

  if (!session) redirect("/login");
  const me = session.user as { id?: string | number; role?: string };
  if (me.role !== "ADMIN") redirect(`/${lang}/manage`);

  const res = await getAllUsersAction();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-6">
          <ManageUsersClient
            initialUsers={JSON.parse(JSON.stringify(res.users))}
            currentUserId={Number(me.id)}
            currentLang={lang}
            errorMsg={res.success ? "" : res.error}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
