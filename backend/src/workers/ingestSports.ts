import { setCache } from '../utils/redisClient.js';

// Centralised mock data representing an external 3rd-party Tracking API
const externalEventsApi = [
  {
    id: '1',
    country: 'USA',
    sport: 'Football',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    score: '21-17',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '2',
    country: 'England',
    sport: 'Football',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    score: '2-1',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '3',
    country: 'Spain',
    sport: 'Football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    score: '3-2',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '4',
    country: 'India',
    sport: 'Cricket',
    homeTeam: 'India',
    awayTeam: 'Pakistan',
    score: '187/4',
    status: 'live',
    timestamp: Date.now(),
  },
];

/**
 * Executes as an AWS EventBridge Scheduled Rule (CRON)
 * Fetches data from remote APIs asynchronously and seeds the Redis cache
 * to ensure 0-latency API response times globally.
 */
export const handler = async (_event: any = {}) => {
  console.log('CRON: Executing async sports ingestion worker...');

  try {
    // 1. Fetch latest data (Mocked)
    const latestEvents = externalEventsApi;

    // 2. Compute country-specific caches
    const byCountry = latestEvents.reduce((acc: Record<string, any[]>, e) => {
      const c = e.country.toLowerCase();
      if (!acc[c]) acc[c] = [];
      acc[c].push(e);
      return acc;
    }, {});

    // 3. Save to ElastiCache / Redis indefinitely. The worker will refresh it.
    await setCache('sports_live_events', latestEvents, 300); // 5 minutes

    for (const [country, events] of Object.entries(byCountry)) {
      await setCache(`sports_by_country:${country}`, events, 300);
    }

    console.log(
      `CRON: Successfully ingested ${latestEvents.length} events into Elasticache Redis.`
    );
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('CRON: Failed to ingest sports events:', error);
    return { statusCode: 500, body: 'Failed to ingest data' };
  }
};
