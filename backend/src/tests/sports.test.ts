import { test, expect, describe } from 'vitest'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

describe('Sports API', () => {
  describe('GET /sports/live', () => {
    test('should return live events', async () => {
      const response = await axios.get(`${API_URL}/sports/live`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      
      if (response.data.length > 0) {
        const event = response.data[0]
        expect(event).toHaveProperty('sport')
        expect(event).toHaveProperty('homeTeam')
        expect(event).toHaveProperty('awayTeam')
        expect(event).toHaveProperty('status')
      }
    })
  })

  describe('GET /sports/by-country', () => {
    test('should return events for a specific country', async () => {
      const response = await axios.get(`${API_URL}/sports/by-country`, {
        params: { country: 'Brazil' }
      })

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)

      if (response.data.length > 0) {
        response.data.forEach((event: any) => {
          expect(event.country).toMatch(/Brazil|BR/)
        })
      }
    })

    test('should return 400 without country parameter', async () => {
      try {
        await axios.get(`${API_URL}/sports/by-country`)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('GET /sports/by-sport/:sport', () => {
    test('should return events for a specific sport', async () => {
      const response = await axios.get(`${API_URL}/sports/by-sport/Football`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })
})

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await axios.get('http://localhost:3001/health')

    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('status')
    expect(response.data.status).toBe('ok')
    expect(response.data).toHaveProperty('timestamp')
  })
})
