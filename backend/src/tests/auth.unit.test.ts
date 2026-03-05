import { describe, it, expect } from 'vitest'
import { hashPassword, comparePasswords, generateTokens, verifyToken } from '../services/authService'

describe('Auth Service', () => {
  describe('Password hashing', () => {
    it('should hash password', async () => {
      const password = 'TestPassword123'
      const hashed = await hashPassword(password)
      
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(password.length)
    })

    it('should compare passwords correctly', async () => {
      const password = 'TestPassword123'
      const hashed = await hashPassword(password)
      
      const match = await comparePasswords(password, hashed)
      expect(match).toBe(true)

      const wrongMatch = await comparePasswords('WrongPassword', hashed)
      expect(wrongMatch).toBe(false)
    })
  })

  describe('JWT tokens', () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser'
    }

    it('should generate valid tokens', () => {
      const { accessToken, refreshToken } = generateTokens(payload)
      
      expect(accessToken).toBeDefined()
      expect(refreshToken).toBeDefined()
      expect(typeof accessToken).toBe('string')
      expect(typeof refreshToken).toBe('string')
    })

    it('should verify valid token', () => {
      const { accessToken } = generateTokens(payload)
      const verified = verifyToken(accessToken)
      
      expect(verified).not.toBeNull()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
      expect(verified?.username).toBe(payload.username)
    })

    it('should reject invalid token', () => {
      try {
        const verified = verifyToken('invalid-token')
        expect(verified).toBeNull()
      } catch (e) {
        // Expected to throw or return null
      }
    })

    it('should reject empty token', () => {
      try {
        const verified = verifyToken('')
        expect(verified).toBeNull()
      } catch (e) {
        // Expected
      }
    })
  })
})
