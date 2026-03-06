import Redis from 'ioredis';

// Create a Redis client instance if URL is provided
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
