"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createAssetAction, getNextAssetCodeAction } from "@/lib/actions/asset";
import { AssetType } from "@prisma/client";
import ImageUploader, { ImageItem } from "@/components/ImageUploader";
import { LangTabInput, LangTabTextarea } from "@/components/LangTabInput";
import { AMENITY_GROUPS } from "@/lib/amenities";

export default function AddNewAssetPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "th";
  const [formData, setFormData] = useState({
    code: "",
    projectName: "",
    title: "",
    titleEn: "",
    titleZh: "",
    description: "",
    descriptionEn: "",
    descriptionZh: "",
    isRent: false,
    isSell: true,
    type: "SINGLE_HOUSE" as AssetType,
    sellPrice: "",
    loanPrice: "",
    noBedroom: "",
    noBathroom: "",
    noFloor: "",
    landSize: "",
    usableArea: "",
    maidRoom: "",
    parkingLot: "",
    facing: "",
    otherFeatures: "",
    address: "",
    soi: "",
    road: "",
    province: "",
    district: "",
    subdistrict: "",
    zipCode: "",
    googleMap: "",
    ownerName: "",
    ownerPhone: "",
    ownerLine: ""
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchNextCode() {
      try {
        const res = await getNextAssetCodeAction();
        if (res.success) {
          setFormData((prev) => ({ ...prev, code: res.code }));
        }
      } catch (err) {
        console.error("Error fetching next code:", err);
      }
    }
    fetchNextCode();
  }, []);

  const formatNumberWithCommas = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    if (!clean) return "";
    return parseInt(clean, 10).toLocaleString();
  };

  const getGoogleMapsEmbedUrl = (googleMapField: string | null | undefined, fallbackAddress: string) => {
    if (!googleMapField) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress || "กรุงเทพมหานคร")}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
    if (googleMapField.includes("<iframe")) {
      const match = googleMapField.match(/src=["']([^"']+)["']/);
      if (match && match[1]) return match[1];
    }
    if (googleMapField.includes("output=embed") && (googleMapField.startsWith("http://") || googleMapField.startsWith("https://"))) {
      return googleMapField;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(googleMapField)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const priceNum = parseInt(formData.sellPrice.replace(/,/g, "")) || (parseInt(formData.loanPrice.replace(/,/g, "")) || 0);
  let priceStr = "ติดต่อสอบถาม";
  if (priceNum > 0) {
    priceStr = `${priceNum.toLocaleString()}`;
    if (formData.isRent && !formData.isSell) priceStr += " / เดือน";
  }

  const fullLocation = `${formData.address ? formData.address + " " : ""}${formData.soi ? "ซ." + formData.soi + " " : ""}${formData.road ? "ถ." + formData.road + " " : ""}${formData.subdistrict ? formData.subdistrict + ", " : ""}${formData.district ? formData.district + ", " : ""}${formData.province || ""}`;
  const mapUrl = getGoogleMapsEmbedUrl(formData.googleMap, fullLocation);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let finalValue: any = type === "checkbox" ? checked : value;
    if (name === "sellPrice" || name === "loanPrice") {
      finalValue = formatNumberWithCommas(value);
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.code.trim() || !formData.title.trim()) {
      setError("กรุณากรอกรหัสทรัพย์และชื่อทรัพย์สิน");
      return;
    }
    if (images.length === 0) {
      setError("กรุณาเพิ่มรูปภาพประกอบอย่างน้อย 1 รูป");
      return;
    }
    const hasFeature = images.some((img) => img.isFeature);
    if (!hasFeature) {
      setError("กรุณาเลือกรูปภาพหลัก (Feature Image) 1 รูป");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        sellPrice: formData.sellPrice ? Number(formData.sellPrice.replace(/,/g, "")) : undefined,
        loanPrice: formData.loanPrice ? Number(formData.loanPrice.replace(/,/g, "")) : undefined,
        noBedroom: formData.noBedroom ? Number(formData.noBedroom) : undefined,
        noBathroom: formData.noBathroom ? Number(formData.noBathroom) : undefined,
        noFloor: formData.noFloor ? Number(formData.noFloor) : undefined,
        landSize: formData.landSize ? Number(formData.landSize) : undefined,
        usableArea: formData.usableArea ? Number(formData.usableArea) : undefined,
        maidRoom: formData.maidRoom ? Number(formData.maidRoom) : undefined,
        parkingLot: formData.parkingLot ? Number(formData.parkingLot) : undefined,
        amenities,
        images
      };

      const result = await createAssetAction(submissionData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => { router.push(`/property/list/${result.id}`); }, 1500);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดทางเทคนิคในการเชื่อมต่อระบบ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">Admin Console</span>
              <h1 className="text-3xl font-black tracking-tight">เพิ่มทรัพย์สินใหม่ (Add New Asset)</h1>
            </div>
            <Link href="/" className="text-xs font-bold text-white/50 hover:text-accent tracking-widest uppercase transition-colors">
              กลับหน้าหลัก
            </Link>
          </div>

          <div className="bg-[#112240] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative">
            {success && (
              <div className="bg-accent/15 border border-accent/30 text-accent rounded-xl p-5 mb-8 text-center space-y-2 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm font-bold uppercase tracking-wider">เพิ่มทรัพย์สินสำเร็จ!</p>
                <p className="text-xs text-white/70">ระบบกำลังนำทางคุณไปยังหน้าเพจแสดงผลทรัพย์สิน...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-5 mb-8 text-center space-y-1 animate-fade-in">
                <p className="text-sm font-bold uppercase tracking-wider">เกิดข้อผิดพลาด</p>
                <p className="text-xs text-white/80">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── 1. Basic Info ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  ข้อมูลพื้นฐาน (Basic Info)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">รหัสทรัพย์ (Asset Code)*</label>
                    <input
                      type="text" name="code" readOnly
                      placeholder="กำลังดึงรหัสทรัพย์..."
                      value={formData.code}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none text-white/50 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <LangTabInput
                      label="ชื่อทรัพย์สิน (Asset Title)*"
                      nameTh="title" nameEn="titleEn" nameZh="titleZh"
                      valueTh={formData.title} valueEn={formData.titleEn} valueZh={formData.titleZh}
                      onChange={handleInputChange}
                      placeholder="e.g. พูลวิล่าสไตล์โมเดิร์นทรอปิคอล ราไวย์"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ชื่อโครงการ (Project Name)</label>
                      <input type="text" name="projectName" placeholder="e.g. The Grand Rama 2" value={formData.projectName} onChange={handleInputChange}
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                    </div>
                  </div>
                </div>

                <LangTabTextarea
                  label="รายละเอียดทรัพย์ (Description)"
                  nameTh="description" nameEn="descriptionEn" nameZh="descriptionZh"
                  valueTh={formData.description} valueEn={formData.descriptionEn} valueZh={formData.descriptionZh}
                  onChange={handleInputChange} rows={5}
                  placeholder="รายละเอียดเพิ่มเติมของตัวบ้าน ทำเล และจุดขาย..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ประเภททรัพย์สิน (Asset Type)</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white appearance-none cursor-pointer">
                      <option className="bg-[#112240]" value="SINGLE_HOUSE">บ้านเดี่ยว (Single House)</option>
                      <option className="bg-[#112240]" value="CONDO">คอนโด (Condo)</option>
                      <option className="bg-[#112240]" value="LAND">ที่ดินเปล่า (Land)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ลักษณะการทำรายการ (Deal Options)</label>
                    <div className="flex gap-6 items-center h-11 bg-black/20 px-4 rounded-xl border border-white/5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-white/70 cursor-pointer">
                        <input type="checkbox" name="isSell" checked={formData.isSell} onChange={handleInputChange} className="w-4 h-4 rounded accent-accent bg-black border-white/10" />
                        สำหรับขาย (Sell)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-white/70 cursor-pointer">
                        <input type="checkbox" name="isRent" checked={formData.isRent} onChange={handleInputChange} className="w-4 h-4 rounded accent-accent bg-black border-white/10" />
                        สำหรับเช่า (Rent)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. Pricing & Specs ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  ราคาและข้อมูลห้อง (Pricing &amp; Specs)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ราคาขาย (Sell Price / บาท)</label>
                    <input type="text" name="sellPrice" placeholder="e.g. 12,500,000" value={formData.sellPrice} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ค่าเช่า / เดือน (Rent Price / Month)</label>
                    <input type="text" name="loanPrice" placeholder="e.g. 10,000,000" value={formData.loanPrice} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ขนาดที่ดิน (ตร.วา)</label>
                    <input type="number" name="landSize" placeholder="e.g. 80" value={formData.landSize} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">พื้นที่ใช้สอย (ตร.ม.)</label>
                    <input type="number" name="usableArea" placeholder="e.g. 200" value={formData.usableArea} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จำนวนห้องนอน (Bedrooms)</label>
                    <input type="number" name="noBedroom" placeholder="e.g. 3" value={formData.noBedroom} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จำนวนห้องน้ำ (Bathrooms)</label>
                    <input type="number" name="noBathroom" placeholder="e.g. 3" value={formData.noBathroom} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จำนวนชั้น (Floors)</label>
                    <input type="number" name="noFloor" placeholder="e.g. 2" value={formData.noFloor} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จำนวนห้องแม่บ้าน (Maid Rooms)</label>
                    <input type="number" name="maidRoom" placeholder="e.g. 1" value={formData.maidRoom} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จำนวนที่จอดรถ (Parking Lots)</label>
                    <input type="number" name="parkingLot" placeholder="e.g. 2" value={formData.parkingLot} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">หน้าบ้านหันไปทางทิศ (Facing Direction)</label>
                    <select name="facing" value={formData.facing} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white appearance-none cursor-pointer">
                      <option className="bg-[#112240]" value="">ไม่ระบุ</option>
                      <option className="bg-[#112240]" value="เหนือ">เหนือ (N)</option>
                      <option className="bg-[#112240]" value="ตะวันออกเฉียงเหนือ">ตะวันออกเฉียงเหนือ (NE)</option>
                      <option className="bg-[#112240]" value="ตะวันออก">ตะวันออก (E)</option>
                      <option className="bg-[#112240]" value="ตะวันออกเฉียงใต้">ตะวันออกเฉียงใต้ (SE)</option>
                      <option className="bg-[#112240]" value="ใต้">ใต้ (S)</option>
                      <option className="bg-[#112240]" value="ตะวันตกเฉียงใต้">ตะวันตกเฉียงใต้ (SW)</option>
                      <option className="bg-[#112240]" value="ตะวันตก">ตะวันตก (W)</option>
                      <option className="bg-[#112240]" value="ตะวันตกเฉียงเหนือ">ตะวันตกเฉียงเหนือ (NW)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">อื่นๆ (Other Features)</label>
                    <input type="text" name="otherFeatures" placeholder="e.g. วิวสวน, หน้าต่างกระจกบานใหญ่" value={formData.otherFeatures} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>
              </div>

              {/* ── 3. Amenities ── */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  สิ่งอำนวยความสะดวก (Amenities)
                </h3>
                <div className="space-y-5">
                  {AMENITY_GROUPS.map((group) => (
                    <div key={group.id}>
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        {group.title}
                        <span className="text-white/20">/ {group.titleEn} / {group.titleZh}</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {group.items.map((item) => {
                          const checked = amenities.includes(item.key);
                          return (
                            <label
                              key={item.key}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${checked
                                  ? "bg-accent/10 border-accent/40 text-accent"
                                  : "bg-black/20 border-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                                }`}
                            >
                              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleAmenity(item.key)} />
                              <span className="text-sm font-normal leading-tight">
                                {lang === "zh" ? item.labelZh : lang === "en" ? item.labelEn : item.label}
                              </span>
                              {checked && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 ml-auto shrink-0">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 4. Location ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  ที่ตั้งทรัพย์สิน (Location)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ที่อยู่/โครงการ (Address)</label>
                    <input type="text" name="address" placeholder="e.g. 99/1 ซอยร่วมฤดี" value={formData.address} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ซอย (Soi)</label>
                    <input type="text" name="soi" placeholder="e.g. ร่วมฤดี" value={formData.soi} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ถนน (Road)</label>
                    <input type="text" name="road" placeholder="e.g. เพลินจิต" value={formData.road} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ตำบล/แขวง (Subdistrict)</label>
                    <input type="text" name="subdistrict" placeholder="e.g. ลุมพินี" value={formData.subdistrict} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">อำเภอ/เขต (District)</label>
                    <input type="text" name="district" placeholder="e.g. ปทุมวัน" value={formData.district} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">จังหวัด (Province)</label>
                    <input type="text" name="province" placeholder="e.g. กรุงเทพมหานคร" value={formData.province} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">รหัสไปรษณีย์ (Zip Code)</label>
                    <input type="text" name="zipCode" placeholder="e.g. 10330" value={formData.zipCode} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">พิกัด Google Map (Google Map Coordinates / Share Link / Iframe Code)</label>
                    <input type="text" name="googleMap" placeholder="e.g. 13.7563, 100.5018 หรือวางลิงก์ / โค้ดฝังแผนที่ iframe" value={formData.googleMap} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>
              </div>

              {/* ── 5. เจ้าของทรัพย์ (Owner Details) ── */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  ข้อมูลเจ้าของทรัพย์ (Owner Details - จะไม่แสดงผลหน้าเว็บสาธารณะ)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">ชื่อเจ้าของทรัพย์ (Owner Name)</label>
                    <input type="text" name="ownerName" placeholder="e.g. คุณสมชาย" value={formData.ownerName || ""} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">เบอร์ติดต่อ (Contact Phone)</label>
                    <input type="text" name="ownerPhone" placeholder="e.g. 0812345678" value={formData.ownerPhone || ""} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">Line ID</label>
                    <input type="text" name="ownerLine" placeholder="e.g. somchai_line" value={formData.ownerLine || ""} onChange={handleInputChange}
                      className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent transition-all text-white" />
                  </div>
                </div>
              </div>

              {/* ── 6. Images ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">
                  รูปภาพประกอบ (Images List)
                </h3>
                <p className="text-[10px] text-white/30 -mt-2">
                  อัพโหลดรูปได้หลายไฟล์ — ต้องเลือก Feature Image 1 รูปก่อนบันทึก
                </p>
                <ImageUploader images={images} onChange={setImages} />
              </div>

              {/* ── Buttons ── */}
              <div className="border-t border-white/5 pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => router.push("/")}
                  className="px-6 h-11 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase transition-all tracking-wider text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="button" onClick={() => setShowPreview(true)}
                  className="px-6 h-11 border border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/10 text-accent rounded-xl text-xs font-bold uppercase transition-all tracking-wider cursor-pointer">
                  ดูตัวอย่าง (Preview)
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-10 h-11 bg-accent text-primary-dark rounded-xl font-black text-xs tracking-widest uppercase hover:bg-accent-dark transition-all shadow-lg hover:shadow-accent/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล (Save)"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
      <Footer />

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-[#0A192F] overflow-y-auto text-white font-sans scroll-smooth">
          <div className="sticky top-0 bg-[#112240]/95 backdrop-blur-md border-b border-white/10 z-55 py-4 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-accent/20 border border-accent/40 text-accent text-[9px] font-black uppercase tracking-widest rounded-sm">Preview Mode</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/90">ตัวอย่างการแสดงผล (Property Preview)</h2>
              </div>
              <button onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-white/80 hover:text-white cursor-pointer border border-white/5">
                ปิดหน้าต่างตัวอย่าง (Close Preview)
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="border-b border-white/5 pb-6 mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 leading-snug">
                    {formData.title || "ไม่ได้ระบุชื่อทรัพย์สิน"}
                  </h1>
                  {formData.projectName && (
                    <h2 className="text-sm font-bold text-accent mb-3">{formData.projectName}</h2>
                  )}
                  <p className="text-white/50 text-xs font-medium tracking-wide flex items-center gap-1.5 flex-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {fullLocation || "ยังไม่ได้ระบุตำแหน่งที่ตั้ง"} {formData.zipCode ? formData.zipCode : ""} <span className="text-white/20">|</span> <span className="text-accent">ID: {formData.code || "AUTO"}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-6 lg:gap-12 bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 w-full lg:w-auto shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">ราคา</span>
                    <span className="text-xl md:text-2xl font-black text-accent">{priceStr}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">ห้องนอน</span>
                    <span className="text-xl md:text-2xl font-bold">{formData.noBedroom || 0} <span className="text-xs font-normal text-white/50">Beds</span></span>
                  </div>
                  <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">ห้องน้ำ</span>
                    <span className="text-xl md:text-2xl font-bold">{formData.noBathroom || 0} <span className="text-xs font-normal text-white/50">Baths</span></span>
                  </div>
                  <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">พื้นที่ใช้สอย</span>
                    <span className="text-xl md:text-2xl font-bold">{formData.usableArea || 0} <span className="text-xs font-normal text-white/50">m²</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2 space-y-12">
                {/* Gallery */}
                <div className="w-full space-y-4">
                  {images.length > 0 ? (
                    <>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                        <img src={images.find((img) => img.isFeature)?.imageUrl || images[0].imageUrl} alt="Main Feature Preview" className="object-cover w-full h-full animate-fade-in" />
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className={`relative aspect-video rounded-lg overflow-hidden border ${img.isFeature ? "border-accent" : "border-white/10"} bg-black`}>
                            <img src={img.imageUrl} alt={`Preview Thumbnail ${idx}`} className="object-cover w-full h-full" />
                            {img.isFeature && (
                              <span className="absolute top-1.5 left-1.5 bg-accent text-primary-dark text-[6px] font-bold uppercase tracking-widest px-1 py-0.5 rounded-sm">Cover</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 bg-white/5 gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      <span className="text-xs">ยังไม่มีการเพิ่มรูปภาพ (No Images Added)</span>
                    </div>
                  )}
                </div>

                {/* About */}
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-wide border-l-2 border-accent pl-3">About this Property</h3>
                  <div className="text-sm text-white/80 leading-relaxed font-medium space-y-4">
                    <p className="whitespace-pre-line bg-white/2.5 p-4 rounded-xl border border-white/5">{formData.description || "ยังไม่มีข้อมูลรายละเอียดทรัพย์สิน"}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                      {formData.landSize && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">ขนาดที่ดิน</span><span className="text-sm font-bold text-accent">{formData.landSize} <span className="text-xs font-normal text-white/70">ตร.วา</span></span></div>}
                      {formData.usableArea && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">พื้นที่ใช้สอย</span><span className="text-sm font-bold text-accent">{formData.usableArea} <span className="text-xs font-normal text-white/70">ตร.ม.</span></span></div>}
                      {formData.noFloor && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">จำนวนชั้น</span><span className="text-sm font-bold text-accent">{formData.noFloor} <span className="text-xs font-normal text-white/70">ชั้น</span></span></div>}
                      {formData.parkingLot && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">ที่จอดรถ</span><span className="text-sm font-bold text-accent">{formData.parkingLot} <span className="text-xs font-normal text-white/70">คัน</span></span></div>}
                      {formData.maidRoom && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">ห้องแม่บ้าน</span><span className="text-sm font-bold text-accent">{formData.maidRoom} <span className="text-xs font-normal text-white/70">ห้อง</span></span></div>}
                      {formData.facing && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">ทิศหน้าบ้าน</span><span className="text-sm font-bold text-accent">{formData.facing}</span></div>}
                      {formData.otherFeatures && <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">ลักษณะพิเศษอื่นๆ</span><span className="text-xs font-bold text-accent truncate block">{formData.otherFeatures}</span></div>}
                    </div>
                    {amenities.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-3">สิ่งอำนวยความสะดวก (Amenities)</p>
                        <div className="flex flex-wrap gap-2">
                          {amenities.map((key) => {
                            const found = AMENITY_GROUPS.flatMap((g) => g.items).find((i) => i.key === key);
                            return found ? (
                              <span key={key} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-[11px] font-normal px-2.5 py-1 rounded-full">
                                {lang === "zh" ? found.labelZh : lang === "en" ? found.labelEn : found.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Map */}
                <section className="space-y-6">
                  <h3 className="text-lg font-bold text-white tracking-wide border-l-2 border-accent pl-3">Location Map</h3>
                  <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                    <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full grayscale opacity-80"></iframe>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <div className="bg-[#112240] border border-white/10 rounded-xl p-6 shadow-2xl space-y-6">
                  <div className="flex items-center gap-4 bg-black/40 p-4 border border-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center text-accent font-black text-base shrink-0">A</div>
                    <div>
                      <p className="text-[8px] font-bold text-accent uppercase tracking-widest leading-none mb-1">Listing Agent</p>
                      <p className="text-xs font-bold text-white">AK Thai Property Office</p>
                      <p className="text-[10px] text-white/50 mt-0.5 font-medium">Real Estate Consultant</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40 text-center leading-relaxed bg-black/25 p-4 rounded-lg border border-white/5">
                    * ฟอร์มติดต่อสอบถามและเครื่องคำนวณสินเชื่อจำลองของจริง จะแสดงผลในหน้ารายละเอียดทรัพย์หลังจากบันทึกข้อมูลเรียบร้อยแล้ว
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
