import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/redisClient', () => ({
  getCache: vi.fn(),
}));

import { getSportsByCountry, getLiveEvents } from '../services/sportsService';
import { getCache } from '../utils/redisClient.js';

describe('sportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSportsByCountry', () => {
    it('should return cached events for a country', async () => {
      const events = [{ id: '1', sport: 'Football', country: 'USA' }];
      (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(events);

      const result = await getSportsByCountry('USA');

      expect(getCache).toHaveBeenCalledWith('sports_by_country:usa');
      expect(result).toEqual(events);
    });

    it('should lowercase the country name when building the cache key', async () => {
      (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await getSportsByCountry('ENGLAND');

      expect(getCache).toHaveBeenCalledWith('sports_by_country:england');
    });

    it('should return an empty array on cache miss', async () => {
      (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getSportsByCountry('France');

      expect(result).toEqual([]);
    });

    it('should return an empty array when Redis throws', async () => {
      (getCache as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Redis down')
      );

      const result = await getSportsByCountry('Spain');

      expect(result).toEqual([]);
    });
  });

  describe('getLiveEvents', () => {
    it('should return cached live events', async () => {
      const events = [{ id: '1', sport: 'Cricket' }];
      (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(events);

      const result = await getLiveEvents();

      expect(getCache).toHaveBeenCalledWith('sports_live_events');
      expect(result).toEqual(events);
    });

    it('should return an empty array on cache miss', async () => {
      (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getLiveEvents();

      expect(result).toEqual([]);
    });

    it('should return an empty array when Redis throws', async () => {
      (getCache as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Redis down')
      );

      const result = await getLiveEvents();

      expect(result).toEqual([]);
    });
  });
});
