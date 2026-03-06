import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../../utils/redisClient.js';

/**
 * Middleware to cache API responses using Redis and append Cache-Control headers.
 * @param durationSeconds Time in seconds to cache the response
 */
export const cacheResponse = (durationSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Create a unique cache key based on the original URL
      const key = `cache:${req.originalUrl}`;
      const cachedData = await getCache(key);

      if (cachedData) {
        // Append Edge Cache-Control headers similar to worldmonitor-main
        res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);
        return res.status(200).json(cachedData);
      }

      // Override the res.json method to intercept and save the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Save to Redis asynchronously
        setCache(key, body, durationSeconds).catch((err: any) =>
          console.error(`Cache save error for ${key}:`, err)
        );

        // Append Edge Cache-Control headers
        res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);

        // Return original execution
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
