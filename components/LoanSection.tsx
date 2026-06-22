import Link from "next/link";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";

export default async function LoanSection({ lang = "th" }: { lang?: string }) {
  const dict = await getDictionary(lang as Locale);

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-primary">
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      <div className="absolute -right-32 top-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="relative">
          <div className="bg-[#112240]/90 border border-accent/25 p-12 relative z-10 rounded shadow-2xl">
            <h2 className="text-[10px] font-alt font-extrabold text-accent uppercase tracking-[0.35em] mb-6">{dict.loan_section.subtitle}</h2>
            <h3 className="text-4xl md:text-6xl font-display font-extrabold mb-8 leading-[1.15] text-white">
              {dict.loan_section.title_part1} <br /><span className="text-gradient">{dict.loan_section.title_part2}</span>
            </h3>
            
            <p className="font-alt text-sm text-white/55 leading-relaxed mb-10 max-w-lg font-medium">
              {dict.loan_section.desc}
            </p>
            
            <div className="space-y-5 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/35 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="font-alt font-bold text-xs text-white/80 tracking-wide">{dict.loan_section.feature_1}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/35 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="font-alt font-bold text-xs text-white/80 tracking-wide">{dict.loan_section.feature_2}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/35 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="font-alt font-bold text-xs text-white/80 tracking-wide">{dict.loan_section.feature_3}</span>
              </div>
            </div>
            
            <Link 
              href={`/${lang}/loan`} 
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-primary-dark font-alt font-black text-xs tracking-widest uppercase rounded hover:bg-accent-dark transition-all duration-300 shadow-xl shadow-accent/15 cursor-pointer"
            >
              {dict.loan_section.btn_consult}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute -top-10 -left-10 w-64 h-64 border border-accent/5 rounded-full opacity-30 pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-80 h-80 border-2 border-accent/5 rounded-full opacity-20 pointer-events-none"></div>
        </div>
        
        <div className="animate-fade-in order-first lg:order-last">
          <div className="relative rounded border border-accent/20 overflow-hidden bg-[#112240] p-3 shadow-2xl aspect-square">
            <div className="absolute inset-0 bg-primary-dark/40 flex items-center justify-center p-8">
              {/* Custom loan badge card layout */}
              <div className="w-full aspect-square bg-[#0A192F]/90 rounded border border-white/5 p-12 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-accent rounded shadow-xl flex items-center justify-center mb-8 transform -rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#171717" viewBox="0 0 256 256">
                    <path d="M224,48H32a16,16,0,0,0-16,16V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM128,128a32,32,0,1,1,32-32A32,32,0,0,1,128,128Z"></path>
                  </svg>
                </div>
                
                <h4 className="font-display font-bold text-2xl text-white mb-2">{dict.loan_section.best_loan}</h4>
                <p className="font-alt text-[9px] font-extrabold text-accent uppercase tracking-[0.25em] mb-10">{dict.loan_section.total_solution}</p>
                
                <div className="w-full bg-[#112240] border border-white/5 rounded p-5 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[8px] font-alt font-bold text-white/40 uppercase tracking-widest">{dict.loan_section.interest_rate}</p>
                    <p className="font-display text-xl font-bold text-accent">2.99%*</p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10"></div>
                  <div className="text-right">
                    <p className="text-[8px] font-alt font-bold text-white/40 uppercase tracking-widest">{dict.loan_section.term}</p>
                    <p className="font-display text-xl font-bold text-accent">30 {dict.loan_section.years}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

