import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageLandlordsClient from "@/components/ManageLandlordsClient";
import { getAllLandlordsAction } from "@/lib/actions/landlord";

export default async function ManageLandlordsPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
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

  // Fetch all landlords/owners from DB
  const { success, landlords, error } = await getAllLandlordsAction();
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <ManageLandlordsClient 
            initialLandlords={success ? JSON.parse(JSON.stringify(landlords || [])) : []} 
            currentLang={lang} 
            errorMsg={error || ""}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
