const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = await prisma.assetImage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent 5 Images:', images);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
