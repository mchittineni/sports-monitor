import express, { Request, Response } from 'express'
import { chatWithClaude, generateMatchSummary, getPrediction } from '../../services/aiService.js'

const router = express.Router()

// Chat endpoint
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message required' })
    }

    const response = await chatWithClaude(message, context)
    res.status(200).json({ response })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ error: 'Failed to process chat' })
  }
})

// Generate match summary
router.post('/summarize-match', async (req: Request, res: Response) => {
  try {
    const { match } = req.body

    if (!match) {
      return res.status(400).json({ error: 'Match data required' })
    }

    const summary = await generateMatchSummary(match)
    res.status(200).json({ summary })
  } catch (error) {
    console.error('Summary generation error:', error)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

// Get match prediction
router.get('/prediction/:matchId', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params
    const prediction = await getPrediction(matchId)
    res.status(200).json(prediction)
  } catch (error) {
    console.error('Prediction error:', error)
    res.status(500).json({ error: 'Failed to get prediction' })
  }
})

export default router
