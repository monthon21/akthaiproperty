const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Fetching first 3 customers in DB:");
  const customers = await prisma.customer.findMany({
    take: 3,
    include: { details: true }
  });
  console.log(JSON.stringify(customers, null, 2));

  if (customers.length === 0) {
    console.log("No customers found in DB.");
    return;
  }

  const testName = customers[0].name;
  console.log(`\nTesting search query for customer name: "${testName}"`);

  const whereConditions = {
    isAvailable: true,
    OR: [
      {
        customer: {
          name: { contains: testName }
        }
      },
      {
        customer: {
          details: {
            fullname: { contains: testName }
          }
        }
      }
    ]
  };

  const assets = await prisma.asset.findMany({
    where: whereConditions,
    include: {
      customer: true
    }
  });

  console.log(`Found ${assets.length} assets matching:`);
  console.log(JSON.stringify(assets.map(a => ({ id: a.id, code: a.code, title: a.title, customer: a.customer })), null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
