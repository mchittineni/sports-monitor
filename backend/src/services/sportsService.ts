// Redis client is now the sole source of truth for sports data.
// Background worker Lambdas populate the cache asynchronously via CRON rules.
import { getCache } from '../utils/redisClient.js';

/**
 * Retrieves all mock sports events filtered by specific country name.
 * Uses AWS architecture paradigm: Reads purely from Redis populated by CRON.
 *
 * @param {string} country - The name of the country to filter events by.
 * @returns {Promise<any[]>} A list of matching sports events.
 */
export const getSportsByCountry = async (country: string) => {
  try {
    const cacheKey = `sports_by_country:${country.toLowerCase()}`;
    const cached = await getCache(cacheKey);

    // If cache is missing (e.g. CRON failed or hasn't run), return an empty array gracefully
    // to prevent blocking user interfaces.
    if (!cached) return [];

    return cached;
  } catch (error) {
    console.error('Error fetching sports data:', error);
    return []; // Graceful empty response on ANY failure (established pattern from WorldMonitor)
  }
};

/**
 * Retrieves all currently active live sports events.
 * Uses AWS architecture paradigm: Reads purely from Redis populated by CRON.
 *
 * @returns {Promise<any[]>} An array of live local and international sports events.
 */
export const getLiveEvents = async () => {
  try {
    const cacheKey = 'sports_live_events';
    const cached = await getCache(cacheKey);

    if (!cached) return []; // Graceful degradation

    return cached;
  } catch (error) {
    console.error('Error fetching live events:', error);
    return [];
  }
};

export default {
  getSportsByCountry,
  getLiveEvents,
};
