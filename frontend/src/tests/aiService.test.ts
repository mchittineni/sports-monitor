import { describe, it, expect, vi, beforeEach } from 'vitest';
import aiService, { chatWithAI } from '../services/ai';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          response: 'Test AI response',
        },
      })
    ),
  },
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chatWithAI', () => {
    it('should send message to AI', async () => {
      const response = await chatWithAI('What sports are popular today?');
      expect(response).toBeDefined();
      expect(response).toHaveProperty('response');
    });

    it('should handle empty message', async () => {
      const response = await chatWithAI('');
      expect(response).toBeDefined();
    });
  });

  describe('ai service default export', () => {
    it('should expose expected methods', () => {
      expect(aiService).toHaveProperty('chatWithAI');
      expect(aiService).toHaveProperty('generateMatchSummary');
      expect(aiService).toHaveProperty('getPrediction');
    });
  });
});
