import express from 'express';
import { getMyGarage } from '../controllers/garageController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireRoles('CUSTOMER'), getMyGarage);

export default router;
