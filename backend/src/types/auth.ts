// Authentication and User Type Definitions
// Used across auth service, middleware, and routes

import { Request } from 'express'

/**
 * Payload stored inside JWT tokens
 */
export interface TokenPayload {
  userId: string
  email: string
  username: string
  iat: number
  exp: number
}

/**
 * JWT token pair (access + refresh)
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/**
 * Authenticated request with user context
 */
export interface AuthRequest extends Request {
  user?: TokenPayload
}

/**
 * Registration request body
 */
export interface RegisterRequest {
  email: string
  username: string
  password: string
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Authentication response with tokens
 */
export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
  }
  tokens: AuthTokens
}

/**
 * User profile response
 */
export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: Date
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string
  statusCode: number
  timestamp: string
}

/**
 * Validation error
 */
export interface ValidationError extends ErrorResponse {
  fields?: Record<string, string>
}
