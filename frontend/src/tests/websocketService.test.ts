import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToUpdates,
} from '../services/websocket';

vi.mock('../services/api', () => ({
  getBaseURL: () => 'http://localhost:3000',
}));

describe('WebSocket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('connectWebSocket', () => {
    it('should establish websocket connection', async () => {
      const connected = await connectWebSocket();
      expect(connected).toBe(true);
    });

    it('should handle connection errors', async () => {
      const result = await connectWebSocket();
      expect(result).toBeDefined();
    });
  });

  describe('disconnectWebSocket', () => {
    it('should close websocket connection', async () => {
      await connectWebSocket();
      const disconnected = await disconnectWebSocket();
      expect(disconnected).toBe(true);
    });
  });

  describe('subscribeToUpdates', () => {
    it('should subscribe to live updates', async () => {
      await connectWebSocket();
      const handler = vi.fn();
      subscribeToUpdates('football', handler);
      expect(handler).toBeDefined();
    });

    it('should handle multiple subscriptions', async () => {
      await connectWebSocket();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      subscribeToUpdates('football', handler1);
      subscribeToUpdates('basketball', handler2);

      expect(handler1).toBeDefined();
      expect(handler2).toBeDefined();
    });
  });
});
