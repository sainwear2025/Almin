import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const today = new Date();
    const startToday = new Date(today.setHours(0,0,0,0));
    const endToday = new Date(today.setHours(23,59,59,999));
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log("Fetching todayInvoices...");
    const todayInvoices = await prisma.invoice.aggregate({
      where: {
        createdAt: { gte: startToday, lte: endToday },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
      _count: true,
    });
    
    console.log("Fetching recentActivities...");
    const act = await prisma.activityLog.findMany({ take: 1 });
    console.log(act);

    console.log("Fetching chartData...");
    const chart = await prisma.inventoryItem.findMany({
      select: { id: true, name: true, category: true, quantity: true, minStock: true, sellingPrice: true }
    }).then(items => items.filter(i => i.quantity <= i.minStock).sort((a, b) => a.quantity - b.quantity).slice(0, 5)).catch(() => []);
    console.log("Success", chart);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
