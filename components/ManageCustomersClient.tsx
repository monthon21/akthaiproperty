"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCustomerDetailsAction,
  updateCustomerDetailsAction,
  createCustomerAction,
  deleteCustomerAction
} from "@/lib/actions/customer";

export default function ManageCustomersClient({
  initialCustomers,
  currentLang,
  errorMsg = ""
}: {
  initialCustomers: any[];
  currentLang: string;
  errorMsg?: string;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [actionError, setActionError] = useState(errorMsg);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLine, setFormLine] = useState("");
  const [formFullname, setFormFullname] = useState("");
  const [formDetailPhone, setFormDetailPhone] = useState("");
  const [formIdcard, setFormIdcard] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDetailLine, setFormDetailLine] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [associatedAssets, setAssociatedAssets] = useState<any[]>([]);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.line?.toLowerCase().includes(q) ||
      c.details?.fullname?.toLowerCase().includes(q) ||
      c.details?.email?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลเจ้าของทรัพย์ "${name}"?\nการลบนี้จะลบรายละเอียดส่วนตัว (CustomerDetails) ทั้งหมดด้วย แต่ทรัพย์สินต่างๆ ที่เชื่อมโยงจะยังอยู่ (โดยจะถูกตั้งค่าเจ้าของเป็นค่าว่าง)`
      )
    ) {
      return;
    }

    setIsDeleting(id);
    setActionError("");
    setSuccessMessage("");

    const res = await deleteCustomerAction(id);
    if (res.success) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage(`ลบข้อมูลเจ้าของทรัพย์ "${name}" สำเร็จ`);
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    } else {
      setActionError(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
    setIsDeleting(null);
  };

  const handleOpenEdit = async (customerId: number) => {
    setActionError("");
    setSuccessMessage("");
    setIsNewCustomer(false);
    setSelectedCustomerId(customerId);
    setModalLoading(true);
    setShowModal(true);

    const res = await getCustomerDetailsAction(customerId);
    if (res.success && res.customer) {
      const c = res.customer;
      setFormName(c.name || "");
      setFormPhone(c.phone || "");
      setFormLine(c.line || "");
      setFormFullname(c.details?.fullname || "");
      setFormDetailPhone(c.details?.phone || "");
      setFormIdcard(c.details?.idcard || "");
      setFormEmail(c.details?.email || "");
      setFormDetailLine(c.details?.line || "");
      setFormAddress(c.details?.address || "");
      setAssociatedAssets(c.assets || []);
    } else {
      setActionError(res.error || "ไม่สามารถโหลดข้อมูลเจ้าของทรัพย์ได้");
      setShowModal(false);
    }
    setModalLoading(false);
  };

  const handleOpenCreate = () => {
    setActionError("");
    setSuccessMessage("");
    setIsNewCustomer(true);
    setSelectedCustomerId(null);
    setFormName("");
    setFormPhone("");
    setFormLine("");
    setFormFullname("");
    setFormDetailPhone("");
    setFormIdcard("");
    setFormEmail("");
    setFormDetailLine("");
    setFormAddress("");
    setAssociatedAssets([]);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setSuccessMessage("");

    if (!formName.trim()) {
      setActionError("กรุณากรอกชื่อเรียกเจ้าของทรัพย์");
      return;
    }

    setModalLoading(true);
    const payload = {
      name: formName,
      phone: formPhone,
      line: formLine,
      fullname: formFullname || formName,
      detailPhone: formDetailPhone || formPhone,
      idcard: formIdcard,
      email: formEmail,
      detailLine: formDetailLine || formLine,
      address: formAddress
    };

    if (isNewCustomer) {
      const res = await createCustomerAction(payload);
      if (res.success && res.customer) {
        const newCust = {
          ...res.customer,
          details: res.details,
          _count: { assets: 0 }
        };
        setCustomers((prev) => [newCust, ...prev]);
        setSuccessMessage("สร้างข้อมูลเจ้าของทรัพย์สำเร็จ");
        setShowModal(false);
        router.refresh();
      } else {
        setActionError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } else if (selectedCustomerId) {
      const res = await updateCustomerDetailsAction(selectedCustomerId, payload);
      if (res.success && res.customer) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomerId
              ? {
                  ...c,
                  name: res.customer.name,
                  phone: res.customer.phone,
                  line: res.customer.line,
                  details: res.details
                }
              : c
          )
        );
        setSuccessMessage("อัปเดตรายละเอียดเจ้าของทรัพย์สำเร็จ");
        setShowModal(false);
        router.refresh();
      } else {
        setActionError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    }
    setModalLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">รายชื่อเจ้าของทรัพย์สิน (Property Owners)</h2>
          <p className="text-xs text-white/50 mt-1">ข้อมูลส่วนตัวและรายละเอียดสัญญาจะแสดงผลภายในระบบ Admin เท่านั้น</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${currentLang}/manage`}
            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            ← รายการทรัพย์สิน
          </Link>
          <button
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-accent-dark text-primary-dark text-xs font-bold px-6 py-3 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            + เพิ่มเจ้าของทรัพย์
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-accent/15 border border-accent/30 text-accent rounded-xl p-4 text-xs font-semibold animate-fade-in">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-xs font-semibold animate-fade-in">
          {actionError}
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาเจ้าของทรัพย์ด้วยชื่อ, เบอร์โทรศัพท์, Line ID, อีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-black/45 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-[#112240] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-white/50 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ชื่อเรียกในระบบ (Name)</th>
                <th className="px-6 py-4">เบอร์โทรศัพท์ (Phone)</th>
                <th className="px-6 py-4">Line ID</th>
                <th className="px-6 py-4">ชื่อจริง/นามสกุล (Fullname)</th>
                <th className="px-6 py-4 text-center">ทรัพย์สินทั้งหมด</th>
                <th className="px-6 py-4 text-center">การจัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/40">
                    ไม่พบข้อมูลเจ้าของทรัพย์สิน
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white/70">{c.phone || "-"}</td>
                    <td className="px-6 py-4 text-white/70">{c.line || "-"}</td>
                    <td className="px-6 py-4 text-white/70">{c.details?.fullname || "-"}</td>
                    <td className="px-6 py-4 text-center font-bold text-accent">
                      {c._count?.assets ?? 0} รายการ
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(c.id)}
                          className="px-3.5 py-1.5 border border-accent/30 text-accent hover:bg-accent hover:text-primary-dark rounded transition-all cursor-pointer font-semibold"
                        >
                          ดูรายละเอียด/แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={isDeleting === c.id}
                          className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-all cursor-pointer font-semibold disabled:opacity-40"
                        >
                          {isDeleting === c.id ? "กำลังลบ..." : "ลบ"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#112240] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#112240] px-6 py-4 border-b border-white/10 flex justify-between items-center z-10">
              <h3 className="font-bold text-base text-white">
                {isNewCustomer ? "เพิ่มเจ้าของทรัพย์ใหม่" : "ข้อมูลเจ้าของทรัพย์ & รายละเอียดสัญญา"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {modalLoading && !isNewCustomer ? (
              <div className="p-10 text-center text-accent animate-pulse font-semibold">
                กำลังดึงข้อมูล...
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                {/* 1. Basic Info (Customer Table) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-1">
                    ข้อมูลพื้นฐานติดต่อหลัก (Customer Basic Info)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        ชื่อเรียก/ค้นหา (Name)*
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. คุณสมชาย"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        เบอร์ติดต่อหลัก (Phone)
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="e.g. 0812345678"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        Line ID หลัก
                      </label>
                      <input
                        type="text"
                        value={formLine}
                        onChange={(e) => setFormLine(e.target.value)}
                        placeholder="e.g. somchai_line"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Detailed Info (CustomerDetails Table) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-1">
                    ข้อมูลสัญญา & เอกสารเจ้าของทรัพย์ (Customer Details - Confidential)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        ชื่อจริง-นามสกุลตามบัตร (Fullname)
                      </label>
                      <input
                        type="text"
                        value={formFullname}
                        onChange={(e) => setFormFullname(e.target.value)}
                        placeholder="e.g. นายสมชาย อารีย์ดี"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        เลขบัตรประชาชน / Passport (ID Card)
                      </label>
                      <input
                        type="text"
                        value={formIdcard}
                        onChange={(e) => setFormIdcard(e.target.value)}
                        placeholder="e.g. 1100200345678"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        เบอร์ติดต่อสำรอง / เพิ่มเติม
                      </label>
                      <input
                        type="text"
                        value={formDetailPhone}
                        onChange={(e) => setFormDetailPhone(e.target.value)}
                        placeholder="เบอร์ติดต่ออื่นๆ..."
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        อีเมล (Email)
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="e.g. somchai@example.com"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        Line ID เพิ่มเติม
                      </label>
                      <input
                        type="text"
                        value={formDetailLine}
                        onChange={(e) => setFormDetailLine(e.target.value)}
                        placeholder="e.g. line_id_2"
                        className="w-full h-11 bg-black/45 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                        ที่อยู่สำหรับการจัดส่งเอกสาร / ที่อยู่ตามทะเบียนบ้าน (Address)
                      </label>
                      <textarea
                        rows={3}
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="กรอกรายละเอียดที่อยู่จัดส่งเอกสารหรือที่อยู่ตามทะเบียนบ้าน..."
                        className="w-full p-4 bg-black/45 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-accent text-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Linked Assets (Properties list) */}
                {!isNewCustomer && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-1">
                      อสังหาริมทรัพย์ที่ครอบครอง ({associatedAssets.length} รายการ)
                    </h4>
                    {associatedAssets.length === 0 ? (
                      <p className="text-xs text-white/40 italic">ยังไม่มีทรัพย์สินเชื่อมโยงกับเจ้าของท่านนี้</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {associatedAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex justify-between items-center bg-black/20 border border-white/5 p-3 rounded-xl hover:border-accent/30 transition-all text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white truncate max-w-md">{asset.title}</span>
                              <span className="text-[10px] text-white/40 font-mono">
                                ID: {asset.code} | {asset.type === "DETACHED_HOUSE" ? "บ้านเดี่ยว" : asset.type}
                              </span>
                            </div>
                            <Link
                              href={`/${currentLang}/property/list/${asset.id}`}
                              target="_blank"
                              className="text-accent hover:underline font-semibold"
                            >
                              เปิดดูหน้าเว็บ →
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 h-11 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase transition-all tracking-wider text-white/70 hover:text-white cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-10 h-11 bg-accent text-primary-dark rounded-xl font-black text-xs tracking-widest uppercase hover:bg-accent-dark transition-all shadow-lg hover:shadow-accent/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {modalLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
