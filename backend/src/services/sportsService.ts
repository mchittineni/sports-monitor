const mockEvents = [
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
  {
    id: '5',
    country: 'USA',
    sport: 'Basketball',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    score: '98-95',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '6',
    country: 'Australia',
    sport: 'Cricket',
    homeTeam: 'Australia',
    awayTeam: 'South Africa',
    score: '210/6',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '7',
    country: 'Russia',
    sport: 'Ice Hockey',
    homeTeam: 'CSKA Moscow',
    awayTeam: 'Dynamo Moscow',
    score: '3-2',
    status: 'live',
    timestamp: Date.now(),
  },
  {
    id: '8',
    country: 'Japan',
    sport: 'Baseball',
    homeTeam: 'Yomiuri Giants',
    awayTeam: 'Takohashi Carp',
    score: '5-3',
    status: 'live',
    timestamp: Date.now(),
  },
];

import { getCache, setCache } from '../utils/redisClient.js';

export const getSportsByCountry = async (country: string) => {
  try {
    const cacheKey = `sports_by_country:${country.toLowerCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Filter mock data by country
    const filtered = mockEvents.filter(
      (e) => e.country.toLowerCase() === country.toLowerCase()
    );

    // Cache the result for 30 seconds
    await setCache(cacheKey, filtered, 30);

    return filtered;
  } catch (error) {
    console.error('Error fetching sports data:', error);
    throw error;
  }
};

export const getLiveEvents = async () => {
  try {
    const cacheKey = 'sports_live_events';
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Return all mock events
    const events = mockEvents;

    // Cache the result for 15 seconds
    await setCache(cacheKey, events, 15);

    return events;
  } catch (error) {
    console.error('Error fetching live events:', error);
    throw error;
  }
};

export default {
  getSportsByCountry,
  getLiveEvents,
};
