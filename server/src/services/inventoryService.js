import prisma from '../config/db.js';
import { CAR_TYPES } from '../data/carTypes.js';

export async function listInventory() {
  return prisma.inventory.findMany({
    orderBy: [{ carType: 'asc' }, { partName: 'asc' }],
  });
}

function toSku(partName, carType) {
  const nameBit = String(partName)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16);
  const typeBit = String(carType)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .slice(0, 10);
  return `${typeBit || 'GEN'}-${nameBit || 'PART'}-${Date.now().toString().slice(-5)}`;
}

function normalizeCarType(carType) {
  const trimmed = String(carType || '').trim();
  if (!trimmed) {
    const error = new Error('Select a car type for this product.');
    error.statusCode = 400;
    throw error;
  }
  if (!CAR_TYPES.includes(trimmed)) {
    const error = new Error(`Invalid car type. Use one of: ${CAR_TYPES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

export async function adjustInventory({
  partId,
  partName,
  carType,
  action,
  quantity,
  unitPrice,
  repairJobId,
}) {
  const qty = Number(quantity);
  const price = Number(unitPrice);

  if (!['receive', 'use'].includes(action)) {
    const error = new Error('action must be "receive" or "use".');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
    const error = new Error('Enter a valid quantity (positive whole number).');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(price) || price < 0) {
    const error = new Error('Enter a valid price (0 or greater).');
    error.statusCode = 400;
    throw error;
  }

  const trimmedName = String(partName || '').trim();
  const normalizedType = partId ? null : normalizeCarType(carType);

  return prisma.$transaction(async (tx) => {
    let part = null;

    if (partId) {
      part = await tx.inventory.findUnique({ where: { id: partId } });
      if (!part) {
        const error = new Error('Selected product was not found.');
        error.statusCode = 404;
        throw error;
      }
    } else if (trimmedName && normalizedType) {
      part = await tx.inventory.findFirst({
        where: {
          carType: normalizedType,
          partName: { equals: trimmedName, mode: 'insensitive' },
        },
      });

      if (!part && action === 'use') {
        const error = new Error(
          `No ${normalizedType} product named "${trimmedName}" in stock yet. Receive stock first, or pick it from the list.`
        );
        error.statusCode = 400;
        throw error;
      }

      if (!part && action === 'receive') {
        part = await tx.inventory.create({
          data: {
            partName: trimmedName,
            carType: normalizedType,
            sku: toSku(trimmedName, normalizedType),
            quantity: 0,
            costPrice: price,
            retailPrice: price,
          },
        });
      }
    } else {
      const error = new Error('Pick a product from the list, or type a name and select a car type.');
      error.statusCode = 400;
      throw error;
    }

    if (action === 'receive') {
      const updated = await tx.inventory.update({
        where: { id: part.id },
        data: {
          quantity: { increment: qty },
          retailPrice: price,
        },
      });
      return { part: updated, action, quantity: qty, unitPrice: price };
    }

    if (part.quantity < qty) {
      const error = new Error(
        `Not enough stock for ${part.partName} (${part.carType}). On hand: ${part.quantity}, requested: ${qty}.`
      );
      error.statusCode = 400;
      throw error;
    }

    if (repairJobId) {
      const job = await tx.repairJob.findUnique({ where: { id: repairJobId } });
      if (!job) {
        const error = new Error('Repair job not found.');
        error.statusCode = 404;
        throw error;
      }

      const existingUsage = await tx.jobPart.findUnique({
        where: {
          repairJobId_partId: {
            repairJobId,
            partId: part.id,
          },
        },
      });

      if (existingUsage) {
        const previousQty = existingUsage.quantityUsed;
        const previousPrice = Number(existingUsage.unitPriceAtSale);
        const combinedQty = previousQty + qty;
        const blended =
          combinedQty === 0 ? price : (previousPrice * previousQty + price * qty) / combinedQty;

        await tx.jobPart.update({
          where: { id: existingUsage.id },
          data: {
            quantityUsed: combinedQty,
            unitPriceAtSale: blended,
          },
        });
      } else {
        await tx.jobPart.create({
          data: {
            repairJobId,
            partId: part.id,
            quantityUsed: qty,
            unitPriceAtSale: price,
          },
        });
      }
    }

    const updated = await tx.inventory.update({
      where: { id: part.id },
      data: {
        quantity: { decrement: qty },
        retailPrice: price,
      },
    });

    return {
      part: updated,
      action,
      quantity: qty,
      unitPrice: price,
      repairJobId: repairJobId || null,
    };
  });
}
