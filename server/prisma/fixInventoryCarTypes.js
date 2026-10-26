import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  { sku: 'BRK-PAD-001', partName: 'Front Brake Pads Set', carType: 'Toyota' },
  { sku: 'FLT-OIL-002', partName: 'Oil Filter', carType: 'Honda' },
  { sku: 'OIL-5W30-4L', partName: 'Synthetic Engine Oil 5W-30 (4L)', carType: 'Universal' },
  { sku: 'PLG-PLAT-09', partName: 'Spark Plug Platinum', carType: 'Universal' },
];

async function main() {
  for (const row of updates) {
    await prisma.inventory.updateMany({
      where: { sku: row.sku },
      data: { partName: row.partName, carType: row.carType },
    });
  }

  // Any leftover rows with Toyota/Subaru or Honda/Toyota in the name
  const leftovers = await prisma.inventory.findMany();
  for (const part of leftovers) {
    if (part.partName.includes('Toyota/Subaru') || part.partName.toLowerCase().includes('brake')) {
      await prisma.inventory.update({
        where: { id: part.id },
        data: {
          carType: 'Toyota',
          partName: part.partName.replace(/\s*\(Toyota\/Subaru\)\s*/i, '').trim() || part.partName,
        },
      });
    } else if (part.partName.includes('Honda/Toyota')) {
      await prisma.inventory.update({
        where: { id: part.id },
        data: {
          carType: 'Honda',
          partName: part.partName.replace(/\s*\(Honda\/Toyota\)\s*/i, '').trim() || part.partName,
        },
      });
    }
  }

  const parts = await prisma.inventory.findMany({ orderBy: [{ carType: 'asc' }, { partName: 'asc' }] });
  console.table(parts.map((p) => ({ partName: p.partName, carType: p.carType, qty: p.quantity, sku: p.sku })));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
