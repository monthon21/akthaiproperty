"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost, updateBlogPost } from "@/lib/actions/blog";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";

export default function BlogFormClient({ initialData, currentLang }: { initialData?: any; currentLang: string }) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState("th");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    titleEn: initialData?.titleEn || "",
    contentEn: initialData?.contentEn || "",
    titleZh: initialData?.titleZh || "",
    contentZh: initialData?.contentZh || "",
    imageUrl: initialData?.imageUrl || "",
    slug: initialData?.slug || "",
    isPublished: initialData?.isPublished ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Thai title and content are required.");
      return;
    }

    setIsSubmitting(true);
    let res;
    if (isEdit) {
      res = await updateBlogPost(initialData.id, formData);
    } else {
      res = await createBlogPost(formData);
    }

    setIsSubmitting(false);
    if (res.success) {
      router.push(`/${currentLang}/manage/blog`);
    } else {
      alert(res.error || "Failed to save blog post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#112240] rounded-2xl border border-white/5 p-6 shadow-2xl space-y-6">
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Slug (URL)</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="leave blank to auto-generate from title"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
        />
      </div>

      {/* LANGUAGE TABS */}
      <div className="border-b border-white/10 flex gap-6">
        <button 
          type="button" 
          onClick={() => setActiveTab('th')}
          className={`pb-3 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'th' ? 'text-accent border-accent' : 'text-white/50 border-transparent hover:text-white'}`}
        >
          🇹🇭 Thai (Required)
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('en')}
          className={`pb-3 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'en' ? 'text-accent border-accent' : 'text-white/50 border-transparent hover:text-white'}`}
        >
          🇬🇧 English
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('zh')}
          className={`pb-3 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'zh' ? 'text-accent border-accent' : 'text-white/50 border-transparent hover:text-white'}`}
        >
          🇨🇳 Chinese
        </button>
      </div>

      <div className="pt-2">
        {/* THAI TAB */}
        <div className={`space-y-4 ${activeTab === 'th' ? 'block' : 'hidden'}`}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Title (Thai)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required={activeTab === 'th'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Content (Thai)</label>
            <RichTextEditor 
              value={formData.content}
              onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
              placeholder="Write your content in Thai..."
            />
          </div>
        </div>

        {/* ENGLISH TAB */}
        <div className={`space-y-4 ${activeTab === 'en' ? 'block' : 'hidden'}`}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Title (English)</label>
            <input
              type="text"
              name="titleEn"
              value={formData.titleEn}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Content (English)</label>
            <RichTextEditor 
              value={formData.contentEn}
              onChange={(val) => setFormData(prev => ({ ...prev, contentEn: val }))}
              placeholder="Write your content in English..."
            />
          </div>
        </div>

        {/* CHINESE TAB */}
        <div className={`space-y-4 ${activeTab === 'zh' ? 'block' : 'hidden'}`}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Title (Chinese)</label>
            <input
              type="text"
              name="titleZh"
              value={formData.titleZh}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Content (Chinese)</label>
            <RichTextEditor 
              value={formData.contentZh}
              onChange={(val) => setFormData(prev => ({ ...prev, contentZh: val }))}
              placeholder="Write your content in Chinese..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="isPublished" 
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="w-5 h-5 accent-accent"
        />
        <label htmlFor="isPublished" className="text-sm font-bold text-white">Publish this post</label>
      </div>

      <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
        <Link 
          href={`/${currentLang}/manage/blog`}
          className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-dark text-primary-dark text-xs font-bold px-8 py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Post"}
        </button>
      </div>
    </form>
  );
}
