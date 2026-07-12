const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Renaming columns in LandlordDetails and LandlordRole...");
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE LandlordDetails RENAME COLUMN customerId TO landlordId;`);
    } catch (e) {
      console.log("RENAME COLUMN failed, trying CHANGE column... error:", e.message);
      await prisma.$executeRawUnsafe(`ALTER TABLE LandlordDetails CHANGE customerId landlordId INT NOT NULL;`);
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE LandlordRole RENAME COLUMN customerId TO landlordId;`);
    } catch (e) {
      console.log("RENAME COLUMN failed, trying CHANGE column... error:", e.message);
      await prisma.$executeRawUnsafe(`ALTER TABLE LandlordRole CHANGE customerId landlordId INT NOT NULL;`);
    }
    
    console.log("Column rename completed successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
