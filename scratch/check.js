const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.assetPlaces.findMany({ where: { assetId: 'cmqooj4xt0000nstkgsh9a0oz' } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
