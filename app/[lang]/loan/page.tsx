"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import th from "@/lib/i18n/th.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";

const dictionaries = { th, en, zh };

export default function LoanPage() {
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

  const [loanAmount, setLoanAmount] = useState(3000000);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = monthlyRate > 0 ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments)) : (loanAmount / numPayments);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-32 flex-1 scroll-smooth">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
            <div>
              <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">{t("loan_page.title_part1")} <br /><span className="text-gradient">{t("loan_page.title_part2")}</span></h1>
              <p className="text-xl text-foreground/60 leading-relaxed mb-12">
                {t("loan_page.desc")}
              </p>
              
              <div className="space-y-8">
                <div className="premium-card p-8 group">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-accent rounded-full group-hover:h-8 transition-all"></span>
                    {t("loan_page.why_us")}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-foreground/60">
                    <li className="flex items-center gap-2">✓ {t("loan_page.benefit_1")}</li>
                    <li className="flex items-center gap-2">✓ {t("loan_page.benefit_2")}</li>
                    <li className="flex items-center gap-2">✓ {t("loan_page.benefit_3")}</li>
                    <li className="flex items-center gap-2">✓ {t("loan_page.benefit_4")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="premium-card p-10 glass border-accent/20 sticky top-24">
              <h3 className="text-2xl font-black mb-8 text-center text-accent">{t("loan_page.calc_title")}</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{t("loan_page.loan_amount")}</label>
                    <input 
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                      className="w-36 bg-black/30 border border-accent/20 rounded px-3 py-1 text-right text-xl font-black text-accent focus:outline-none focus:border-accent"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="1000000" 
                    max="20000000" 
                    step="100000" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-accent h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{t("loan_page.interest")}</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                      className="w-24 bg-black/30 border border-accent/20 rounded px-3 py-1 text-right text-xl font-black text-accent focus:outline-none focus:border-accent"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.1" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-accent h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{t("loan_page.term")}</label>
                    <input 
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value) || 0)}
                      className="w-24 bg-black/30 border border-accent/20 rounded px-3 py-1 text-right text-xl font-black text-accent focus:outline-none focus:border-accent"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    step="1" 
                    value={loanTerm} 
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full accent-accent h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="pt-8 border-t border-foreground/5 text-center">
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.4em] mb-4">{t("loan_page.monthly_payment")}</p>
                  <p className="text-5xl font-black text-accent mb-2">฿{Math.round(monthlyPayment || 0).toLocaleString()}</p>
                  <p className="text-xs text-foreground/30 font-medium">{t("loan_page.estimate_only")}</p>
                </div>

                <button className="w-full py-5 bg-accent text-white rounded-2xl font-black text-lg shadow-xl shadow-accent/20 hover:bg-accent-dark transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                  {t("loan_page.btn_apply")}
                </button>
              </div>
            </div>
          </div>
          
          <div className="py-24 border-t border-foreground/5">
            <h2 className="text-sm font-bold text-accent uppercase tracking-[0.3em] mb-12 text-center">{t("loan_page.steps_title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { step: "01", title: t("loan_page.step1_title"), desc: t("loan_page.step1_desc") },
                { step: "02", title: t("loan_page.step2_title"), desc: t("loan_page.step2_desc") },
                { step: "03", title: t("loan_page.step3_title"), desc: t("loan_page.step3_desc") },
                { step: "04", title: t("loan_page.step4_title"), desc: t("loan_page.step4_desc") }
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="text-6xl font-black text-foreground/5 absolute -top-8 -left-2 tracking-tighter group-hover:text-accent/5 transition-colors">{item.step}</div>
                  <h4 className="text-xl font-extrabold mb-4 relative z-10">{item.title}</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
