import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สินเชื่อบ้าน | AK Thai Property",
  description: "บริการสินเชื่อบ้านสำหรับคนไทยในต่างประเทศ คำนวณวงเงินกู้ ดอกเบี้ย และผ่อนชำระรายเดือน โดยผู้เชี่ยวชาญ AK Thai Property",
  openGraph: {
    title: "สินเชื่อบ้าน | AK Thai Property",
    description: "บริการสินเชื่อบ้านสำหรับคนไทยในต่างประเทศ คำนวณวงเงินกู้ และผ่อนชำระรายเดือนได้ทันที",
  },
};

export default function LoanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
