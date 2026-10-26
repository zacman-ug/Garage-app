import express from 'express';
import { getOverview, listAllJobs } from '../controllers/adminController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRoles('ADMIN', 'MECHANIC'));

router.get('/overview', getOverview);
router.get('/jobs', listAllJobs);

export default router;
