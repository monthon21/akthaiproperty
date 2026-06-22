"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  const content = {
    th: {
      title: "นโยบายความเป็นส่วนตัว (Privacy Policy)",
      lastUpdated: "อัปเดตล่าสุด: 22 มิถุนายน 2026",
      sections: [
        {
          title: "1. การเก็บรวบรวมข้อมูลส่วนบุคคล",
          desc: "AK Thai Property เก็บรวบรวมข้อมูลส่วนบุคคลของคุณเมื่อคุณลงทะเบียนบัญชี, ติดต่อสอบถาม, นัดหมายเข้าชมโครงการ, หรือสมัครรับข่าวสาร ข้อมูลที่เราเก็บรวมถึง ชื่อ, นามสกุล, เบอร์โทรศัพท์, อีเมล, ข้อมูลความสนใจในอสังหาริมทรัพย์ และข้อมูลการใช้งานเว็บไซต์ผ่านคุกกี้ (Cookies)"
        },
        {
          title: "2. วัตถุประสงค์ในการใช้ข้อมูล",
          desc: "เราใช้ข้อมูลของคุณเพื่อติดต่อกลับเกี่ยวกับการสอบถามอสังหาริมทรัพย์, การนัดหมายเข้าชม, ประเมินคุณสมบัติสินเชื่อเบื้องต้น, ส่งข้อมูลอัปเดตโครงการใหม่หรือโปรโมชั่นที่ตรงกับความสนใจของคุณ และเพื่อปรับปรุงประสิทธิภาพการทำงานของเว็บไซต์ให้ตอบสนองผู้ใช้งานได้ดียิ่งขึ้น"
        },
        {
          title: "3. การเปิดเผยข้อมูลแก่บุคคลที่สาม",
          desc: "เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอก อย่างไรก็ตาม เราอาจจำเป็นต้องส่งต่อข้อมูลของคุณให้แก่พันธมิตรที่เกี่ยวข้อง เช่น เจ้าของทรัพย์สิน, สถาบันการเงิน (เพื่อประกอบการพิจารณาสินเชื่อ), หรือผู้ให้บริการด้านเทคนิค เพื่อให้บรรลุวัตถุประสงค์ในการให้บริการแก่คุณ"
        },
        {
          title: "4. การรักษาความปลอดภัยของข้อมูล",
          desc: "เรามีมาตรการเชิงเทคนิคและการจัดการที่เข้มงวดเพื่อป้องกันการเข้าถึง, การแก้ไข, การสูญหาย, หรือการเปิดเผยข้อมูลส่วนบุคคลของคุณโดยไม่ได้รับอนุญาต ระบบของเรามีการเข้ารหัสข้อมูล (Encryption) และจำกัดสิทธิ์การเข้าถึงข้อมูลเฉพาะพนักงานที่เกี่ยวข้องเท่านั้น"
        },
        {
          title: "5. สิทธิของเจ้าของข้อมูล (PDPA)",
          desc: "ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิขอเข้าถึง, แก้ไข, ระงับการใช้, หรือลบข้อมูลส่วนบุคคลของคุณที่อยู่ในการดูแลของเรา รวมถึงสิทธิในการยกเลิกความยินยอมในการรับข่าวสารการตลาดได้ตลอดเวลา โดยติดต่อเราผ่านช่องทางที่ระบุไว้บนเว็บไซต์"
        },
        {
          title: "6. การใช้คุกกี้ (Cookies)",
          desc: "เว็บไซต์ของเรามีการใช้งานคุกกี้เพื่อจดจำการตั้งค่าการใช้งานของคุณ, ติดตามพฤติกรรมการเข้าชมเว็บไซต์เพื่อนำไปปรับปรุงประสบการณ์การใช้งาน หากคุณไม่ต้องการให้เราใช้คุกกี้ คุณสามารถตั้งค่าปิดการใช้งานคุกกี้ได้ที่เบราว์เซอร์ของคุณ"
        },
        {
          title: "7. การเปลี่ยนแปลงนโยบาย",
          desc: "เราอาจทำการปรับปรุงหรือแก้ไขนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว เพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางกฎหมายหรือการดำเนินธุรกิจของเรา การเปลี่ยนแปลงใดๆ จะถูกประกาศให้ทราบผ่านทางหน้านี้"
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: June 22, 2026",
      sections: [
        {
          title: "1. Collection of Personal Data",
          desc: "AK Thai Property collects personal information when you register an account, make an inquiry, schedule a property viewing, or subscribe to our newsletter. The data we collect includes your name, phone number, email address, property preferences, and website usage data via Cookies."
        },
        {
          title: "2. Purpose of Data Usage",
          desc: "We use your data to respond to your property inquiries, schedule viewings, pre-evaluate mortgage eligibility, send relevant updates on new projects or promotions, and to improve our website's performance and user experience."
        },
        {
          title: "3. Disclosure to Third Parties",
          desc: "We will never sell or rent your personal data to third parties. However, we may share your information with necessary partners such as property owners, financial institutions (for mortgage processing), or technical service providers to fulfill the services requested by you."
        },
        {
          title: "4. Data Security",
          desc: "We implement strict technical and organizational measures to prevent unauthorized access, alteration, loss, or disclosure of your personal data. Our systems use data encryption and restrict access only to authorized personnel."
        },
        {
          title: "5. User Rights (PDPA)",
          desc: "Under the Personal Data Protection Act (PDPA), you have the right to access, rectify, suspend, or delete your personal data stored with us. You also have the right to withdraw your consent for marketing communications at any time by contacting us through the channels provided on our website."
        },
        {
          title: "6. Use of Cookies",
          desc: "Our website uses cookies to remember your preferences and analyze browsing behavior to enhance your user experience. If you prefer not to use cookies, you can disable them through your browser settings."
        },
        {
          title: "7. Changes to the Policy",
          desc: "We may update or modify this Privacy Policy from time to time to reflect changes in legal requirements or our business operations. Any updates will be published directly on this page."
        }
      ]
    },
    zh: {
      title: "隐私政策 (Privacy Policy)",
      lastUpdated: "最后更新：2026年6月22日",
      sections: [
        {
          title: "1. 个人信息的收集",
          desc: "当您注册账户、进行咨询、预约看房或订阅我们的新闻通讯时，AK Thai Property 会收集您的个人信息。我们收集的数据包括您的姓名、电话号码、电子邮件地址、房产偏好以及通过 Cookie 收集的网站使用数据。"
        },
        {
          title: "2. 数据使用的目的",
          desc: "我们将您的数据用于回复您的房产咨询、安排看房、预估贷款资格、向您发送您可能感兴趣的新项目或促销信息的更新，以及改善我们网站的性能和用户体验。"
        },
        {
          title: "3. 向第三方披露",
          desc: "我们绝不会向第三方出售或出租您的个人数据。但是，为了履行您要求的服务，我们可能会与必要的合作伙伴分享您的信息，例如房主、金融机构（用于抵押贷款处理）或技术服务提供商。"
        },
        {
          title: "4. 数据安全",
          desc: "我们采取严格的技术和组织措施，以防止未经授权的访问、更改、丢失或披露您的个人数据。我们的系统使用数据加密，并仅限制授权人员访问。"
        },
        {
          title: "5. 用户权利 (PDPA)",
          desc: "根据《个人数据保护法》(PDPA)，您有权访问、纠正、暂停使用或删除我们存储的您的个人数据。您还可以随时通过我们网站上提供的渠道联系我们，撤回对接收营销通信的同意。"
        },
        {
          title: "6. Cookie 的使用",
          desc: "我们的网站使用 Cookie 来记住您的偏好并分析浏览行为，以增强您的用户体验。如果您不想使用 Cookie，可以通过浏览器设置将其禁用。"
        },
        {
          title: "7. 政策变更",
          desc: "我们可能会不时更新或修改本隐私政策，以反映法律要求或我们业务运营的变更。任何更新都将直接发布在此页面上。"
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
