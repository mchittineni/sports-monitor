import express, { Request, Response } from 'express'
import { getSportsByCountry, getLiveEvents } from '../../services/sportsService.js'

const router = express.Router()

// Get sports events by country
router.get('/by-country', async (req: Request, res: Response) => {
  try {
    const { country } = req.query
    if (!country || typeof country !== 'string') {
      return res.status(400).json({ error: 'Country parameter required' })
    }

    const events = await getSportsByCountry(country)
    res.status(200).json(events)
  } catch (error) {
    console.error('Error fetching sports data:', error)
    res.status(500).json({ error: 'Failed to fetch sports data' })
  }
})

// Get all live events
router.get('/live', async (req: Request, res: Response) => {
  try {
    const events = await getLiveEvents()
    res.status(200).json(events)
  } catch (error) {
    console.error('Error fetching live events:', error)
    res.status(500).json({ error: 'Failed to fetch live events' })
  }
})

// Get events by sport type
router.get('/by-sport/:sport', async (req: Request, res: Response) => {
  try {
    const { sport } = req.params
    // TODO: Implement sport filtering
    res.status(200).json({ placeholder: `Events for ${sport}` })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
