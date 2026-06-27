const { updateAssetAction } = require('../lib/actions/asset.ts');

// We need to bypass Next.js server action restrictions by directly executing the logic.
// However, since it's a TS file with Next.js imports (revalidatePath), we can't just require it in Node.
// Let's write a Prisma script that does EXACTLY what updateAssetAction does.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateUpdate() {
  const id = 'cmqw3veid0001kz04bk4bh84c';
  const images = [
    {
      imageUrl: 'https://pub-02bd50627b61f81e8d6ecb8ba7cd9a56.r2.dev/simulate.jpg',
      isFeature: true
    }
  ];

  try {
    await prisma.assetImage.deleteMany({
      where: { assetId: id }
    });

    if (images && images.length > 0) {
      await prisma.assetImage.createMany({
        data: images.map(img => ({
          assetId: id,
          imageUrl: img.imageUrl,
          isFeature: img.isFeature
        }))
      });
    }
    
    console.log('Simulate update successful');
  } catch (err) {
    console.error('Error:', err);
  }
}

simulateUpdate().finally(() => prisma.$disconnect());
