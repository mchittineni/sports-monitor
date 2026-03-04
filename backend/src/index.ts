import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'
import sportsRoutes from './api/routes/sports.js'
import aiRoutes from './api/routes/ai.js'
import statsRoutes from './api/routes/stats.js'
import authRoutes from './api/routes/auth.js'
import userRoutes from './api/routes/user.js'
import { setupSwagger } from './config/swagger.js'
import { initializeWebSocket } from './services/websocketService.js'
import { initializeDatabaseConnection } from './database/connection.js'
import { startDataPipeline } from './services/dataPipeline.js'

dotenv.config()

const app: Express = express()

// Behind a reverse proxy (API Gateway / ALB) in production we want
// Express to respect X-Forwarded-* headers for correct IP/origin data.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Security & middleware
app.use(helmet())

// Basic rate limiting to protect core APIs from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
})

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
  })
)

// Apply rate limiting to all API routes
app.use('/api', apiLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/sports', sportsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/stats', statsRoutes)

// Setup Swagger API documentation
setupSwagger(app)

// WebSocket initialization
initializeWebSocket(io)

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize database
    await initializeDatabaseConnection()
    console.log('✅ Database connected')

    // Start data pipeline
    startDataPipeline()
    console.log('✅ Data pipeline started')
  } catch (error) {
    console.error('Failed to initialize services:', error)
    process.exit(1)
  }
}

const PORT = process.env.PORT || 3001

const startServer = async () => {
  await initializeServices()

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📡 WebSocket server running on ws://localhost:${PORT}`)
  })
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

startServer()

export default app
