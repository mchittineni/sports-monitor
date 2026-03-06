import Redis from 'ioredis';

/**
 * Lazily-initialised ioredis client.
 * The client is skipped entirely in test mode so unit tests never need a real Redis.
 * REDIS_URL defaults to redis://localhost:6379 for local development.
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const isTestMode = process.env.NODE_ENV === 'test';

let redis: Redis | null = null;

if (!isTestMode) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
  }
}

/**
 * Retrieves and deserialises a cached value from Redis.
 * Returns null when the key is missing, the client is uninitialised, or an error occurs
 * so callers can degrade gracefully without crashing.
 *
 * @param {string} key - The Redis key to look up.
 * @returns {Promise<any | null>} The parsed value, or null on miss/error.
 */
export const getCache = async (key: string): Promise<any | null> => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Get Error (${key}):`, error);
    return null;
  }
};

/**
 * Serialises and stores a value in Redis with an expiry.
 * Silently swallows errors so a Redis outage does not crash the request path.
 *
 * @param {string} key        - The Redis key to write to.
 * @param {any}    value      - The value to serialise as JSON.
 * @param {number} ttlSeconds - Time-to-live in seconds (default 60).
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 60
): Promise<void> => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error(`Redis Set Error (${key}):`, error);
  }
};

export default redis;
