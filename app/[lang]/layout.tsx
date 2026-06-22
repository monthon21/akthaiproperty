import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "../globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AK Thai Property | บ้านสวย สินเชื่อดี เพื่อคนไทย",
  description: "บริการรับฝากขาย เช่า บ้าน คอนโด ที่ดิน และบริการสินเชื่อบ้านสำหรับคนไทยในต่างประเทศ",
};

import StickyContact from "@/components/StickyContact";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang || "th"} className={`${sarabun.variable} h-full antialiased scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#0A192F]">
        {children}
        <StickyContact />
      </body>
    </html>
  );
}


