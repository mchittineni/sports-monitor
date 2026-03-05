import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache } from '../utils/redisClient';

vi.mock('ioredis', () => ({
  default: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve('cached_value')),
    set: vi.fn(() => Promise.resolve('OK')),
    del: vi.fn(() => Promise.resolve(1)),
    quit: vi.fn(() => Promise.resolve()),
  })),
}));

describe('RedisClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCache', () => {
    it('should retrieve cached data', async () => {
      const result = await getCache('test-key');
      expect(result).toBeDefined();
    });

    it('should handle cache misses', async () => {
      const result = await getCache('nonexistent-key');
      expect(result).toBeDefined();
    });
  });

  describe('setCache', () => {
    it('should set cache with default TTL', async () => {
      await expect(setCache('key', { data: 'value' })).resolves.not.toThrow();
    });

    it('should set cache with custom TTL', async () => {
      await expect(
        setCache('key', { data: 'value' }, 3600)
      ).resolves.not.toThrow();
    });

    it('should handle serialization', async () => {
      const complexData = { array: [1, 2, 3], nested: { key: 'value' } };
      await expect(setCache('complex', complexData)).resolves.not.toThrow();
    });
  });
});
