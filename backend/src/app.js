import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import middleware
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { uploadMiddleware } from './middleware/upload.middleware.js';
import { logger } from './utils/logger.js';

// Import routes
import parseRoute from './routes/parse.route.js';
import roadmapRoute from './routes/roadmap.route.js';
import healthRoute from './routes/health.route.js';

const app = express();

// Middleware: CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware: Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Session management
const sessionSecret = process.env.SESSION_SECRET || 'dev-fallback-secret-change-in-production-min-32-chars-long';

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
}));

// Middleware: Rate limiting on parse endpoint
const parseRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again in an hour.',
    },
  },
});

// Middleware: Request logging
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'SyllabusAI Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      parse: 'POST /api/parse',
      roadmap: 'GET /api/roadmap/:id',
    },
  });
});

app.use('/api/health', healthRoute);
app.use('/api/roadmap', roadmapRoute);
app.use('/api/parse', parseRateLimiter, parseRoute);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
