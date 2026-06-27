import Link from "next/link";
import { getDictionary, Locale } from "@/lib/i18n/dictionaries";

export default async function ServiceCards({ lang = "th", bgColor = "bg-primary" }: { lang?: string; bgColor?: string }) {
  const dict = await getDictionary(lang as Locale);

  const services = [
    {
      id: 'buy',
      title: dict.services.buy_title,
      description: dict.services.buy_desc,
      icon: (
        <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      href: `/${lang}/buy`,
      accent: 'bg-accent'
    },
    {
      id: 'rent',
      title: dict.services.rent_title,
      description: dict.services.rent_desc,
      icon: (
        <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      href: `/${lang}/rent`,
      accent: 'bg-accent-light'
    },
    {
      id: 'loan',
      title: dict.services.loan_title,
      description: dict.services.loan_desc,
      icon: (
        <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h19.5m-19.5 0h19.5M4 18h16a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      href: `/${lang}/loan`,
      accent: 'bg-accent-dark'
    }
  ];

  return (
    <section className={`py-24 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-alt font-extrabold text-accent uppercase tracking-[0.35em] mb-4">{dict.services.subtitle}</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
            {dict.services.title} <span className="text-gradient">AK THAI</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service) => (
            <Link 
              key={service.id} 
              href={service.href}
              className="bg-[#112240] border border-white/5 p-10 group relative overflow-hidden rounded transition-all duration-300 hover:border-accent hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1"
            >
              {/* Background accent line effect */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              
              <div className="mb-8 transform group-hover:scale-105 transition-transform duration-500 origin-left">
                {service.icon}
              </div>
              
              <h4 className="text-xl font-display font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">
                {service.title}
              </h4>
              
              <p className="font-alt text-xs text-white/55 leading-relaxed mb-8 font-medium">
                {service.description}
              </p>
              
              <div className="inline-flex items-center gap-2 font-alt font-bold text-xs tracking-widest text-accent uppercase">
                <span>{dict.services.read_more}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

