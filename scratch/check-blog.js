const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Check what type the id actually is
p.blogPost.findFirst()
  .then(r => {
    if (r) {
      console.log('id value:', r.id);
      console.log('id type:', typeof r.id);
    } else {
      console.log('No posts found');
    }
  })
  .catch(e => console.error('DB ERROR:', e.message))
  .finally(() => p.$disconnect());
