import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManageBlogClient from "@/components/ManageBlogClient";
import { getBlogPosts } from "@/lib/actions/blog";

export default async function ManageBlogPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const session = await auth();

  // Handle both Next.js 14 and 15
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  if (!session) {
    redirect("/login");
  }

  // Fetch all posts from DB
  const { success, posts } = await getBlogPosts();

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
              <h1 className="text-3xl font-black tracking-tight">Blog Management</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/${lang}/manage`}
                className="text-xs font-bold text-white/50 hover:text-white tracking-widest uppercase transition-colors"
              >
                กลับหน้า Manage
              </Link>
              <Link
                href={`/${lang}/manage/blog/add`}
                className="bg-accent hover:bg-accent-dark text-primary-dark text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95"
              >
                + เขียนบทความใหม่
              </Link>
            </div>
          </div>

          <ManageBlogClient
            initialPosts={success ? JSON.parse(JSON.stringify(posts || [])) : []}
            currentLang={lang}
          />

        </div>
      </main>
      <Footer />
    </>
  );
}
