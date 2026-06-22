"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteAssetAction, toggleAssetAvailabilityAction, toggleAssetRecommendationAction } from "@/lib/actions/asset";

export default function ManageAssetsClient({ initialAssets, currentLang, isAdmin = false }: { initialAssets: any[], currentLang: string, isAdmin?: boolean }) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
    <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white min-w-[800px]">
          <thead className="bg-black/40 text-[10px] uppercase text-white/50 tracking-widest border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-bold">รูปภาพ (Image)</th>
              <th className="px-6 py-4 font-bold">รหัส (Code)</th>
              <th className="px-6 py-4 font-bold">ชื่อทรัพย์สิน (Title)</th>
              <th className="px-6 py-4 font-bold">ประเภท (Type)</th>
              <th className="px-6 py-4 font-bold">สถานะ (Status)</th>
              <th className="px-6 py-4 font-bold">ราคาขาย (Price)</th>
              <th className="px-6 py-4 font-bold text-center">ออนไลน์ (Online)</th>
              <th className="px-6 py-4 font-bold text-center">หน้าแรก (Home)</th>
              <th className="px-6 py-4 font-bold text-right">จัดการ (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-white/40">
                  <p className="text-sm">ไม่มีข้อมูลทรัพย์สินในระบบ</p>
                  <Link href={`/${currentLang}/addnew`} className="text-xs text-accent hover:underline mt-2 inline-block">
                    + เพิ่มทรัพย์สินใหม่
                  </Link>
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 relative rounded-md overflow-hidden bg-black/50 border border-white/10">
                      {asset.images && asset.images.length > 0 ? (() => {
                        const featureImage = asset.images.find((img: any) => img.isFeature)?.imageUrl || asset.images[0].imageUrl;
                        return <Image src={featureImage} alt={asset.code} fill className="object-cover" />;
                      })() : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase text-white/30 tracking-widest">No Image</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-accent font-bold">{asset.code}</td>
                  <td className="px-6 py-4 font-medium max-w-[200px]">
                    <div className="truncate text-white" title={asset.title}>{asset.title}</div>
                    {asset.titleEn && <div className="truncate text-[10px] text-white/40" title={asset.titleEn}>{asset.titleEn}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs text-white/70">
                    {{
                      SINGLE_HOUSE: "บ้านเดี่ยว",
                      TOWNHOUSE: "ทาวน์เฮาส์",
                      SEMI_DETACHED: "บ้านแฝด",
                      VILLA: "วิลล่า",
                      FACTORY: "โรงงาน",
                      WAREHOUSE: "โกดัง",
                      OFFICE: "ออฟฟิศ",
                      RETAIL: "ร้านค้า",
                      LAND: "ที่ดินเปล่า",
                      COMMERCIAL: "อาคารพาณิชย์",
                      APARTMENT: "อพาร์ทเม้นท์",
                      OTHER: "อื่นๆ"
                    }[asset.type as string] || asset.type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {asset.isSell && <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">ขาย</span>}
                      {asset.isRent && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded">เช่า</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{formatPrice(asset.sellPrice)}</td>
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
                  <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link href={`/${currentLang}/property/list/${asset.id}`} target="_blank" className="text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">
                      View
                    </Link>
                    <Link href={`/${currentLang}/edit/${asset.id}`} className="text-xs font-bold text-accent hover:text-accent-dark transition-colors uppercase tracking-widest">
                      Edit
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(asset.id, asset.code)}
                        disabled={isDeleting === asset.id}
                        className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                      >
                        {isDeleting === asset.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
