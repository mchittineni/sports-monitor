import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEvents,
  getSports,
  getMatchDetails,
} from '../services/api';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          data: [
            {
              id: '1',
              sport: 'football',
              homeTeam: 'France',
            },
          ],
        },
      })
    ),
    post: vi.fn(() =>
      Promise.resolve({
        data: { success: true },
      })
    ),
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch events', async () => {
      const events = await getEvents();
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should filter events by sport', async () => {
      const events = await getEvents('football');
      expect(events).toBeDefined();
    });
  });

  describe('getSports', () => {
    it('should fetch available sports', async () => {
      const sports = await getSports();
      expect(sports).toBeDefined();
      expect(Array.isArray(sports)).toBe(true);
    });
  });

  describe('getMatchDetails', () => {
    it('should fetch match details', async () => {
      const match = await getMatchDetails('match-1');
      expect(match).toBeDefined();
      expect(match).toHaveProperty('id');
    });
  });
});
