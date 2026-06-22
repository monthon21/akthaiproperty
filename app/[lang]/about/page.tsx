import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-32 flex-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
            <div className="relative aspect-square">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-6"></div>
              <div className="absolute inset-0 premium-card glass border-primary/10 flex items-center justify-center p-12 overflow-hidden">
                <div className="w-full h-full bg-primary/20 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  <span className="text-8xl font-black text-primary opacity-20 transform -rotate-12">AK THAI</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.4em] mb-6">Our Story</h2>
              <h3 className="text-4xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">ผู้นำด้านอสังหาฯ และ <br /><span className="text-primary italic">สินเชื่อเพื่อคนไทย</span></h3>
              <p className="text-xl text-foreground/60 leading-relaxed mb-8">
                AK THAI Property ก่อตั้งขึ้นด้วยความมุ่งมั่นที่จะเป็น "สะพาน" เชื่อมต่อคนไทยทั่วโลกสู่การเป็นเจ้าของบ้านที่สมบูรณ์แบบ
              </p>
              <p className="text-lg text-foreground/40 leading-relaxed">
                เราเชี่ยวชาญพิเศษด้านการให้คำปรึกษาสินเชื่อสำหรับคนไทยที่ทำงานในต่างประเทศ โดยร่วมมือกับธนาคารชั้นนำของไทยเพื่อออกแบบโซลูชันที่เหมาะสมที่สุดสำหรับรายได้และที่มาของเงินทุนจากต่างแดน
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-24 border-y border-foreground/5 mb-32">
            <div className="text-center group">
              <div className="text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">10+</div>
              <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.4em]">Years in business</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">2,500+</div>
              <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.4em]">Properties Sold</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">1,200+</div>
              <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.4em]">Loans Approved</div>
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h4 className="text-3xl font-black mb-6">วิสัยทัศน์ของเรา</h4>
            <p className="text-xl text-foreground/60 italic leading-relaxed">
              "เป็นที่หนึ่งในใจของคนไทยในต่างแดน เมื่อต้องการมีบ้านในไทย"
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
