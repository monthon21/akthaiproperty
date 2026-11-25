"use client";

import { useState } from "react";
import { DATE_LOCALE } from "@/lib/format";
import { deleteBlogPost } from "@/lib/actions/blog";
import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2 } from "lucide-react";
import RowActionsMenu from "@/components/RowActionsMenu";

type SortKey = "id" | "title" | "titleEn" | "status" | "date";
type SortablePost = { title: string; titleEn?: string | null; isPublished: boolean; createdAt: string | Date };

export default function ManageBlogClient({ initialPosts, currentLang }: { initialPosts: any[]; currentLang: string }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "id", dir: "desc" });
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(id);
    const res = await deleteBlogPost(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete post");
    }
    setIsDeleting(null);
  };

  // The ID is the order the post was created in (oldest = 1), so it doesn't change with the sorting.
  const time = (p: { createdAt: string | Date }) => new Date(p.createdAt).getTime();
  const byNewest = [...posts].sort((x, y) => time(y) - time(x));
  const idOf = new Map<string, number>(byNewest.map((p, i) => [p.id, byNewest.length - i]));

  const text = (v: string | null | undefined) => (v || "").trim();
  const compare: Record<SortKey, (x: SortablePost, y: SortablePost) => number> = {
    id: (x, y) => time(x) - time(y),
    title: (x, y) => text(x.title).localeCompare(text(y.title), "th"),
    titleEn: (x, y) => text(x.titleEn).localeCompare(text(y.titleEn), "en"),
    status: (x, y) => Number(x.isPublished) - Number(y.isPublished),
    date: (x, y) => time(x) - time(y),
  };
  // ties fall back to newest first
  const sorted = [...byNewest].sort((x, y) => compare[sort.key](x, y) * (sort.dir === "asc" ? 1 : -1));

  const toggleSort = (key: SortKey) =>
    setSort((cur) => (cur.key === key ? { key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "id" || key === "date" ? "desc" : "asc" }));

  const sortHeader = (key: SortKey, label: string, cls = "") => {
    const active = sort.key === key;
    return (
      <th className={`px-6 py-4 ${cls}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          title="คลิกเพื่อเรียงลำดับ"
          className={`inline-flex items-center gap-1 uppercase tracking-widest font-bold cursor-pointer transition-colors ${active ? "text-accent" : "hover:text-white"}`}
        >
          {label}
          <span className={active ? "" : "opacity-30"}>{active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
        </button>
      </th>
    );
  };

  return (
    <div className="bg-[#112240] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#233554]/50 border-b border-white/5 text-white/50 font-bold uppercase tracking-widest text-[10px]">
            <tr>
              {sortHeader("id", "ID", "w-16 text-center")}
              {sortHeader("title", "Title (TH)")}
              {sortHeader("titleEn", "Title (EN)")}
              {sortHeader("status", "Status")}
              {sortHeader("date", "Date")}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-center font-mono text-white/50">{idOf.get(post.id)}</td>
                <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{post.title}</td>
                <td className="px-6 py-4 text-white/70 max-w-[200px] truncate">{post.titleEn || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${post.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/50 text-xs">
                  {new Date(post.createdAt).toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <RowActionsMenu
                      label={`เมนูจัดการ ${post.title}`}
                      actions={[
                        { label: "View", Icon: Eye, href: `/${currentLang}/blog/${post.slug}`, newTab: true },
                        { label: "Edit", Icon: Edit, href: `/${currentLang}/manage/blog/edit/${post.id}` },
                        { label: "Trash", Icon: Trash2, danger: true, disabled: isDeleting === post.id, hint: isDeleting === post.id ? "กำลังลบ..." : undefined, onSelect: () => handleDelete(post.id) },
                      ]}
                    />
                  </div>
                </td>

              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/30 font-medium">
                  No blog posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
