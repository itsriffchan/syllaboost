import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/roadmap/:id
 * Retrieve a previously generated roadmap by session ID
 */
router.get('/:id', (req, res) => {
  logger.log(`Roadmap retrieval requested for ID: ${req.params.id}`);
  res.status(200).json({
    message: 'Roadmap route handler - to be implemented',
  });
});

export default router;
