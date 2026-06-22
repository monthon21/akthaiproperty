"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  const content = {
    th: {
      title: "ข้อกำหนดและเงื่อนไข (Terms & Conditions)",
      lastUpdated: "อัปเดตล่าสุด: 22 มิถุนายน 2026",
      sections: [
        {
          title: "1. บทนำและการยอมรับเงื่อนไข",
          desc: "ยินดีต้อนรับสู่ AK Thai Property การเข้าถึงและใช้งานเว็บไซต์นี้หมายความว่าท่านตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ หากท่านไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณางดเว้นการใช้งานเว็บไซต์"
        },
        {
          title: "2. ข้อมูลอสังหาริมทรัพย์",
          desc: "ข้อมูล รูปภาพ ราคา และรายละเอียดของอสังหาริมทรัพย์ที่ปรากฏบนเว็บไซต์ มีวัตถุประสงค์เพื่อเป็นข้อมูลเบื้องต้นเท่านั้น AK Thai Property ขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อมูล หรือยกเลิกประกาศได้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า และเราไม่รับประกันความถูกต้องสมบูรณ์ของข้อมูลในทุกกรณี"
        },
        {
          title: "3. การใช้บริการเว็บไซต์",
          desc: "ท่านตกลงที่จะใช้เว็บไซต์นี้เพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมายเท่านั้น ห้ามมิให้คัดลอก ดัดแปลง ทำซ้ำ หรือนำข้อมูลบนเว็บไซต์ไปใช้เพื่อแสวงหาผลกำไรโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท"
        },
        {
          title: "4. บริการสินเชื่อและคำปรึกษา",
          desc: "การคำนวณสินเชื่อ ข้อมูลด้านการเงิน หรืออัตราดอกเบี้ยที่แสดงบนเว็บไซต์ เป็นเพียงการประมาณการเบื้องต้นเท่านั้น ผลการอนุมัติสินเชื่อและอัตราดอกเบี้ยจริงขึ้นอยู่กับการพิจารณาของสถาบันการเงินที่ท่านยื่นกู้"
        },
        {
          title: "5. ทรัพย์สินทางปัญญา",
          desc: "เนื้อหาทั้งหมดบนเว็บไซต์นี้ รวมถึงข้อความ รูปภาพ โลโก้ กราฟิก และซอฟต์แวร์ เป็นทรัพย์สินทางปัญญาของ AK Thai Property หรือผู้ให้อนุญาต และได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์"
        },
        {
          title: "6. การจำกัดความรับผิด",
          desc: "AK Thai Property จะไม่รับผิดชอบต่อความเสียหายใดๆ ไม่ว่าทางตรงหรือทางอ้อม ที่เกิดขึ้นจากการใช้งาน หรือความไม่สามารถในการใช้งานเว็บไซต์นี้ รวมถึงความเสียหายที่เกิดจากไวรัสคอมพิวเตอร์หรือข้อผิดพลาดของระบบ"
        },
        {
          title: "7. กฎหมายที่ใช้บังคับ",
          desc: "ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้บังคับของกฎหมายแห่งราชอาณาจักรไทย หากมีข้อพิพาทใดๆ ให้ยื่นฟ้องต่อศาลที่มีเขตอำนาจในประเทศไทย"
        }
      ]
    },
    en: {
      title: "Terms & Conditions",
      lastUpdated: "Last Updated: June 22, 2026",
      sections: [
        {
          title: "1. Introduction and Acceptance",
          desc: "Welcome to AK Thai Property. By accessing and using this website, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website."
        },
        {
          title: "2. Property Information",
          desc: "All information, images, prices, and property details shown on the website are for informational purposes only. AK Thai Property reserves the right to modify or remove listings without prior notice. We do not guarantee the absolute accuracy or completeness of the information provided."
        },
        {
          title: "3. Use of the Website",
          desc: "You agree to use this website only for lawful purposes. You are strictly prohibited from copying, modifying, reproducing, or commercially exploiting any content on this website without our prior written consent."
        },
        {
          title: "4. Mortgage and Consulting Services",
          desc: "Any mortgage calculations, financial estimates, or interest rates displayed on the website are approximations only. Actual loan approval and interest rates are subject to the discretion and policies of the respective financial institutions."
        },
        {
          title: "5. Intellectual Property",
          desc: "All content on this website, including texts, images, logos, graphics, and software, is the intellectual property of AK Thai Property or its licensors and is protected by copyright laws."
        },
        {
          title: "6. Limitation of Liability",
          desc: "AK Thai Property shall not be liable for any direct, indirect, incidental, or consequential damages arising out of your use or inability to use this website, including any damages caused by computer viruses or system errors."
        },
        {
          title: "7. Governing Law",
          desc: "These Terms and Conditions shall be governed by and construed in accordance with the laws of the Kingdom of Thailand. Any disputes shall be subject to the exclusive jurisdiction of the Thai courts."
        }
      ]
    },
    zh: {
      title: "条款与条件 (Terms & Conditions)",
      lastUpdated: "最后更新：2026年6月22日",
      sections: [
        {
          title: "1. 引言与接受",
          desc: "欢迎访问 AK Thai Property。访问和使用本网站即表示您同意遵守所有条款和条件。如果您不同意这些条款的任何部分，请勿使用本网站。"
        },
        {
          title: "2. 房产信息",
          desc: "网站上显示的所有信息、图片、价格和房产详情仅供参考。AK Thai Property 保留随时修改或删除房源信息的权利，恕不另行通知。我们不保证所提供信息的绝对准确性或完整性。"
        },
        {
          title: "3. 网站使用",
          desc: "您同意仅出于合法目的使用本网站。未经我们事先书面同意，严禁复制、修改、转载或将本网站的任何内容用于商业用途。"
        },
        {
          title: "4. 贷款与咨询服务",
          desc: "网站上显示的任何贷款计算、财务估算或利率均仅为近似值。实际贷款审批和利率取决于各金融机构的决定和政策。"
        },
        {
          title: "5. 知识产权",
          desc: "本网站上的所有内容，包括文本、图片、徽标、图形和软件，均为 AK Thai Property 或其许可方的知识产权，并受版权法保护。"
        },
        {
          title: "6. 责任限制",
          desc: "对于因您使用或无法使用本网站而引起的任何直接、间接、偶然或后果性损害，包括由计算机病毒或系统错误引起的任何损害，AK Thai Property 概不负责。"
        },
        {
          title: "7. 适用法律",
          desc: "这些条款和条件应受泰国王国法律管辖并据其解释。任何争议均应提交泰国法院专属管辖。"
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
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-accent tracking-widest mb-4">
              {pageData.title}
            </h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider">{pageData.lastUpdated}</p>
          </div>
          
          <div className="bg-[#112240] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8">
            {pageData.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl font-bold text-white border-l-2 border-accent pl-3">{section.title}</h2>
                <p className="text-white/70 leading-relaxed font-medium text-sm pl-4">
                  {section.desc}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
