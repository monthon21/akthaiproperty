import { getPublishedBlogPosts } from "@/lib/actions/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> | { lang: string } }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "th";

  const { success, posts } = await getPublishedBlogPosts();

  const getTitle = (post: any) => {
    if (lang === "en" && post.titleEn) return post.titleEn;
    if (lang === "zh" && post.titleZh) return post.titleZh;
    return post.title;
  };

  const getContent = (post: any) => {
    if (lang === "en" && post.contentEn) return post.contentEn;
    if (lang === "zh" && post.contentZh) return post.contentZh;
    return post.content;
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-accent mb-4 tracking-tight">
              {lang === "th" ? "บทความและข่าวสาร" : lang === "zh" ? "博客与新闻" : "Blog & News"}
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              {lang === "th" 
                ? "อัปเดตข่าวสารเกี่ยวกับอสังหาริมทรัพย์และทริคดีๆ ในการเลือกซื้อที่อยู่อาศัย" 
                : lang === "zh" 
                ? "更新房地产新闻以及选购优质住宅的技巧" 
                : "Real estate news updates and great tips for choosing your home"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {success && posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <Link href={`/${lang}/blog/${post.slug}`} key={post.id} className="group">
                  <article className="bg-[#112240] rounded-2xl border border-white/5 overflow-hidden hover:border-accent/50 transition-all shadow-xl hover:shadow-accent/5 h-full flex flex-col">
                    <div className="relative w-full h-48 bg-[#233554]/50 overflow-hidden">
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          alt={getTitle(post)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                        {getTitle(post)}
                      </h2>
                      <p className="text-white/60 text-sm line-clamp-3 mb-4 flex-1">
                        {getContent(post)}
                      </p>
                      <div className="text-accent text-xs font-bold uppercase tracking-widest mt-auto group-hover:translate-x-1 transition-transform inline-block">
                        Read More →
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/50">
                {lang === "th" ? "ยังไม่มีบทความในขณะนี้" : lang === "zh" ? "目前没有文章" : "No blog posts available at the moment"}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
