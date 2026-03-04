import { test, expect, describe, vi } from 'vitest'
import request from 'supertest'
import { api } from './setup'

let testUserEmail = `test-${Date.now()}@sports-monitor.com`
let testUsername = `testuser${Date.now()}`
let authToken: string
let userId: string

// simple in-memory store to mimic user database
const users: Record<string, any> = {}

vi.mock('../services/authService', () => {
  return {
    registerUser: async (email: string, username: string, password: string) => {
      if (users[email]) {
        throw new Error('User with this email or username already exists')
      }
      const id = `user-${Object.keys(users).length + 1}`
      users[email] = { id, email, username, password }
      return { id, email, username }
    },
    loginUser: async (email: string, password: string) => {
      const u = users[email]
      if (!u || u.password !== password) {
        throw new Error('Invalid email or password')
      }
      return {
        user: { id: u.id, email: u.email, username: u.username },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' }
      }
    },
    getUserById: async (id: string) => {
      return Object.values(users).find(u => u.id === id) || null
    }
  }
})

// bypass real JWT authentication; always attach user from our in-memory store
vi.mock('../middleware/auth', () => {
  return {
    authMiddleware: (req: any, res: any, next: any) => {
      // use first user if present
      const first = Object.values(users)[0]
      if (first) {
        req.user = { userId: first.id }
        return next()
      }
      res.status(401).json({ error: 'Unauthorized' })
    }
  }
})


describe('Authentication API', () => {
  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const response = await api()
        .post('/api/auth/register')
        .send({
          email: testUserEmail,
          username: testUsername,
          password: 'SecurePassword123'
        })

      expect(response.status).toBe(201)
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user.email).toBe(testUserEmail)
      expect(response.body.user.username).toBe(testUsername)
      userId = response.body.user.id
    })

    test('should reject registration with short password', async () => {
      const response = await api()
        .post('/api/auth/register')
        .send({
          email: 'another@sports-monitor.com',
          username: 'anotheruser',
          password: 'short'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('at least 8 characters')
    })

    test('should reject duplicate email', async () => {
      const response = await api()
        .post('/api/auth/register')
        .send({
          email: testUserEmail,
          username: 'differentusername',
          password: 'AnotherPassword123'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    test('should login successfully with correct credentials', async () => {
      const response = await api()
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePassword123'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('tokens')
      expect(response.body.tokens).toHaveProperty('accessToken')
      expect(response.body.tokens).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe(testUserEmail)

      authToken = response.body.tokens.accessToken
    })

    test('should reject login with incorrect password', async () => {
      const response = await api()
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword'
        })

      expect(response.status).toBe(401)
    })

    test('should reject login with non-existent email', async () => {
      const response = await api()
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@sports-monitor.com',
          password: 'AnyPassword123'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /auth/me', () => {
    test('should get current user with valid token', async () => {
      const response = await api()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user.email).toBe(testUserEmail)
    })

    test('should reject request without token', async () => {
      const response = await api().get('/api/auth/me')
      expect(response.status).toBe(401)
    })

    test('should reject request with invalid token', async () => {
      const response = await api()
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })
  })
})
