import { test, expect, describe, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app, { startServer } from '../index';

let server: any;

// mock AI service to avoid real API calls
vi.mock('../services/aiService', () => {
  return {
    chatWithClaude: async (message: string, _context?: string) => {
      return `Echo: ${message}`;
    },
    generateMatchSummary: async (matchData: any) => {
      return `Summary for ${matchData.homeTeam} vs ${matchData.awayTeam}`;
    },
    getPrediction: async (matchId: string) => {
      return { matchId, prediction: 'home', confidence: 0.75 };
    },
  };
});

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  server = await startServer();
});

afterAll(() => {
  if (server && typeof server.close === 'function') {
    server.close();
  }
});

describe('AI API', () => {
  describe('POST /ai/chat', () => {
    test('should respond to sports question', async () => {
      const response = await request(app).post('/api/ai/chat').send({
        message: 'What sports events are happening today?',
        context: 'sports',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });

    test('should return 400 without message', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ context: 'sports' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /ai/summarize-match', () => {
    test('should generate match summary', async () => {
      const response = await request(app)
        .post('/api/ai/summarize-match')
        .send({
          match: {
            sport: 'Football',
            homeTeam: 'France',
            awayTeam: 'Germany',
            score: '2-1',
            minute: 45,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(typeof response.body.summary).toBe('string');
    });

    test('should return 400 without match data', async () => {
      const response = await request(app)
        .post('/api/ai/summarize-match')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /ai/prediction/:matchId', () => {
    test('should return prediction for a match', async () => {
      const response = await request(app).get(
        '/api/ai/prediction/test-match-id'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('matchId');
    });
  });
});
