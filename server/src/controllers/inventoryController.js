import * as inventoryService from '../services/inventoryService.js';

export async function listParts(req, res, next) {
  try {
    const parts = await inventoryService.listInventory();
    return res.json({ parts });
  } catch (error) {
    return next(error);
  }
}

export async function adjustPart(req, res, next) {
  try {
    const result = await inventoryService.adjustInventory({
      partId: req.body.partId || req.params.id || undefined,
      partName: req.body.partName,
      carType: req.body.carType,
      action: req.body.action,
      quantity: req.body.quantity,
      unitPrice: req.body.unitPrice ?? req.body.price,
      repairJobId: req.body.repairJobId,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
