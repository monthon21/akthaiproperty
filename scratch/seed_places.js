const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assetId = 'cmqooj4xt0000nstkgsh9a0oz';
  
  await prisma.assetPlaces.deleteMany({ where: { assetId } });
  
  await prisma.assetPlaces.createMany({
    data: [
      {
        assetId,
        placeName: 'Central Rama 2',
        distance: '5 km',
        travelTime: '10 นาที'
      },
      {
        assetId,
        placeName: 'โรงพยาบาลนครธน',
        distance: '6 km',
        travelTime: '12 นาที'
      },
      {
        assetId,
        placeName: 'โรงเรียนนานาชาติ',
        distance: '2 km',
        travelTime: '5 นาที'
      }
    ]
  });
  
  console.log('Added dummy places');
}

main().catch(console.error).finally(() => prisma.$disconnect());
