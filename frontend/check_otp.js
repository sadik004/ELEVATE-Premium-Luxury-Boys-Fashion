const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const latestOtp = await prisma.oTP.findFirst({
    where: { email: 'admin@example.com' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(latestOtp, null, 2));
}
main().finally(() => prisma.$disconnect());
