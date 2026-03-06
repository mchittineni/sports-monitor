import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import sportsRoutes from './api/routes/sports.js';
import aiRoutes from './api/routes/ai.js';
import statsRoutes from './api/routes/stats.js';
import authRoutes from './api/routes/auth.js';
import userRoutes from './api/routes/user.js';
import { setupSwagger } from './config/swagger.js';
import { initializeWebSocket } from './services/websocketService.js';
import { initializeDatabaseConnection } from './database/connection.js';
import { startDataPipeline } from './services/dataPipeline.js';
import { errorHandler } from './api/middleware/errorHandler.js';

dotenv.config();

const app: Express = express();

// Behind a reverse proxy (API Gateway / ALB) in production we want
// Express to respect X-Forwarded-* headers for correct IP/origin data.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Security & middleware
app.use(helmet());

// Basic rate limiting to protect core APIs from abuse (disabled in development)
const apiLimiter =
  process.env.NODE_ENV === 'development'
    ? (req: any, res: any, next: any) => next() // No rate limiting in dev
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
      });

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
  })
);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const memory = process.memoryUsage();
    let dbStatus = 'ok';
    let redisStatus = 'disconnected';

    try {
      const { query } = await import('./database/connection.js');
      await query('SELECT 1');
    } catch {
      dbStatus = 'error';
    }

    try {
      const { default: redis } = await import('./utils/redisClient.js');
      if (redis && redis.status === 'ready') {
        redisStatus = 'ready';
      }
    } catch {
      redisStatus = 'error';
    }

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      metrics: {
        memory: {
          rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);

// Setup Swagger API documentation
setupSwagger(app);

// Register global error handler middleware
app.use(errorHandler);

// WebSocket initialization
initializeWebSocket(io);

// Initialize services
const initializeServices = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 Skipping service initialization in test mode');
      return;
    }

    // For development without Docker, skip DB initialization
    if (
      process.env.SKIP_DB_INIT === 'true' ||
      (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL)
    ) {
      console.log(
        '⚠️  Development mode: Skipping database and pipeline initialization (using mock data)'
      );
      return;
    }

    // Initialize database
    try {
      await initializeDatabaseConnection();
      console.log('✅ Database connected');

      // Start data pipeline
      startDataPipeline();
      console.log('✅ Data pipeline started');
    } catch (error) {
      // In development, warn but don't exit
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '⚠️  Database connection failed, using mock data:',
          error instanceof Error ? error.message : error
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to initialize services:', error);
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
};

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await initializeServices();

  return new Promise<typeof httpServer>((resolve) => {
    const listener = httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
      resolve(listener);
    });
  });
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

// Only start when not in test mode; tests can call startServer() directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { httpServer, startServer };
