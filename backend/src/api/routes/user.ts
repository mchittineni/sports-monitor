import express, { Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.js'
import { query } from '../../database/connection.js'

const router = express.Router()

// Get user favorites (protected)
router.get('/favorites', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await query(
      'SELECT sport FROM user_favorite_sports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    )

    res.status(200).json({
      favorites: result.map((r: any) => r.sport)
    })
  } catch (error) {
    console.error('Favorites error:', error)
    res.status(500).json({ error: 'Failed to get favorites' })
  }
})

// Add favorite sport (protected)
router.post('/favorites/:sport', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { sport } = req.params

    await query(
      'INSERT INTO user_favorite_sports (user_id, sport) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, sport]
    )

    res.status(201).json({ message: `Added ${sport} to favorites` })
  } catch (error) {
    console.error('Add favorite error:', error)
    res.status(500).json({ error: 'Failed to add favorite' })
  }
})

// Remove favorite sport (protected)
router.delete('/favorites/:sport', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { sport } = req.params

    await query(
      'DELETE FROM user_favorite_sports WHERE user_id = $1 AND sport = $2',
      [req.user.userId, sport]
    )

    res.status(200).json({ message: `Removed ${sport} from favorites` })
  } catch (error) {
    console.error('Remove favorite error:', error)
    res.status(500).json({ error: 'Failed to remove favorite' })
  }
})

// Get watched matches (protected)
router.get('/watched', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await query(
      `SELECT m.*, uwm.watched_at
       FROM user_watched_matches uwm
       JOIN matches m ON uwm.match_id = m.id
       WHERE uwm.user_id = $1
       ORDER BY uwm.watched_at DESC
       LIMIT 20`,
      [req.user.userId]
    )

    res.status(200).json({ matches: result })
  } catch (error) {
    console.error('Watched matches error:', error)
    res.status(500).json({ error: 'Failed to get watched matches' })
  }
})

export default router
