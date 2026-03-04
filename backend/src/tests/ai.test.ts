import { test, expect, describe } from 'vitest'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

describe('AI API', () => {
  describe('POST /ai/chat', () => {
    test('should respond to sports question', async () => {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: 'What sports events are happening today?',
        context: 'sports'
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('response')
      expect(typeof response.data.response).toBe('string')
      expect(response.data.response.length).toBeGreaterThan(0)
    })

    test('should return 400 without message', async () => {
      try {
        await axios.post(`${API_URL}/ai/chat`, {
          context: 'sports'
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('POST /ai/summarize-match', () => {
    test('should generate match summary', async () => {
      const response = await axios.post(`${API_URL}/ai/summarize-match`, {
        match: {
          sport: 'Football',
          homeTeam: 'France',
          awayTeam: 'Germany',
          score: '2-1',
          minute: 45
        }
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('summary')
      expect(typeof response.data.summary).toBe('string')
    })

    test('should return 400 without match data', async () => {
      try {
        await axios.post(`${API_URL}/ai/summarize-match`, {})
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('GET /ai/prediction/:matchId', () => {
    test('should return prediction for a match', async () => {
      const response = await axios.get(`${API_URL}/ai/prediction/test-match-id`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('matchId')
    })
  })
})
