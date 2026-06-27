import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditAssetClient from "@/components/EditAssetClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssetPage({ params }: PageProps) {
  const resolvedParams = await params;
  const assetId = resolvedParams.id;

  // Fetch the asset along with images and history logs from database
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      images: true,
      prices: {
        orderBy: { createdAt: "desc" }
      },
      customer: true,
      assetPlaces: true
    }
  });

  if (!asset) {
    notFound();
  }

  // Convert prisma decimal values to floats/numbers so they are serializable across server/client boundaries
  const serializedAsset = {
    ...asset,
    sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
    loanPrice: asset.loanPrice ? Number(asset.loanPrice) : null,
    landSize: asset.landSize ? Number(asset.landSize) : null,
    usableArea: asset.usableArea ? Number(asset.usableArea) : null,
    prices: asset.prices.map(p => ({
      ...p,
      sellPrice: p.sellPrice ? Number(p.sellPrice) : null,
      loanPrice: p.loanPrice ? Number(p.loanPrice) : null
    }))
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-[#0A192F] text-white min-h-screen">
        <EditAssetClient asset={serializedAsset} />
      </main>
      <Footer />
    </>
  );
}
