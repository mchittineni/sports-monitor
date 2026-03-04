// Authentication exports - single entry point for auth functionality

export * from './auth.js'

// Re-export from services
export type { AuthTokens } from '../services/authService.js'

// Re-export middleware
export { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'

// Re-export routes
export { default as authRoutes } from '../api/routes/auth.js'
export { default as userRoutes } from '../api/routes/user.js'

// Re-export swagger config
export { setupSwagger } from '../config/swagger.js'
