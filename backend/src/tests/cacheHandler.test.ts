import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/redisClient', () => ({
  getCache: vi.fn(),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

import { cacheResponse } from '../api/middleware/cacheHandler';
import { getCache, setCache } from '../utils/redisClient.js';

const makeMocks = () => {
  const req = { method: 'GET', originalUrl: '/api/sports' } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
};

describe('cacheResponse middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should skip cache and call next() for non-GET requests', async () => {
    const { req, res, next } = makeMocks();
    req.method = 'POST';
    await cacheResponse(60)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(getCache).not.toHaveBeenCalled();
  });

  it('should return cached data immediately on cache hit', async () => {
    (getCache as ReturnType<typeof vi.fn>).mockResolvedValue({
      events: [1, 2],
    });
    const { req, res, next } = makeMocks();
    await cacheResponse(60)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ events: [1, 2] });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set Cache-Control header on cache hit', async () => {
    (getCache as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: 'cached',
    });
    const { req, res, next } = makeMocks();
    await cacheResponse(120)(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=120'
    );
  });

  it('should call next() on cache miss and wrap res.json', async () => {
    (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const originalJson = vi.fn();
    const { req, res, next } = makeMocks();
    res.json = originalJson;
    await cacheResponse(60)(req, res, next);
    expect(next).toHaveBeenCalled();
    // res.json was replaced by middleware wrapper
    expect(res.json).not.toBe(originalJson);
  });

  it('should save response to cache via the json wrapper', async () => {
    (getCache as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { req, res, next } = makeMocks();
    const originalJson = vi.fn().mockReturnValue(res);
    res.json = originalJson;
    await cacheResponse(60)(req, res, next);
    // Invoke the wrapped json
    res.json({ result: 'fresh' });
    await vi.waitFor(() => expect(setCache).toHaveBeenCalled());
    expect(setCache).toHaveBeenCalledWith(
      'cache:/api/sports',
      { result: 'fresh' },
      60
    );
  });

  it('should call next() on Redis error (graceful degradation)', async () => {
    (getCache as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Redis down')
    );
    const { req, res, next } = makeMocks();
    await cacheResponse(60)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
