const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assetId = 'cmqw3veid0001kz04bk4bh84c';

  await prisma.assetImage.deleteMany({
    where: { assetId }
  });

  const res = await prisma.assetImage.createMany({
    data: [
      {
        assetId,
        imageUrl: 'https://pub-02bd50627b61f81e8d6ecb8ba7cd9a56.r2.dev/test1.jpg',
        isFeature: true
      }
    ]
  });

  console.log('Inserted:', res);

  const images = await prisma.assetImage.findMany({ where: { assetId } });
  console.log('Images in DB:', images);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
