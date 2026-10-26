import * as repairService from '../services/repairService.js';

export async function createJob(req, res, next) {
  try {
    const newJob = await repairService.createNewRepairJob(req.body);
    return res.status(201).json(newJob);
  } catch (error) {
    return next(error);
  }
}

export async function getJobs(req, res, next) {
  try {
    const jobs = await repairService.listRepairJobs();
    return res.json(jobs);
  } catch (error) {
    return next(error);
  }
}

export async function trackJobs(req, res, next) {
  try {
    const phone = req.query.phone ?? req.body?.phone;
    const plate = req.query.plate ?? req.body?.plate;
    const jobs = await repairService.trackRepairJobs({ phone, plate });
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const job = await repairService.updateRepairJob(req.params.id, req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
}
