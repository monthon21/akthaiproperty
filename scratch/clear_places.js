const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assetId = 'cmqooj4xt0000nstkgsh9a0oz';
  await prisma.assetPlaces.deleteMany({ where: { assetId } });
  console.log('Deleted dummy places');
}

main().catch(console.error).finally(() => prisma.$disconnect());
