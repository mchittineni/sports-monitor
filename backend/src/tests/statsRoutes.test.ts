import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index';

vi.mock('../utils/redisClient.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

describe('Stats API Routes', () => {
  describe('GET /api/stats/:countryCode', () => {
    it('should return 200 with stats shape for a valid country code', async () => {
      const response = await request(app).get('/api/stats/usa');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('countryCode', 'usa');
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('activeSports');
      expect(response.body).toHaveProperty('recentMatches');
    });

    it('should reflect the countryCode param in the response', async () => {
      const response = await request(app).get('/api/stats/england');

      expect(response.status).toBe(200);
      expect(response.body.countryCode).toBe('england');
    });

    it('should return activeSports as an array', async () => {
      const response = await request(app).get('/api/stats/india');

      expect(Array.isArray(response.body.activeSports)).toBe(true);
    });

    it('should return recentMatches as an array', async () => {
      const response = await request(app).get('/api/stats/spain');

      expect(Array.isArray(response.body.recentMatches)).toBe(true);
    });
  });

  describe('GET /api/stats/heatmap/global', () => {
    it('should return 200 with a data array', async () => {
      const response = await request(app).get('/api/stats/heatmap/global');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
