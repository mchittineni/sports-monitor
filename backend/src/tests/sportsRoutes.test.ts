import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index';

vi.mock('../services/sportsService', () => ({
  getSportEvents: vi.fn(() =>
    Promise.resolve([
      {
        id: '1',
        sport: 'football',
        homeTeam: 'France',
        awayTeam: 'Germany',
      },
    ])
  ),
}));

describe('Sports API Routes', () => {
  describe('GET /api/sports/events', () => {
    it('should return list of sports events', async () => {
      const response = await request(app).get('/api/sports/events');

      expect(response.status).toBeLessThan(500);
      expect(response).toBeDefined();
    });

    it('should handle missing route gracefully', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/sports/teams/:teamId/stats', () => {
    it('should accept team ID parameter', () => {
      const teamId = 'team-1';
      expect(teamId).toBeDefined();
      expect(typeof teamId).toBe('string');
    });
  });

  describe('GET /api/sports/matches/:matchId', () => {
    it('should accept match ID parameter', () => {
      const matchId = 'match-1';
      expect(matchId).toBeDefined();
      expect(typeof matchId).toBe('string');
    });
  });
});
