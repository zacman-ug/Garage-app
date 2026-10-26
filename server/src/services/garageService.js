import prisma from '../config/db.js';

function mapCustomerJob(job) {
  return {
    id: job.id,
    status: job.status,
    description: job.description,
    notes: job.notes,
    estimatedCost: job.estimatedCost,
    actualCost: job.actualCost,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    vehicle: job.vehicle
      ? {
          id: job.vehicle.id,
          make: job.vehicle.make,
          model: job.vehicle.model,
          year: job.vehicle.year,
          licensePlate: job.vehicle.licensePlate,
          vin: job.vehicle.vin,
        }
      : null,
    mechanic: job.mechanic
      ? {
          firstName: job.mechanic.firstName,
          lastName: job.mechanic.lastName,
        }
      : null,
  };
}

export async function getGarageForCustomer(userId) {
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });

  const jobs = await prisma.repairJob.findMany({
    where: { vehicle: { ownerId: userId } },
    orderBy: { updatedAt: 'desc' },
    include: {
      vehicle: true,
      mechanic: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  const activeStatuses = ['PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS'];
  const activeJobs = jobs.filter((job) => activeStatuses.includes(job.status));
  const history = jobs.filter((job) => !activeStatuses.includes(job.status));

  return {
    vehicles,
    activeJobs: activeJobs.map(mapCustomerJob),
    history: history.map(mapCustomerJob),
    summary: {
      vehicleCount: vehicles.length,
      activeCount: activeJobs.length,
      completedCount: history.filter((job) => job.status === 'COMPLETED').length,
    },
  };
}
