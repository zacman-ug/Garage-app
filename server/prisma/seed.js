import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database before seeding...');
  await prisma.jobPart.deleteMany({});
  await prisma.repairJob.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@garagemaster.com',
      passwordHash: commonPasswordHash,
      firstName: 'Alex',
      lastName: 'Owner',
      phone: '+256700000001',
      role: 'ADMIN',
    },
  });

  const mechanic1 = await prisma.user.create({
    data: {
      email: 'johndoe@garagemaster.com',
      passwordHash: commonPasswordHash,
      firstName: 'John',
      lastName: 'Mechanic',
      phone: '+256700000002',
      role: 'MECHANIC',
    },
  });

  const mechanic2 = await prisma.user.create({
    data: {
      email: 'sarahsmith@garagemaster.com',
      passwordHash: commonPasswordHash,
      firstName: 'Sarah',
      lastName: 'Wrench',
      phone: '+256700000003',
      role: 'MECHANIC',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer.alice@gmail.com',
      passwordHash: commonPasswordHash,
      firstName: 'Alice',
      lastName: 'Kigozi',
      phone: '+256772111111',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer.bob@gmail.com',
      passwordHash: commonPasswordHash,
      firstName: 'Bob',
      lastName: 'Ssenyonjo',
      phone: '+256752222222',
      role: 'CUSTOMER',
    },
  });

  console.log('Created Users');

  const vehicle1 = await prisma.vehicle.create({
    data: {
      vin: '1YVHP88H785M12345',
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      licensePlate: 'UBL 123A',
      ownerId: customer1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      vin: '4T1BF1FK2LU123456',
      make: 'Subaru',
      model: 'Forester',
      year: 2015,
      licensePlate: 'UBM 456B',
      ownerId: customer1.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      vin: '5UXWX7C51HL123456',
      make: 'Honda',
      model: 'CR-V',
      year: 2020,
      licensePlate: 'UBP 789C',
      ownerId: customer2.id,
    },
  });

  console.log('Created Vehicles');

  const part1 = await prisma.inventory.create({
    data: {
      partName: 'Front Brake Pads Set',
      sku: 'BRK-PAD-001',
      carType: 'Toyota',
      quantity: 15,
      costPrice: 80000.0,
      retailPrice: 120000.0,
    },
  });

  const part2 = await prisma.inventory.create({
    data: {
      partName: 'Synthetic Engine Oil 5W-30 (4L)',
      sku: 'OIL-5W30-4L',
      carType: 'Universal',
      quantity: 30,
      costPrice: 100000.0,
      retailPrice: 150000.0,
    },
  });

  const part3 = await prisma.inventory.create({
    data: {
      partName: 'Oil Filter',
      sku: 'FLT-OIL-002',
      carType: 'Honda',
      quantity: 50,
      costPrice: 20000.0,
      retailPrice: 35000.0,
    },
  });

  const part4 = await prisma.inventory.create({
    data: {
      partName: 'Spark Plug Platinum',
      sku: 'PLG-PLAT-09',
      carType: 'Universal',
      quantity: 8,
      costPrice: 15000.0,
      retailPrice: 25000.0,
    },
  });

  console.log('Created Inventory');

  const job1 = await prisma.repairJob.create({
    data: {
      vehicleId: vehicle1.id,
      mechanicId: mechanic1.id,
      description: 'Customer reports squealing noises from front wheels when braking.',
      status: 'COMPLETED',
      estimatedCost: 180000.0,
      actualCost: 175000.0,
      notes: 'Replaced front worn brake pads. Rotors are in good shape. Road tested OK.',
    },
  });

  await prisma.jobPart.create({
    data: {
      repairJobId: job1.id,
      partId: part1.id,
      quantityUsed: 1,
      unitPriceAtSale: part1.retailPrice,
    },
  });

  const job2 = await prisma.repairJob.create({
    data: {
      vehicleId: vehicle2.id,
      mechanicId: mechanic2.id,
      description: 'Routine 10,000km oil service change and safety check.',
      status: 'IN_PROGRESS',
      estimatedCost: 220000.0,
      actualCost: null,
      notes: 'Oil drained. Waiting for filter attachment.',
    },
  });

  await prisma.jobPart.createMany({
    data: [
      {
        repairJobId: job2.id,
        partId: part2.id,
        quantityUsed: 1,
        unitPriceAtSale: part2.retailPrice,
      },
      {
        repairJobId: job2.id,
        partId: part3.id,
        quantityUsed: 1,
        unitPriceAtSale: part3.retailPrice,
      },
    ],
  });

  await prisma.repairJob.create({
    data: {
      vehicleId: vehicle3.id,
      mechanicId: null,
      description: 'Check engine light is flashing. Engine feels sluggish.',
      status: 'PENDING',
      estimatedCost: 100000.0,
      notes: null,
    },
  });

  console.log('Created Repair Jobs & Linked Parts Usage');
  console.log('Seeding complete!');
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
