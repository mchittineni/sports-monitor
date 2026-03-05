import { describe, it, expect, vi, beforeEach } from 'vitest';
import aiService, { chatWithAI } from '../services/ai';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          response: 'Test AI response',
        },
      })
    ),
    get: vi.fn(),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    default: {
      ...mockAxiosInstance,
      create: vi.fn(() => mockAxiosInstance),
    },
    // Required for some ESM resolutions
    create: vi.fn(() => mockAxiosInstance),
  };
});

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chatWithAI', () => {
    it('should send message to AI', async () => {
      const response = await chatWithAI('What sports are popular today?');
      expect(response).toBeDefined();
      expect(response).toBe('Test AI response');
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
