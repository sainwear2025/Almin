const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'alminstore@gmail.com' } });
  console.log('Lowercase find:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
