import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.log(`Server running on http://localhost:${PORT}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.log('Server closed');
    process.exit(0);
  });
});

export default server;
