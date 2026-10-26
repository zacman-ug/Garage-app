import * as garageService from '../services/garageService.js';

export async function getMyGarage(req, res, next) {
  try {
    const garage = await garageService.getGarageForCustomer(req.user.id);
    return res.json(garage);
  } catch (error) {
    return next(error);
  }
}
