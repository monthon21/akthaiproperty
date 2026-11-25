import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import BrokerAppointmentClient, { BrokerDocData } from "@/components/BrokerAppointmentClient";
import { prisma } from "@/lib/prisma";
import { composeThaiAddress, hasAddressParts } from "@/lib/address";
import { formatLandSize, formatNumber } from "@/lib/format";
import { parseSpecs } from "@/lib/assetSpecs";

const TYPE_LABELS: Record<string, string> = {
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
};

export default async function BrokerAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ asset?: string }>;
}) {
  const session = await auth();
  const { lang = "th" } = await params;
  const { asset: assetCode } = await searchParams;

  if (!session) redirect("/login");
  const sessionUser = session.user as { id?: string | number; role?: string };
  // the document shows the owner's national ID and address
  if (sessionUser.role !== "ADMIN") redirect(`/${lang}/manage`);

  const [asset, user] = await Promise.all([
    assetCode
      ? prisma.asset.findUnique({ where: { code: assetCode.trim() }, include: { landlord: { include: { details: true } } } })
      : null,
    prisma.user.findUnique({ where: { id: Number(sessionUser.id) }, include: { profile: true } }),
  ]);

  const d = asset?.landlord?.details;
  const ownerAddress = {
    houseNo: d?.houseNo ?? "",
    moo: d?.moo ?? "",
    village: d?.village ?? "",
    soi: d?.soi ?? "",
    road: d?.road ?? "",
    subdistrict: d?.subdistrict ?? "",
    district: d?.district ?? "",
    province: d?.province ?? "",
    postCode: d?.postCode ?? "",
  };
  const profile = user?.profile;
  const data: BrokerDocData = {
    asset: asset
      ? {
          code: asset.code,
          isSell: asset.isSell,
          isRent: asset.isRent,
          sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
          rentPrice: asset.loanPrice ? Number(asset.loanPrice) : null,
          summary: [TYPE_LABELS[asset.type] ?? "", asset.projectName ? `โครงการ ${asset.projectName}` : ""].filter(Boolean).join(" "),
          address: composeThaiAddress({
            houseNo: asset.address ?? "",
            soi: asset.soi ?? "",
            road: asset.road ?? "",
            subdistrict: asset.subdistrict ?? "",
            district: asset.district ?? "",
            province: asset.province ?? "",
            postCode: asset.zipCode ?? "",
          }),
          landSize: formatLandSize(asset.landSize ? Number(asset.landSize) : null, "th", parseSpecs(asset.specs).landParts),
          usableArea: asset.usableArea ? `${formatNumber(Number(asset.usableArea))} ตร.ม.` : "",
        }
      : null,
    owner: asset?.landlord
      ? {
          fullname: d?.fullname || asset.landlord.name,
          idcard: d?.idcard || "",
          address: hasAddressParts(ownerAddress) ? composeThaiAddress(ownerAddress) : d?.address || "",
          phone: d?.phone || asset.landlord.phone || "",
        }
      : null,
    agent: {
      fullname: [profile?.prefix, user?.fullname].filter(Boolean).join(""),
      idcard: profile?.nationalId || "",
      address: [profile?.address, profile?.subdistrict, profile?.district, profile?.province, profile?.postCode].filter(Boolean).join(" "),
      phone: profile?.phone || "",
      signatureUrl: profile?.signatureUrl || "",
    },
  };

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen print:p-0 print:min-h-0 print:bg-white">
        <div className="print:hidden">
          <AdminNav />
        </div>
        <div className="max-w-[1400px] mx-auto px-6 print:p-0 print:max-w-none">
          <div className="print:hidden flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] block mb-1">เอกสาร</span>
              <h1 className="text-3xl font-black tracking-tight">สัญญาแต่งตั้งนายหน้า</h1>
              <p className="text-sm text-white/40 mt-2">
                {asset ? `ทรัพย์ ${asset.code} — ${asset.title}` : assetCode ? `ไม่พบทรัพย์รหัส ${assetCode}` : "เลือกทรัพย์เพื่อเติมข้อมูลอัตโนมัติ แล้วพิมพ์หรือบันทึกเป็น PDF"}
              </p>
            </div>
            <Link href={`/${lang}/manage/documents`} className="text-xs font-bold text-white/50 hover:text-white transition-colors">
              ← เอกสารทั้งหมด
            </Link>
          </div>

          {/* key: start from fresh field values when another asset is loaded */}
          <BrokerAppointmentClient key={asset?.code ?? "blank"} lang={lang} data={data} />
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
