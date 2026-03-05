import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient, {
  getSportsData,
  getLiveEvents,
  getCountryStats,
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

  describe('getSportsData', () => {
    it('should fetch sports data for a country', async () => {
      const data = await getSportsData('France');
      expect(data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('getLiveEvents', () => {
    it('should fetch live events', async () => {
      const events = await getLiveEvents();
      expect(events).toBeDefined();
      expect(Array.isArray(events.data)).toBe(true);
    });
  });

  describe('getCountryStats', () => {
    it('should fetch country stats', async () => {
      const stats = await getCountryStats('FR');
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('data');
    });
  });

  describe('default api client', () => {
    it('should be defined', () => {
      expect(apiClient).toBeDefined();
    });
  });
});
