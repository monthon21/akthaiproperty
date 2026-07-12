const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Renaming Customer to Landlord...");
    await prisma.$executeRawUnsafe(`RENAME TABLE Customer TO Landlord;`);
    
    console.log("Renaming CustomerDetails to LandlordDetails...");
    await prisma.$executeRawUnsafe(`RENAME TABLE CustomerDetails TO LandlordDetails;`);
    
    console.log("Renaming CustomerRole to LandlordRole...");
    await prisma.$executeRawUnsafe(`RENAME TABLE CustomerRole TO LandlordRole;`);
    
    console.log("Renaming customerId column in Asset...");
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Asset RENAME COLUMN customerId TO landlordId;`);
    } catch (e) {
      console.log("RENAME COLUMN failed, trying CHANGE column... error:", e.message);
      await prisma.$executeRawUnsafe(`ALTER TABLE Asset CHANGE customerId landlordId INT NULL;`);
    }
    
    console.log("Database rename completed successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
