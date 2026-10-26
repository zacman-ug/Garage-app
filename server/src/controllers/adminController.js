import * as adminService from '../services/adminService.js';
import * as repairService from '../services/repairService.js';

export async function getOverview(req, res, next) {
  try {
    const overview = await adminService.getAdminOverview();
    return res.json(overview);
  } catch (error) {
    return next(error);
  }
}

export async function listAllJobs(req, res, next) {
  try {
    const jobs = await repairService.listRepairJobs();
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
}
