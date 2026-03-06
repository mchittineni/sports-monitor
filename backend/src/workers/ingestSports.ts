import { setCache } from '../utils/redisClient.js';

// Static mock data — timestamps are generated fresh per invocation inside the handler
const mockEventsData = [
  {
    id: '1',
    country: 'USA',
    sport: 'Football',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    score: '21-17',
    status: 'live',
  },
  {
    id: '2',
    country: 'England',
    sport: 'Football',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    score: '2-1',
    status: 'live',
  },
  {
    id: '3',
    country: 'Spain',
    sport: 'Football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    score: '3-2',
    status: 'live',
  },
  {
    id: '4',
    country: 'India',
    sport: 'Cricket',
    homeTeam: 'India',
    awayTeam: 'Pakistan',
    score: '187/4',
    status: 'live',
  },
];

/**
 * Executes as an AWS EventBridge Scheduled Rule (CRON).
 * Fetches data from remote APIs asynchronously and seeds the Redis cache
 * to ensure 0-latency API response times globally.
 */
export const handler = async (_event: any = {}) => {
  console.log('CRON: Executing async sports ingestion worker...');

  try {
    // Stamp the current time at invocation, not at module load
    const timestamp = Date.now();
    const latestEvents = mockEventsData.map((e) => ({ ...e, timestamp }));

    // Compute country-specific caches
    const byCountry = latestEvents.reduce((acc: Record<string, any[]>, e) => {
      const c = e.country.toLowerCase();
      if (!acc[c]) acc[c] = [];
      acc[c].push(e);
      return acc;
    }, {});

    // Write all cache keys in parallel
    await Promise.all([
      setCache('sports_live_events', latestEvents, 300),
      ...Object.entries(byCountry).map(([country, events]) =>
        setCache(`sports_by_country:${country}`, events, 300)
      ),
    ]);

    console.log(
      `CRON: Successfully ingested ${latestEvents.length} events into Elasticache Redis.`
    );
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('CRON: Failed to ingest sports events:', error);
    return { statusCode: 500, body: 'Failed to ingest data' };
  }
};
