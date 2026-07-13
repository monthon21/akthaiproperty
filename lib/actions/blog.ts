"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return { success: false, error: "Failed to fetch blog posts" };
  }
}

export async function getPublishedBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching published blog posts:", error);
    return { success: false, error: "Failed to fetch published blog posts" };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) {
      return { success: false, error: "Blog post not found" };
    }
    return { success: true, post };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return { success: false, error: "Failed to fetch blog post" };
  }
}

export async function createBlogPost(data: any) {
  try {
    // Use numeric timestamp as slug by default (works across all 3 languages)
    const slug = data.slug && data.slug.trim() ? data.slug.trim() : String(Date.now());
    
    // Ensure slug is unique
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

    const post = await prisma.blogPost.create({
      data: {
        slug: finalSlug,
        title: data.title,
        content: data.content,
        titleEn: data.titleEn || null,
        contentEn: data.contentEn || null,
        titleZh: data.titleZh || null,
        contentZh: data.contentZh || null,
        imageUrl: data.imageUrl || null,
        isPublished: data.isPublished || false,
      },
    });
    
    revalidatePath("/blog");
    revalidatePath("/[lang]/blog");
    revalidatePath("/manage/blog");
    
    return { success: true, post };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { success: false, error: "Failed to create blog post" };
  }
}

export async function updateBlogPost(id: string, data: any) {
  try {
    const post = await prisma.blogPost.update({
      where: { id: parseInt(id, 10) },
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        titleEn: data.titleEn || null,
        contentEn: data.contentEn || null,
        titleZh: data.titleZh || null,
        contentZh: data.contentZh || null,
        imageUrl: data.imageUrl || null,
        isPublished: data.isPublished,
      },
    });
    
    revalidatePath("/blog");
    revalidatePath("/[lang]/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/manage/blog");
    
    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { success: false, error: "Failed to update blog post" };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id: parseInt(id, 10) },
    });
    
    revalidatePath("/blog");
    revalidatePath("/[lang]/blog");
    revalidatePath("/manage/blog");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: "Failed to delete blog post" };
  }
}
