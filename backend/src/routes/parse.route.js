import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/parse
 * Upload syllabus, extract topics, generate project roadmap
 */
router.post('/', (req, res) => {
  logger.log('Parse route - implementation pending');
  res.status(200).json({
    message: 'Parse route handler - to be implemented',
  });
});

export default router;
