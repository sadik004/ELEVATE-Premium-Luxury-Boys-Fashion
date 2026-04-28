const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestOtp = await prisma.oTP.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log('Latest OTP:', latestOtp);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
