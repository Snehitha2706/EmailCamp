import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("⚡ INITIATING DIRECT PROBE...");
    const camps = await prisma.campaign.findMany({
      take: 1,
      include: {
        template: { select: { name: true } },
        _count: { select: { sends: true, events: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("✅ PROBE SUCCESSFUL! Result:", JSON.stringify(camps));
  } catch (e: any) {
    console.error("❌ PROBE DETONATED:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
