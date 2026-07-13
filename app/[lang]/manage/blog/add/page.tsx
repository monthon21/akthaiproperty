import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogFormClient from "@/components/BlogFormClient";

export default async function AddBlogPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const session = await auth();

  // Handle both Next.js 14 and 15
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">
              Admin Panel
            </span>
            <h1 className="text-3xl font-black tracking-tight">Write New Post</h1>
          </div>

          <BlogFormClient currentLang={lang} />

        </div>
      </main>
      <Footer />
    </>
  );
}
