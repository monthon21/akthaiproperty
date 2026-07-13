import { getBlogPostBySlug } from "@/lib/actions/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogContent from "@/components/BlogContent";

export default async function BlogPostPage({ params }: { params: Promise<{ lang: string, slug: string }> | { lang: string, slug: string } }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";
  const slug = resolvedParams?.slug;

  const { success, post } = await getBlogPostBySlug(slug);

  if (!success || !post || !post.isPublished) {
    notFound();
  }

  const getTitle = () => {
    if (lang === "en" && post.titleEn) return post.titleEn;
    if (lang === "zh" && post.titleZh) return post.titleZh;
    return post.title;
  };

  const getContent = () => {
    if (lang === "en" && post.contentEn) return post.contentEn;
    if (lang === "zh" && post.contentZh) return post.contentZh;
    return post.content;
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <Link href={`/${lang}/blog`} className="text-accent text-sm font-bold tracking-widest uppercase hover:underline mb-8 inline-block">
            ← {lang === "th" ? "กลับไปหน้าบล็อก" : lang === "zh" ? "返回博客" : "Back to Blog"}
          </Link>
          
          <article className="bg-[#112240] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            {post.imageUrl && (
              <div className="w-full h-64 md:h-96 relative bg-[#233554]/50">
                <img 
                  src={post.imageUrl} 
                  alt={getTitle()}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                {getTitle()}
              </h1>
              
              <BlogContent content={getContent()} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
