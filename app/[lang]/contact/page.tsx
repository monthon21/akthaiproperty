"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitContactAction } from "@/lib/actions/contact";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

export default function ContactPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentLang = (pathParts[1] && ["th", "en", "zh"].includes(pathParts[1])) ? pathParts[1] : "th";

  const t = (key: string) => {
    const keys = key.split(".");
    let result: any = dictionaries[currentLang as keyof typeof dictionaries];
    for (const k of keys) {
      if (result) {
        result = result[k];
      }
    }
    return result || key;
  };
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    subject: t("contact_page.subject_1"),
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsSuccess(false);

    try {
      const response = await submitContactAction(formData);
      if (response.success) {
        setIsSuccess(true);
        setFormData({
          fullname: "",
          phone: "",
          subject: t("contact_page.subject_1"),
          message: ""
        });
      } else {
        setErrorMessage(response.error || t("contact_page.error_title"));
      }
    } catch (err: any) {
      setErrorMessage(t("contact_page.error_title"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-36 pb-24 bg-[#0A192F] text-white min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left Column: Contact details */}
            <div className="space-y-10">
              <div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-2">{t("contact_page.subtitle")}</span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
                  {t("contact_page.title_part1")} <br />
                  <span className="text-accent italic font-display">AK THAI PROPERTY</span>
                </h1>
                <p className="text-base text-white/60 leading-relaxed max-w-lg">
                  {t("contact_page.desc")}
                </p>
              </div>
              
              <div className="space-y-8 pt-4 border-t border-white/5">
                {/* Phone Contact */}
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center text-accent shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t("contact_page.phone")}</h4>
                    <a href="tel:0824448989" className="text-xl md:text-2xl font-black text-white hover:text-accent transition-colors">082-444-8989</a>
                    <p className="text-xs text-white/50 mt-0.5">{t("contact_page.phone_desc")}</p>
                  </div>
                </div>
                
                {/* Email Contact */}
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center text-accent shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t("contact_page.email")}</h4>
                    <a href="mailto:contact@akthaiproperty.com" className="text-xl md:text-2xl font-black text-white hover:text-accent transition-colors">contact@akthaiproperty.com</a>
                    <p className="text-xs text-white/50 mt-0.5">{t("contact_page.email_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact form */}
            <div className="bg-[#112240] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Gold light accent blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10"></div>
              
              <h3 className="text-xl font-bold text-accent uppercase tracking-wider mb-6 pb-3 border-b border-white/5">
                {t("contact_page.form_title")}
              </h3>
              
              {/* Feedback messages */}
              {isSuccess && (
                <div className="bg-accent/10 border border-accent/30 text-accent rounded-xl p-5 mb-6 text-center space-y-2 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-wider">{t("contact_page.success_title")}</p>
                  <p className="text-[10px] text-white/70">{t("contact_page.success_desc")}</p>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-5 mb-6 text-center space-y-1 animate-fade-in">
                  <p className="text-xs font-bold uppercase tracking-wider">{t("contact_page.error_title")}</p>
                  <p className="text-[10px] text-white/80">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">{t("contact_page.label_name")}</label>
                    <input 
                      type="text" 
                      name="fullname"
                      required
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium" 
                      placeholder={t("contact_page.ph_name")} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">{t("contact_page.label_phone")}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium" 
                      placeholder="08X-XXX-XXXX" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">{t("contact_page.label_subject")}</label>
                  <div className="relative">
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-accent transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option className="bg-[#112240] text-white" value={t("contact_page.subject_1")}>{t("contact_page.subject_1")}</option>
                      <option className="bg-[#112240] text-white" value={t("contact_page.subject_2")}>{t("contact_page.subject_2")}</option>
                      <option className="bg-[#112240] text-white" value={t("contact_page.subject_3")}>{t("contact_page.subject_3")}</option>
                      <option className="bg-[#112240] text-white" value={t("contact_page.subject_4")}>{t("contact_page.subject_4")}</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/40">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">{t("contact_page.label_message")}</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full h-36 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all font-medium resize-none leading-relaxed" 
                    placeholder={t("contact_page.ph_message")}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-accent text-primary-dark rounded-xl font-black text-xs tracking-widest uppercase shadow-lg shadow-accent/10 hover:bg-accent-dark transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? t("contact_page.btn_submitting") : t("contact_page.btn_submit")}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
