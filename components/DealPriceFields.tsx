"use client";

interface Props {
  isSell: boolean;
  isRent: boolean;
  sellPrice: string;
  loanPrice: string;
  /** the form's shared change handler (reads name / checked / value from the event) */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OPTIONS = [
  { flag: "isSell", price: "sellPrice", label: "ขาย", sub: "Sell", priceLabel: "ราคาขาย", unit: "บาท", placeholder: "เช่น 12,500,000" },
  { flag: "isRent", price: "loanPrice", label: "เช่า", sub: "Rent", priceLabel: "ค่าเช่าต่อเดือน", unit: "บาท/เดือน", placeholder: "เช่น 75,000" },
] as const;

/**
 * Sell / rent toggles, each with its price right beside it.
 * The price box is only enabled while its toggle is on.
 */
export default function DealPriceFields(props: Props) {
  return (
    <div className="md:col-span-3 space-y-1.5">
      <span className="text-xs font-bold text-white/40 uppercase tracking-widest block">ขาย / เช่า และราคา *</span>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const checked = props[opt.flag];
          return (
            <div
              key={opt.flag}
              className={`flex items-stretch gap-2 p-2 rounded-2xl border transition-colors ${
                checked ? "border-accent/50 bg-accent/5" : "border-white/10 bg-black/20"
              }`}
            >
              <label
                className={`flex items-center justify-center gap-2 w-32 shrink-0 h-12 rounded-xl border-2 cursor-pointer select-none transition-all active:scale-95 focus-within:ring-2 focus-within:ring-accent/40 ${
                  checked
                    ? "bg-accent border-accent text-primary-dark shadow-lg shadow-accent/20"
                    : "bg-black/30 border-white/15 text-white/60 hover:border-accent/50 hover:text-white"
                }`}
              >
                <input type="checkbox" name={opt.flag} checked={checked} onChange={props.onChange} className="sr-only" />
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 ${
                    checked ? "bg-primary-dark border-primary-dark text-accent" : "border-white/30"
                  }`}
                >
                  {checked && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-black">{opt.label}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${checked ? "text-primary-dark/60" : "text-white/30"}`}>{opt.sub}</span>
              </label>

              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  inputMode="numeric"
                  name={opt.price}
                  aria-label={opt.priceLabel}
                  placeholder={checked ? `${opt.priceLabel} ${opt.placeholder}` : `เลือก “${opt.label}” เพื่อใส่ราคา`}
                  value={props[opt.price]}
                  onChange={props.onChange}
                  disabled={!checked}
                  className="w-full h-12 bg-black/45 border border-white/10 rounded-xl pl-4 pr-24 text-base font-semibold focus:outline-none focus:border-accent text-white placeholder:text-xs placeholder:font-normal placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-black/20"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">{opt.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
