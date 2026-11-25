import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { LocationSummary } from "@/lib/locations";

export default function LocationCard({
  location,
  lang,
  listingsLabel,
}: {
  location: LocationSummary;
  lang: string;
  listingsLabel: string;
}) {
  return (
    <Link
      href={`/${lang}${location.href}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-[#112240] border border-white/5 hover:border-accent/40 transition-all duration-500"
    >
      {location.image ? (
        <Image
          src={location.image}
          alt={`${location.district} ${location.province}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#112240] to-[#0A192F]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <div className="flex items-center gap-1.5 text-accent text-[10px] font-alt font-bold uppercase tracking-widest mb-1">
          <MapPin className="w-3 h-3" />
          {location.province}
        </div>
        <h4 className="text-lg md:text-xl font-display font-bold text-white leading-tight">{location.district}</h4>
        <p className="text-[11px] text-white/60 mt-1 font-alt">
          {location.count} {listingsLabel}
        </p>
      </div>
    </Link>
  );
}
