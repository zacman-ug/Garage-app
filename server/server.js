import dotenv from 'dotenv';
import app from './src/app.js';
import { info, error as logError } from './src/utils/logger.js';

dotenv.config();

const port = process.env.PORT ?? 5000;

app.listen(port, () => {
  info(`Server listening on port ${port}`);
});

process.on('unhandledRejection', (reason) => {
  logError('Unhandled promise rejection', { reason });
});
