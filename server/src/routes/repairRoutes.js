import express from 'express';
import { createJob, getJobs, trackJobs, updateJob } from '../controllers/repairController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/track', trackJobs);
router.post('/track', trackJobs);
router.get('/jobs', authenticate, requireRoles('ADMIN', 'MECHANIC'), getJobs);
router.post('/jobs', authenticate, requireRoles('ADMIN', 'MECHANIC'), createJob);
router.patch('/jobs/:id', authenticate, requireRoles('ADMIN', 'MECHANIC'), updateJob);

export default router;
