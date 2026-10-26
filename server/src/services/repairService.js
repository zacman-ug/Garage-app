import prisma from '../config/db.js';

export async function createNewRepairJob(data) {
  return prisma.repairJob.create({
    data: {
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId ?? null,
      description: data.description,
      status: data.status ?? 'PENDING',
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost ?? null,
      notes: data.notes ?? null,
    },
    include: {
      vehicle: true,
      mechanic: true,
      partsUsed: {
        include: {
          part: true,
        },
      },
    },
  });
}

export async function listRepairJobs() {
  return prisma.repairJob.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      vehicle: true,
      mechanic: true,
      partsUsed: {
        include: {
          part: true,
        },
      },
    },
  });
}

const ALLOWED_STATUSES = [
  'PENDING',
  'DIAGNOSING',
  'PARTS_ON_ORDER',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export async function updateRepairJob(id, { status, notes }) {
  const existing = await prisma.repairJob.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Repair job not found.');
    error.statusCode = 404;
    throw error;
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    const error = new Error(`Invalid status. Use one of: ${ALLOWED_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const data = {};
  if (status) data.status = status;
  if (typeof notes === 'string') data.notes = notes;

  if (Object.keys(data).length === 0) {
    const error = new Error('Provide a status and/or notes to update.');
    error.statusCode = 400;
    throw error;
  }

  return prisma.repairJob.update({
    where: { id },
    data,
    include: {
      vehicle: true,
      mechanic: true,
      partsUsed: {
        include: {
          part: true,
        },
      },
    },
  });
}

function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '');
}

function normalizePlate(value = '') {
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function toCustomerJob(job) {
  return {
    id: job.id,
    status: job.status,
    description: job.description,
    notes: job.notes,
    estimatedCost: job.estimatedCost,
    actualCost: job.actualCost,
    updatedAt: job.updatedAt,
    createdAt: job.createdAt,
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
        }
      : null,
  };
}

export async function trackRepairJobs({ phone, plate }) {
  const phoneDigits = normalizePhone(phone);
  const plateKey = normalizePlate(plate);

  if (!phoneDigits && !plateKey) {
    const error = new Error('Enter a phone number or license plate to track your vehicle.');
    error.statusCode = 400;
    throw error;
  }

  const jobs = await prisma.repairJob.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      vehicle: {
        include: {
          owner: true,
        },
      },
    },
  });

  const matches = jobs.filter((job) => {
    const ownerPhone = normalizePhone(job.vehicle?.owner?.phone);
    const jobPlate = normalizePlate(job.vehicle?.licensePlate);

    const phoneMatch = phoneDigits
      ? ownerPhone === phoneDigits || ownerPhone.endsWith(phoneDigits) || phoneDigits.endsWith(ownerPhone)
      : true;
    const plateMatch = plateKey ? jobPlate === plateKey : true;

    if (phoneDigits && plateKey) {
      return phoneMatch && plateMatch;
    }

    return phoneDigits ? phoneMatch : plateMatch;
  });

  return matches.map(toCustomerJob);
}
