import { test, expect, describe, beforeAll } from 'vitest'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'
let testUserEmail = `test-${Date.now()}@sports-monitor.com`
let testUsername = `testuser${Date.now()}`
let authToken: string
let userId: string

describe('Authentication API', () => {
  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: testUserEmail,
        username: testUsername,
        password: 'SecurePassword123'
      })

      expect(response.status).toBe(201)
      expect(response.data.user).toHaveProperty('id')
      expect(response.data.user.email).toBe(testUserEmail)
      expect(response.data.user.username).toBe(testUsername)
      userId = response.data.user.id
    })

    test('should reject registration with short password', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, {
          email: 'another@sports-monitor.com',
          username: 'anotheruser',
          password: 'short'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        expect(error.response.data.error).toContain('at least 8 characters')
      }
    })

    test('should reject duplicate email', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, {
          email: testUserEmail,
          username: 'differentusername',
          password: 'AnotherPassword123'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('POST /auth/login', () => {
    test('should login successfully with correct credentials', async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUserEmail,
        password: 'SecurePassword123'
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('tokens')
      expect(response.data.tokens).toHaveProperty('accessToken')
      expect(response.data.tokens).toHaveProperty('refreshToken')
      expect(response.data.user.email).toBe(testUserEmail)
      
      authToken = response.data.tokens.accessToken
    })

    test('should reject login with incorrect password', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: testUserEmail,
          password: 'WrongPassword'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })

    test('should reject login with non-existent email', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: 'nonexistent@sports-monitor.com',
          password: 'AnyPassword123'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })
  })

  describe('GET /auth/me', () => {
    test('should get current user with valid token', async () => {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      expect(response.data.user).toHaveProperty('id')
      expect(response.data.user.email).toBe(testUserEmail)
    })

    test('should reject request without token', async () => {
      try {
        await axios.get(`${API_URL}/auth/me`)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })

    test('should reject request with invalid token', async () => {
      try {
        await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: 'Bearer invalid-token' }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })
  })
})
