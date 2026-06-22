import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/404-bg.png"
            alt="Luxury Real Estate"
            fill
            className="object-cover brightness-40 blur-sm scale-110"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-primary/80 via-primary/50 to-primary/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
          <h1 className="text-[12rem] md:text-[18rem] font-black text-white/10 leading-none select-none tracking-tighter mb-[-4rem] md:mb-[-6rem]">
            404
          </h1>
          
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Oops! <span className="text-accent">Page Not Found</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
              ขออภัย ไม่พบหน้าที่คุณต้องการ <br className="hidden md:block" /> 
              บ้านในฝันของคุณยังอยู่ตรงนี้ แต่อาจจะอยู่ผิดลิ้งก์ไปนิด
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link
                href="/"
                className="w-full sm:w-auto px-12 py-5 bg-accent text-white font-black rounded-2xl transition-all shadow-2xl shadow-accent/25 hover:bg-accent-dark hover:scale-105 active:scale-95 text-lg"
              >
                Back to Home
              </Link>
              
              <Link
                href="/contact"
                className="w-full sm:w-auto px-12 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-lg"
              >
                Talk to Expert
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10 hidden lg:block opacity-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-white"></div>
            <span className="text-white text-xs font-bold uppercase tracking-[0.5em]">AK Thai Property</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
