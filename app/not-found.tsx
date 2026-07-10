import { Sarabun } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFoundContent from "@/components/NotFoundContent";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export default function NotFound() {
  return (
    <div className={`${sarabun.variable} flex flex-col min-h-screen bg-[#0A192F] antialiased`}>
      <Navbar />
      
      <NotFoundContent />

      <Footer />
    </div>
  );
}
