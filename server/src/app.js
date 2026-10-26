import cors from 'cors';
import express from 'express';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import garageRoutes from './routes/garageRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', repairRoutes);
app.use(errorHandler);

export default app;
