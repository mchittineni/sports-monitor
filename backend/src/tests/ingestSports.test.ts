import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/redisClient.js', () => ({
  setCache: vi.fn().mockResolvedValue(undefined),
}));

import { handler } from '../workers/ingestSports';
import { setCache } from '../utils/redisClient.js';

describe('ingestSports worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return statusCode 200 on success', async () => {
    const result = await handler();
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('Success');
  });

  it('should cache the live events list', async () => {
    await handler();
    expect(setCache).toHaveBeenCalledWith(
      'sports_live_events',
      expect.any(Array),
      300
    );
  });

  it('should cache events grouped by country', async () => {
    await handler();
    expect(setCache).toHaveBeenCalledWith(
      'sports_by_country:usa',
      expect.any(Array),
      300
    );
    expect(setCache).toHaveBeenCalledWith(
      'sports_by_country:england',
      expect.any(Array),
      300
    );
    expect(setCache).toHaveBeenCalledWith(
      'sports_by_country:spain',
      expect.any(Array),
      300
    );
    expect(setCache).toHaveBeenCalledWith(
      'sports_by_country:india',
      expect.any(Array),
      300
    );
  });

  it('should write all cache keys in parallel (multiple setCache calls)', async () => {
    await handler();
    // 1 live_events + 4 countries = 5 total writes
    expect(setCache).toHaveBeenCalledTimes(5);
  });

  it('should stamp timestamps at invocation time, not module load time', async () => {
    const before = Date.now();
    await handler();
    const after = Date.now();

    const liveEventsCall = (setCache as ReturnType<typeof vi.fn>).mock.calls.find(
      (c: unknown[]) => c[0] === 'sports_live_events'
    );
    const events = liveEventsCall![1] as Array<{ timestamp: number }>;

    events.forEach((e) => {
      expect(e.timestamp).toBeGreaterThanOrEqual(before);
      expect(e.timestamp).toBeLessThanOrEqual(after);
    });
  });

  it('should return statusCode 500 when setCache throws', async () => {
    (setCache as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Redis unavailable')
    );
    const result = await handler();
    expect(result.statusCode).toBe(500);
    expect(result.body).toBe('Failed to ingest data');
  });
});
