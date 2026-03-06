import express, { Request, Response } from 'express';
import {
  chatWithClaude,
  generateMatchSummary,
  getPrediction,
} from '../../services/aiService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limit for expensive Bedrock AI endpoints (10 req / 15 min per IP).
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests. Please try again later in 15 minutes.',
  },
});

// Apply limiter to all AI routes
router.use(aiLimiter);

// Single-turn or multi-turn chat via AWS Bedrock.
// Conversation history must be supplied by the caller; this endpoint is stateless.
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await chatWithClaude(message, context);
    res.status(200).json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// Generate a short, enthusiastic match summary using Claude 3 Sonnet via Bedrock.
router.post('/summarize-match', async (req: Request, res: Response) => {
  try {
    const { match } = req.body;

    if (!match) {
      return res.status(400).json({ error: 'Match data required' });
    }

    const summary = await generateMatchSummary(match);
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Retrieve an AI prediction for a match. Currently a stub — Amazon Forecast integration pending.
router.get('/prediction/:matchId', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const prediction = await getPrediction(matchId);
    res.status(200).json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to get prediction' });
  }
});

export default router;
