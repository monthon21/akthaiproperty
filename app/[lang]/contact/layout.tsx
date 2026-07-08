import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา | AK Thai Property",
  description: "ติดต่อ AK Thai Property สอบถามข้อมูลอสังหาริมทรัพย์ บ้าน คอนโด ที่ดิน หรือสินเชื่อบ้าน โทร 082-444-8989 หรือ LINE @akproperty",
  openGraph: {
    title: "ติดต่อเรา | AK Thai Property",
    description: "ติดต่อสอบถามข้อมูลอสังหาริมทรัพย์ โทร 082-444-8989 หรือ LINE @akproperty",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
