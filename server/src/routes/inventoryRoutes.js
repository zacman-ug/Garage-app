import express from 'express';
import { adjustPart, listParts } from '../controllers/inventoryController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRoles('ADMIN', 'MECHANIC'));

router.get('/', listParts);
router.post('/adjust', adjustPart);
router.post('/:id/adjust', adjustPart);

export default router;
