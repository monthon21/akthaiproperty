import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface TestimonialProps {
  lang: string;
}

export default function Testimonials({ lang }: TestimonialProps) {
  const testimonials = [
    {
      id: 1,
      name: "Khun Pim & Family",
      location: "Oslo, Norway",
      role: lang === 'zh' ? "在春武里府购买房屋" : lang === 'en' ? "Purchasing a house in Chonburi" : "ซื้อบ้านที่ชลบุรี",
      content: lang === 'zh' 
        ? "AK Thai Property 让从挪威在泰国买房变得异常轻松。他们的贷款协助对我们家庭来说是巨大的帮助。非常深刻的印象！"
        : lang === 'en' 
          ? "AK Thai Property made buying a home in Thailand from Norway incredibly smooth. Their loan assistance was a game changer for our family."
          : "AK Thai Property ช่วยดูแลซื้อบ้านที่ไทยจากนอร์เวย์เป็นเรื่องง่ายมาก โดยเฉพาะบริการสินเชื่อที่ดูแลให้ตั้งแต่ต้นจนจบ ประทับใจมากค่ะ",
      rating: 5,
    },
    {
      id: 2,
      name: "Thai Expat & Spouse",
      location: "Singapore",
      role: lang === 'zh' ? "共同贷款" : lang === 'en' ? "Joint Loan" : "ยื่นกู้ร่วม",
      content: lang === 'zh'
        ? "我们在泰国拥有自己家的梦想成真了。作为一个在新加坡工作并与外籍配偶申请共同贷款的泰国人，团队包办了从找房到贷款的一切。他们甚至在验房当天使用了视频通话。距离从来不是问题。"
        : lang === 'en'
          ? "Our dream of having a home in Thailand came true. As a Thai working in Singapore applying for a joint loan with my foreign spouse, the team handled everything from finding the property to securing the loan. They even used video calls on inspection day. Distance was never an issue."
          : "ความฝันที่จะมีบ้านในไทยเป็นจริงได้ เราเป็นคนไทยที่ทำงานอยู่สิงคโปร์ ยื่นกู้ร่วมกับคู่สมรสต่างชาติ ทีมงานดูแลตั้งแต่หาทรัพย์ หาสินเชื่อ แม้แต่วันไปตรวจบ้าน ทีมงานยังใช้การวิดีโอคอล หมดปัญหาเรื่องระยะทาง.",
      rating: 5,
    },
    {
      id: 3,
      name: "Thai Expat",
      location: "USA",
      role: lang === 'zh' ? "在泰国出售房屋" : lang === 'en' ? "Sold a house in Thailand" : "ฝากขายบ้าน",
      content: lang === 'zh'
        ? "作为一个居住在美国的泰国人，我委托 AK Thai Property 出售我的房子。他们照顾房产，带客户看房，并以我非常满意的价格完成了销售。我几乎只需要飞回去进行最后的过户。非常专业的团队！"
        : lang === 'en'
          ? "As a Thai living in the USA, I entrusted AK Thai Property to sell my house. They took care of the property, brought in clients, and closed the sale at a price I was extremely happy with. I literally only had to fly back for the final transfer. Highly professional team!"
          : "เราเป็นคนไทยที่มาใช้ชีวิตใน USA ทำการฝากขายบ้านกับทาง AK Thai Property เค้าดูแลทรัพย์เรา พาลูกค้าไปชม จนปิดการขายได้ในราคาที่เราพอใจมากกก เรียกว่าบินกลับมาทำธุรกรรมการโอนอย่างเดียว ทีมงานเป็นมืออาชีพมากค่ะ",
      rating: 5,
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#0A192F] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-accent uppercase tracking-[0.3em] mb-4">
            {lang === 'zh' ? "客户真实评价" : lang === 'en' ? "Client Testimonials" : "เสียงจากผู้ใช้บริการจริง"}
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {lang === 'zh' ? "深受全球泰国人信赖" : lang === 'en' ? "Trusted by Thais Worldwide" : "ความไว้วางใจจากคนไทยทั่วโลก"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="premium-card p-8 md:p-10 rounded-2xl bg-[#112240] border border-white/5 hover:border-accent/30 transition-all duration-500 group relative"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-accent/10 transition-colors duration-500" />

              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-white/70 leading-relaxed mb-8 font-alt relative z-10 min-h-[120px]">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto border-t border-white/10 pt-6">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black text-lg border border-accent/30">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-accent mt-1">{testimonial.role}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
