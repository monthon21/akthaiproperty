"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteAssetAction, toggleAssetAvailabilityAction, toggleAssetRecommendationAction } from "@/lib/actions/asset";
import { Eye, Edit, Trash2 } from "lucide-react";

const formatNumberWithCommas = (value: string) => {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return "";
  return parseInt(clean, 10).toLocaleString();
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  DETACHED_HOUSE: "บ้านเดี่ยว",
  TOWNHOUSE: "ทาวน์เฮาส์",
  SEMI_DETACHED: "บ้านแฝด",
  VILLA: "วิลล่า",
  APARTMENT: "อพาร์ทเม้นท์",
  WAREHOUSE: "โกดัง",
  FACTORY: "โรงงาน",
  OFFICE: "ออฟฟิศ",
  RETAIL: "ร้านค้า",
  COMMERCIAL: "อาคารพาณิชย์",
  LAND: "ที่ดินเปล่า",
  OTHER: "อื่นๆ",
};

const ASSET_TYPE_GROUPS: { label: string; types: string[] }[] = [
  { label: "ที่อยู่อาศัย", types: ["DETACHED_HOUSE", "TOWNHOUSE", "SEMI_DETACHED", "VILLA", "APARTMENT"] },
  { label: "อุตสาหกรรม", types: ["WAREHOUSE", "FACTORY"] },
  { label: "พาณิชย์", types: ["OFFICE", "RETAIL", "COMMERCIAL"] },
  { label: "ที่ดินและอื่นๆ", types: ["LAND", "OTHER"] },
];

export default function ManageAssetsClient({ initialAssets, currentLang, isAdmin = false }: { initialAssets: any[], currentLang: string, isAdmin?: boolean }) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dealType, setDealType] = useState("all");
  const [assetType, setAssetType] = useState("all");

  // Filters take effect when "ค้นหา" is pressed (or Enter), not on every keystroke
  const EMPTY_FILTERS = { searchQuery: "", minPrice: "", maxPrice: "", dealType: "all", assetType: "all" };
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const draft = { searchQuery, minPrice, maxPrice, dealType, assetType };
  const hasDraft = JSON.stringify(draft) !== JSON.stringify(EMPTY_FILTERS);
  const hasApplied = JSON.stringify(applied) !== JSON.stringify(EMPTY_FILTERS);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(applied);

  const clearFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setDealType("all");
    setAssetType("all");
    setApplied(EMPTY_FILTERS);
  };

  const typeCounts = assets.reduce((acc: Record<string, number>, a: { type: string }) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const filteredAssets = assets.filter((asset) => {
    const { searchQuery, minPrice, maxPrice, dealType, assetType } = applied;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = asset.code?.toLowerCase().includes(q);
      const titleMatch = asset.title?.toLowerCase().includes(q) || asset.titleEn?.toLowerCase().includes(q) || asset.titleZh?.toLowerCase().includes(q);
      const projectMatch = asset.projectName?.toLowerCase().includes(q);
      const provinceMatch = asset.province?.toLowerCase().includes(q);
      const districtMatch = asset.district?.toLowerCase().includes(q);
      const ownerMatch = asset.landlord?.name?.toLowerCase().includes(q);
      const addressMatch = asset.address?.toLowerCase().includes(q);
      
      if (!codeMatch && !titleMatch && !projectMatch && !provinceMatch && !districtMatch && !ownerMatch && !addressMatch) {
        return false;
      }
    }

    if (assetType !== "all") {
      const group = ASSET_TYPE_GROUPS.find((g) => `group:${g.label}` === assetType);
      if (group ? !group.types.includes(asset.type) : asset.type !== assetType) {
        return false;
      }
    }

    if (dealType === "sell" && !asset.isSell) {
      return false;
    }
    if (dealType === "rent" && !asset.isRent) {
      return false;
    }

    const sellPrice = asset.sellPrice ? Number(asset.sellPrice) : null;

    if (minPrice.trim()) {
      const min = parseFloat(minPrice.replace(/,/g, ""));
      if (sellPrice === null || sellPrice < min) {
        return false;
      }
    }

    if (maxPrice.trim()) {
      const max = parseFloat(maxPrice.replace(/,/g, ""));
      if (sellPrice === null || sellPrice > max) {
        return false;
      }
    }

    return true;
  });

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบทรัพย์สินรหัส ${code}?\nข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้`)) {
      return;
    }
    
    setIsDeleting(id);
    const res = await deleteAssetAction(id);
    if (res.success) {
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      router.refresh();
    } else {
      alert(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
    setIsDeleting(null);
  };

  const formatPrice = (price: any) => {
    if (!price) return "-";
    return `${Number(price).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Price Filter Controls */}
      <form
        className="bg-[#112240] border border-white/10 rounded-2xl p-5 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(draft);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2 lg:col-span-3 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block whitespace-nowrap truncate">ค้นหา (Search)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="รหัส, ชื่อทรัพย์, โครงการ, จังหวัด, เจ้าของ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-black/45 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block whitespace-nowrap truncate">ประเภททรัพย์ (Type)</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm text-white cursor-pointer focus:outline-none focus:border-accent appearance-none"
            >
              <option className="bg-[#112240]" value="all">ทุกประเภท ({assets.length})</option>
              {ASSET_TYPE_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label} className="bg-[#112240] text-white/50">
                  <option className="bg-[#112240] text-white" value={`group:${g.label}`}>
                    {g.label}ทั้งหมด ({g.types.reduce((n, t) => n + (typeCounts[t] || 0), 0)})
                  </option>
                  {g.types.map((t) => (
                    <option key={t} className="bg-[#112240] text-white" value={t}>
                      {ASSET_TYPE_LABELS[t]} ({typeCounts[t] || 0})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block whitespace-nowrap truncate">ขาย / เช่า (Deal)</label>
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
              className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm text-white cursor-pointer focus:outline-none focus:border-accent appearance-none"
            >
              <option className="bg-[#112240]" value="all">ทั้งหมด</option>
              <option className="bg-[#112240]" value="sell">ขาย</option>
              <option className="bg-[#112240]" value="rent">เช่า</option>
            </select>
          </div>
          
          <div className="col-span-1 lg:col-span-3 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block whitespace-nowrap truncate">ช่วงราคาขาย (Price)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="ต่ำสุด"
                value={minPrice}
                onChange={(e) => setMinPrice(formatNumberWithCommas(e.target.value))}
                className="w-full min-w-0 h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-all"
              />
              <span className="text-white/20 text-xs shrink-0">-</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="สูงสุด"
                value={maxPrice}
                onChange={(e) => setMaxPrice(formatNumberWithCommas(e.target.value))}
                className="w-full min-w-0 h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-2 w-full flex gap-2">
            <button
              type="submit"
              className={`h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-black tracking-wide transition-all active:scale-95 cursor-pointer bg-accent text-primary-dark hover:bg-accent-dark shadow-lg ${isDirty ? "ring-2 ring-accent/40 ring-offset-2 ring-offset-[#112240]" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              ค้นหา
            </button>
            {(hasDraft || hasApplied) && (
              <button
                type="button"
                onClick={clearFilters}
                title="ล้างค่า"
                aria-label="ล้างค่าตัวกรอง"
                className="h-11 w-11 shrink-0 inline-flex items-center justify-center border border-white/10 text-white/60 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {hasApplied && (
          <p className="text-xs text-white/50 mt-3">
            พบ <span className="font-bold text-accent">{filteredAssets.length}</span> จาก {assets.length} รายการ
          </p>
        )}
      </form>

      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white min-w-[800px]">
            <thead className="bg-black/40 text-[10px] uppercase text-white/50 tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold">รูปภาพ</th>
                <th className="px-6 py-4 font-bold">รหัส</th>
                <th className="px-6 py-4 font-bold">ชื่อทรัพย์สิน</th>
                <th className="px-6 py-4 font-bold">สถานะ</th>
                <th className="px-6 py-4 font-bold">ราคาขาย</th>
                <th className="px-6 py-4 font-bold">ราคาเช่า</th>
                <th className="px-6 py-4 font-bold text-center">ออนไลน์</th>
                <th className="px-6 py-4 font-bold text-center">หน้าแรก</th>
                <th className="px-6 py-4 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-white/40">
                    <p className="text-sm">
                      {assets.length === 0 ? "ไม่มีข้อมูลทรัพย์สินในระบบ" : "ไม่พบทรัพย์สินที่ตรงกับเงื่อนไขการกรองของคุณ"}
                    </p>
                    {assets.length === 0 && (
                      <Link href={`/${currentLang}/addnew`} className="text-xs text-accent hover:underline mt-2 inline-block">
                        + เพิ่มทรัพย์สินใหม่
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 relative rounded-md overflow-hidden bg-black/50 border border-white/10">
                      {asset.images && asset.images.length > 0 ? (() => {
                        const featureImage = asset.images.find((img: any) => img.isFeature)?.imageUrl || asset.images[0].imageUrl;
                        return <Image src={featureImage} alt={asset.code} fill sizes="64px" className="object-cover" />;
                      })() : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase text-white/30 tracking-widest">No Image</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-accent font-bold">{asset.code}</td>
                   <td className="px-6 py-4 font-medium max-w-[200px]">
                    <div className="truncate text-white" title={asset.title}>{asset.title}</div>
                    {asset.titleEn && <div className="truncate text-[10px] text-white/40" title={asset.titleEn}>{asset.titleEn}</div>}
                    <div className="text-[10px] text-accent/80 font-bold mt-1 uppercase tracking-wider">
                      {ASSET_TYPE_LABELS[asset.type as string] || asset.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {asset.isDraft && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">แบบร่าง</span>}
                      {!asset.isAvailable && <span className="bg-white/5 text-white/50 border border-white/10 text-[9px] font-bold uppercase px-2 py-0.5 rounded">ปิดประกาศ</span>}
                      {asset.isAvailable && !asset.isDraft && (
                        <>
                          {asset.isSell && <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">ขาย</span>}
                          {asset.isRent && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">เช่า</span>}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{formatPrice(asset.sellPrice)}</td>
                  <td className="px-6 py-4 font-bold text-sm">{formatPrice(asset.loanPrice)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={async () => {
                        const newValue = !asset.isAvailable;
                        // Optimistic update
                        setAssets((prev) => prev.map(a => a.id === asset.id ? { ...a, isAvailable: newValue } : a));
                        const res = await toggleAssetAvailabilityAction(asset.id, newValue);
                        if (!res.success) {
                          // Revert if failed
                          alert(res.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
                          setAssets((prev) => prev.map(a => a.id === asset.id ? { ...a, isAvailable: !newValue } : a));
                        } else {
                          router.refresh();
                        }
                      }}
                      title={asset.isAvailable ? "ปิดการแสดงผล" : "เปิดการแสดงผล"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${asset.isAvailable ? 'bg-accent' : 'bg-white/20'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#0A192F] transition-transform ${asset.isAvailable ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={async () => {
                        const newValue = !asset.isRecommended;
                        // Optimistic update
                        setAssets((prev) => prev.map(a => a.id === asset.id ? { ...a, isRecommended: newValue } : a));
                        const res = await toggleAssetRecommendationAction(asset.id, newValue);
                        if (!res.success) {
                          // Revert if failed
                          alert(res.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะแสดงหน้าแรก");
                          setAssets((prev) => prev.map(a => a.id === asset.id ? { ...a, isRecommended: !newValue } : a));
                        } else {
                          router.refresh();
                        }
                      }}
                      title={asset.isRecommended ? "นำออกจากหน้าแรก" : "แสดงในหน้าแรก"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${asset.isRecommended ? 'bg-green-500' : 'bg-white/20'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#0A192F] transition-transform ${asset.isRecommended ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/${currentLang}/property/list/${asset.code || asset.id}`} 
                        target="_blank" 
                        title="View"
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        href={`/${currentLang}/edit/${asset.code || asset.id}`} 
                        title="Edit"
                        className="p-1.5 text-white/30 hover:text-blue-400 transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(asset.id, asset.code)}
                          disabled={isDeleting === asset.id}
                          title="Delete"
                          className="p-1.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting === asset.id ? (
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
