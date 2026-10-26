import prisma from '../config/db.js';

export async function getAdminOverview() {
  const [
    openJobs,
    completedJobs,
    readyPickup,
    lowParts,
    customers,
    vehicles,
    recentJobs,
    inventory,
    mechanics,
  ] = await Promise.all([
    prisma.repairJob.count({
      where: { status: { in: ['PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS'] } },
    }),
    prisma.repairJob.count({ where: { status: 'COMPLETED' } }),
    prisma.repairJob.count({ where: { status: 'COMPLETED' } }),
    prisma.inventory.count({ where: { quantity: { lte: 10 } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.vehicle.count(),
    prisma.repairJob.findMany({
      take: 12,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: {
          include: {
            owner: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        mechanic: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.inventory.findMany({
      orderBy: { quantity: 'asc' },
      take: 10,
    }),
    prisma.user.findMany({
      where: { role: 'MECHANIC' },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  const statusBreakdown = await prisma.repairJob.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  return {
    metrics: {
      openJobs,
      completedJobs,
      readyForPickup: readyPickup,
      partsLow: lowParts,
      customers,
      vehicles,
      mechanics: mechanics.length,
    },
    statusBreakdown: statusBreakdown.map((row) => ({
      status: row.status,
      count: row._count.status,
    })),
    recentJobs: recentJobs.map((job) => ({
      id: job.id,
      status: job.status,
      description: job.description,
      notes: job.notes,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      updatedAt: job.updatedAt,
      vehicle: job.vehicle
        ? {
            make: job.vehicle.make,
            model: job.vehicle.model,
            year: job.vehicle.year,
            licensePlate: job.vehicle.licensePlate,
          }
        : null,
      customer: job.vehicle?.owner
        ? {
            firstName: job.vehicle.owner.firstName,
            lastName: job.vehicle.owner.lastName,
            email: job.vehicle.owner.email,
            phone: job.vehicle.owner.phone,
          }
        : null,
      mechanic: job.mechanic,
    })),
    inventory,
    mechanics,
  };
}
