import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint for uptime monitoring
 */
router.get('/', (req, res) => {
  logger.log('Health check requested');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
