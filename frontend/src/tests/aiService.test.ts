import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatWithAI, getSportRecommendations } from '../services/ai';

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

  describe('getSportRecommendations', () => {
    it('should get sport recommendations', async () => {
      const recommendations = await getSportRecommendations(['football']);
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle multiple sports', async () => {
      const recommendations = await getSportRecommendations([
        'football',
        'basketball',
      ]);
      expect(recommendations).toBeDefined();
    });
  });
});
