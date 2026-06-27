const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assetId = 'cmqw3veid0001kz04bk4bh84c';
  
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { images: true }
  });
  
  console.log('Asset ID:', asset?.id);
  console.log('Images:', JSON.stringify(asset?.images, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
