import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogFormClient from "@/components/BlogFormClient";
import { prisma } from "@/lib/prisma";

export default async function EditBlogPage({ params }: { params: Promise<{ lang: string, id: string }> | { lang: string, id: string } }) {
  const session = await auth();

  // Handle both Next.js 14 and 15
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";
  const id = parseInt(resolvedParams?.id, 10);

  if (!session) {
    redirect("/login");
  }

  const post = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href={`/${lang}/manage/blog`} className="text-accent hover:underline">Return to Blog Management</Link>
          </div>
        </main>
        <Footer />
      </>
    );
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
            <h1 className="text-3xl font-black tracking-tight">Edit Post</h1>
          </div>

          <BlogFormClient initialData={post} currentLang={lang} />

        </div>
      </main>
      <Footer />
    </>
  );
}
