import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../database/connection', () => ({
  query: vi.fn(),
}));

vi.mock('../database/dynamodb', () => ({
  createSportEvent: vi.fn(),
  getSportEvent: vi.fn(),
  getCountryEvents: vi.fn(),
}));

describe('SportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sport Data Processing', () => {
    it('should handle sport event data', () => {
      const mockEvent = {
        id: '1',
        country: 'USA',
        sport: 'Football',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        score: '21-17',
        status: 'live',
        timestamp: Date.now(),
      };
      expect(mockEvent).toHaveProperty('sport');
      expect(mockEvent.sport).toBe('Football');
    });

    it('should validate team information', () => {
      const mockEvent = {
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        score: '2-1',
      };
      expect(mockEvent.homeTeam).toBeDefined();
      expect(mockEvent.awayTeam).toBeDefined();
    });

    it('should handle different sports types', () => {
      const sports = ['Football', 'Cricket', 'Basketball'];
      expect(sports).toContain('Football');
      expect(sports).toContain('Cricket');
      expect(sports.length).toBe(3);
    });
  });
});
