import { api } from '../../services/api';

const STATUS_FLOW = ['PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS', 'COMPLETED'];

export const JOB_STATUSES = [...STATUS_FLOW, 'CANCELLED'];

const STATUS_COPY = {
  PENDING: {
    label: 'Checked in',
    detail: 'We’ve received your vehicle and it’s waiting for intake.',
  },
  DIAGNOSING: {
    label: 'Diagnosing',
    detail: 'A technician is confirming the issue and preparing an estimate.',
  },
  PARTS_ON_ORDER: {
    label: 'Parts on order',
    detail: 'Needed parts are being sourced. We’ll continue as soon as they arrive.',
  },
  IN_PROGRESS: {
    label: 'In progress',
    detail: 'Work is underway in the bay.',
  },
  COMPLETED: {
    label: 'Ready for pickup',
    detail: 'Repairs are finished. You’re cleared for handoff.',
  },
  CANCELLED: {
    label: 'Cancelled',
    detail: 'This repair order was cancelled. Call us if you have questions.',
  },
};

const DEMO_JOBS = [
  {
    id: 'demo-job-1',
    status: 'COMPLETED',
    description: 'Customer reports squealing noises from front wheels when braking.',
    notes: 'Replaced front worn brake pads. Rotors are in good shape. Road tested OK.',
    estimatedCost: '180000',
    actualCost: '175000',
    updatedAt: '2026-07-10T15:20:00.000Z',
    createdAt: '2026-07-09T09:00:00.000Z',
    vehicle: { make: 'Toyota', model: 'Corolla', year: 2018, licensePlate: 'UBL 123A' },
    customer: { firstName: 'Alice', lastName: 'Kigozi' },
    _phone: '256772111111',
  },
  {
    id: 'demo-job-2',
    status: 'IN_PROGRESS',
    description: 'Routine 10,000km oil service change and safety check.',
    notes: 'Oil drained. Waiting for filter attachment.',
    estimatedCost: '220000',
    actualCost: null,
    updatedAt: '2026-07-13T11:40:00.000Z',
    createdAt: '2026-07-13T08:15:00.000Z',
    vehicle: { make: 'Subaru', model: 'Forester', year: 2015, licensePlate: 'UBM 456B' },
    customer: { firstName: 'Alice', lastName: 'Kigozi' },
    _phone: '256772111111',
  },
  {
    id: 'demo-job-3',
    status: 'PENDING',
    description: 'Check engine light is flashing. Engine feels sluggish.',
    notes: null,
    estimatedCost: '100000',
    actualCost: null,
    updatedAt: '2026-07-13T16:05:00.000Z',
    createdAt: '2026-07-13T16:05:00.000Z',
    vehicle: { make: 'Honda', model: 'CR-V', year: 2020, licensePlate: 'UBP 789C' },
    customer: { firstName: 'Bob', lastName: 'Ssenyonjo' },
    _phone: '256752222222',
  },
];

function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '');
}

function normalizePlate(value = '') {
  return String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function stripInternal(job) {
  const { _phone, ...rest } = job;
  return rest;
}

function lookupDemoJobs({ phone, plate }) {
  const phoneDigits = normalizePhone(phone);
  const plateKey = normalizePlate(plate);

  return DEMO_JOBS.filter((job) => {
    const phoneMatch = phoneDigits
      ? job._phone === phoneDigits || job._phone.endsWith(phoneDigits) || phoneDigits.endsWith(job._phone)
      : true;
    const plateMatch = plateKey ? normalizePlate(job.vehicle.licensePlate) === plateKey : true;

    if (phoneDigits && plateKey) return phoneMatch && plateMatch;
    return phoneDigits ? phoneMatch : plateMatch;
  }).map(stripInternal);
}

export function getStatusMeta(status) {
  return STATUS_COPY[status] ?? {
    label: status,
    detail: 'Status update from the shop.',
  };
}

export function getTimelineSteps(status) {
  if (status === 'CANCELLED') {
    return [{ key: 'CANCELLED', ...STATUS_COPY.CANCELLED, state: 'current' }];
  }

  const activeIndex = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW.map((key, index) => {
    let state = 'upcoming';
    if (activeIndex === -1) state = 'upcoming';
    else if (index < activeIndex) state = 'done';
    else if (index === activeIndex) state = 'current';

    return { key, ...STATUS_COPY[key], state };
  });
}

export async function trackVehicle({ phone, plate }) {
  const query = new URLSearchParams();
  if (phone?.trim()) query.set('phone', phone.trim());
  if (plate?.trim()) query.set('plate', plate.trim());

  try {
    const data = await api.get(`/track?${query.toString()}`);
    return {
      jobs: data.jobs ?? [],
      source: 'api',
    };
  } catch {
    const jobs = lookupDemoJobs({ phone, plate });
    return {
      jobs,
      source: 'demo',
    };
  }
}

export const trackHints = {
  phones: ['+256772111111', '+256752222222'],
  plates: ['UBL 123A', 'UBM 456B', 'UBP 789C'],
};
