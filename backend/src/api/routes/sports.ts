import express, { Request, Response } from 'express';
import {
  getSportsByCountry,
  getLiveEvents,
} from '../../services/sportsService.js';
import { cacheResponse } from '../middleware/cacheHandler.js';

const router = express.Router();

// Get sports events by country.
// Reads from Redis key sports_by_country:<country> populated by the ingest CRON worker.
// Edge-cached for 60 s via cacheResponse middleware.
router.get(
  '/by-country',
  cacheResponse(60),
  async (req: Request, res: Response) => {
    try {
      const { country } = req.query;
      if (!country || typeof country !== 'string') {
        return res.status(400).json({ error: 'Country parameter required' });
      }

      const events = await getSportsByCountry(country);
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching sports data:', error);
      res.status(500).json({ error: 'Failed to fetch sports data' });
    }
  }
);

// Get all live events.
// Reads from Redis key sports_live_events populated by the ingest CRON worker.
// Shorter 30 s cache to reflect near-real-time update frequency.
router.get('/live', cacheResponse(30), async (req: Request, res: Response) => {
  try {
    const events = await getLiveEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching live events:', error);
    res.status(500).json({ error: 'Failed to fetch live events' });
  }
});

// Filter live events by sport type (football, cricket, basketball, etc.).
// Delegates to getLiveEvents then filters in memory; cached for 60 s.
router.get(
  '/by-sport/:sport',
  cacheResponse(60),
  async (req: Request, res: Response) => {
    try {
      const { sport } = req.params;
      if (!sport) {
        return res.status(400).json({ error: 'Sport parameter required' });
      }

      // For now just return any live events that match the sport string
      const events = await getLiveEvents();
      const filtered = events.filter(
        (e: any) =>
          typeof e.sport === 'string' &&
          e.sport.toLowerCase() === sport.toLowerCase()
      );

      res.status(200).json(filtered);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
