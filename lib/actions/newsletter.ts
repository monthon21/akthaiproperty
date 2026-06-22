"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function subscribeToNewsletterAction(formData: FormData) {
  try {
    const email = formData.get("email");

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Reactivate if they previously unsubscribed
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: { isActive: true }
        });
        return { success: true, message: "Subscription reactivated successfully!" };
      }
      return { success: false, error: "This email is already subscribed." };
    }

    // Save new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        isActive: true
      }
    });

    return { success: true, message: "Successfully subscribed to the newsletter!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Failed to subscribe. Please try again later." };
  }
}
