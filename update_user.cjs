const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({
    where: { email: 'Alminstore@gmail.com' },
    data: { email: 'alminstore@gmail.com' },
  });
  console.log('User email updated to lowercase');
}
main().catch(console.error).finally(() => prisma.$disconnect());
