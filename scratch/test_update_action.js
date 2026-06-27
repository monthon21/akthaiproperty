const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { updateAssetAction } = require('../lib/actions/asset.ts');

async function main() {
  const assetId = 'cmqw3veid0001kz04bk4bh84c';

  // We have to mock revalidatePath since it's a Next.js server function
  jest = require('jest-mock');
  
  const result = await updateAssetAction(assetId, {
    title: 'Test Title',
    code: 'AUTO',
    type: 'HOUSE',
    images: [
      {
        imageUrl: 'https://pub-02bd50627b61f81e8d6ecb8ba7cd9a56.r2.dev/test2.jpg',
        isFeature: true
      }
    ]
  });

  console.log('Action Result:', result);
  
  const dbImages = await prisma.assetImage.findMany({ where: { assetId } });
  console.log('Images in DB:', dbImages);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
