"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const content = {
    th: {
      title: "คำถามที่พบบ่อย (FAQ)",
      subtitle: "รวมคำตอบสำหรับทุกข้อสงสัยเกี่ยวกับการซื้อ-ขาย และเช่าอสังหาริมทรัพย์",
      faqs: [
        {
          q: "ขั้นตอนการซื้อบ้านหรือคอนโดกับ AK Thai Property ต้องทำอย่างไรบ้าง?",
          a: "เริ่มต้นจากการเลือกชมทรัพย์ที่คุณสนใจบนเว็บไซต์ จากนั้นสามารถติดต่อเราเพื่อขอนัดหมายเข้าชมสถานที่จริง หากพึงพอใจ ทีมงานของเราจะช่วยดูแลเรื่องการทำสัญญา วางเงินมัดจำ และอำนวยความสะดวกในการยื่นขอสินเชื่อจนถึงขั้นตอนการโอนกรรมสิทธิ์"
        },
        {
          q: "หากต้องการฝากขายหรือปล่อยเช่าทรัพย์สิน ต้องเตรียมเอกสารอะไรบ้าง?",
          a: "เอกสารที่จำเป็นเบื้องต้น ได้แก่ สำเนาโฉนดที่ดิน (หน้า-หลัง), สำเนาบัตรประชาชน, ทะเบียนบ้าน, และรูปถ่ายทรัพย์สิน หากคุณมีข้อมูลหรือเอกสารเหล่านี้ครบถ้วน สามารถติดต่อทีมงานเพื่อประเมินราคาและทำการตลาดได้ทันที"
        },
        {
          q: "ทางบริษัทมีบริการช่วยเดินเรื่องสินเชื่อธนาคารให้หรือไม่?",
          a: "มีครับ เรามีพันธมิตรเป็นสถาบันการเงินชั้นนำหลายแห่ง ทีมงานของเรายินดีให้คำปรึกษาและช่วยประเมินวงเงินเบื้องต้น พร้อมทั้งช่วยดำเนินการยื่นเอกสารขอสินเชื่อให้ฟรีโดยไม่มีค่าใช้จ่ายเพิ่มเติม"
        },
        {
          q: "ค่าธรรมเนียมการโอนและภาษี ใครเป็นผู้รับผิดชอบ?",
          a: "โดยทั่วไปแล้ว ค่าธรรมเนียมการโอนกรรมสิทธิ์จะแบ่งจ่ายฝ่ายละครึ่ง (50:50) ระหว่างผู้ซื้อและผู้ขาย ส่วนค่าภาษีธุรกิจเฉพาะและภาษีเงินได้บุคคลธรรมดา ผู้ขายมักจะเป็นผู้รับผิดชอบ ทั้งนี้ขึ้นอยู่กับการตกลงกันในสัญญาจะซื้อจะขาย"
        },
        {
          q: "สามารถนัดชมบ้านในวันเสาร์-อาทิตย์ หรือวันหยุดนักขัตฤกษ์ได้หรือไม่?",
          a: "ได้แน่นอนครับ ทีมงาน AK Thai Property ยินดีให้บริการและนัดหมายพาชมทรัพย์สินได้ทุกวัน (รวมถึงวันหยุด) เพียงแค่แจ้งล่วงหน้า 1-2 วัน เพื่อให้เราเตรียมความพร้อมและนัดหมายกับเจ้าของบ้านครับ"
        }
      ]
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about buying, selling, and renting properties.",
      faqs: [
        {
          q: "What is the process of buying a property with AK Thai Property?",
          a: "Start by browsing properties on our website. Once you find one you like, contact us to schedule a viewing. If you decide to proceed, our team will assist you with the contract, deposit, mortgage application, and final ownership transfer."
        },
        {
          q: "What documents are required to list a property for sale or rent?",
          a: "Basic documents include a copy of the title deed (front and back), copy of ID card, house registration, and clear photos of the property. Once you have these ready, contact our team to evaluate the price and begin marketing."
        },
        {
          q: "Do you provide assistance with bank mortgages?",
          a: "Yes, we do. We partner with several leading financial institutions. Our team is happy to provide consultations, estimate your loan capacity, and assist with the mortgage application process free of charge."
        },
        {
          q: "Who is responsible for the transfer fees and taxes?",
          a: "Generally, the ownership transfer fee is shared equally (50:50) between the buyer and the seller. Specific business taxes and personal income taxes are usually paid by the seller. However, this can be negotiated in the sales contract."
        },
        {
          q: "Can I schedule a property viewing on weekends or public holidays?",
          a: "Absolutely. The AK Thai Property team is available every day, including weekends and holidays. Please notify us 1-2 days in advance so we can arrange the viewing with the property owner."
        }
      ]
    },
    zh: {
      title: "常见问题 (FAQ)",
      subtitle: "查找关于购买、出售和租赁房产的常见问题解答。",
      faqs: [
        {
          q: "在 AK Thai Property 购买房产的流程是怎样的？",
          a: "首先在我们的网站上浏览您感兴趣的房产。然后联系我们预约实地看房。如果您决定购买，我们的团队将协助您处理合同、支付定金、申请贷款直至最终的产权过户手续。"
        },
        {
          q: "委托出售或出租房产需要准备哪些文件？",
          a: "基本文件包括地契副本（正反面）、身份证副本、户口本以及房产的清晰照片。准备好这些后，您可以联系我们的团队进行价格评估并开始市场推广。"
        },
        {
          q: "你们提供银行贷款的协助服务吗？",
          a: "是的，我们提供。我们与多家领先的金融机构有合作关系。我们的团队很乐意为您提供免费咨询、预估贷款额度，并协助您提交贷款申请文件。"
        },
        {
          q: "过户费和税费由谁承担？",
          a: "一般来说，产权过户费由买卖双方各承担一半（50:50）。特定营业税和个人所得税通常由卖家承担。具体情况可根据买卖合同中的约定进行协商。"
        },
        {
          q: "我可以在周末或公众假期预约看房吗？",
          a: "当然可以。AK Thai Property 团队每天（包括周末和节假日）均可提供服务。请提前1-2天通知我们，以便我们与房主协调安排。"
        }
      ]
    }
  };

  const pageData = content[currentLang as keyof typeof content] || content.th;

  return (
    <>
      <Navbar />
      <main className="pt-36 pb-24 bg-[#0A192F] text-white min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-accent tracking-widest uppercase mb-4">
              {pageData.title}
            </h1>
            <p className="text-white/60 text-sm md:text-base font-medium">{pageData.subtitle}</p>
          </div>
          
          <div className="space-y-4">
            {pageData.faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`bg-[#112240] border transition-all duration-300 rounded-xl overflow-hidden shadow-lg ${openIndex === idx ? 'border-accent' : 'border-white/10'}`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                >
                  <h3 className={`font-bold pr-8 transition-colors ${openIndex === idx ? 'text-accent' : 'text-white'}`}>
                    {faq.q}
                  </h3>
                  <div className={`transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-accent' : 'text-white/40'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 border-t border-white/5 mt-2">
                    <p className="text-white/70 leading-relaxed font-medium text-sm">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
