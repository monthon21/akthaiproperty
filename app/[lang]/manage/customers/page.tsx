import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageCustomersClient from "@/components/ManageCustomersClient";
import { getAllCustomersAction } from "@/lib/actions/customer";

export default async function ManageCustomersPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const session = await auth();
  
  // Handle both Next.js 14 (sync params) and 15 (async params)
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  // Check authentication & admin role
  if (!session) {
    redirect("/login");
  }
  
  if ((session.user as any)?.role !== 'ADMIN') {
    redirect(`/${lang}/manage`);
  }

  // Fetch all customers/owners from DB
  const { success, customers, error } = await getAllCustomersAction();
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <ManageCustomersClient 
            initialCustomers={success ? JSON.parse(JSON.stringify(customers || [])) : []} 
            currentLang={lang} 
            errorMsg={error || ""}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
