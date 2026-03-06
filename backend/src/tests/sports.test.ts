import { test, expect, describe } from 'vitest';
import { api } from './setup';

// use shared api helper

describe('Sports API', () => {
  describe('GET /sports/live', () => {
    test('should return live events', async () => {
      const response = await api().get('/api/sports/live');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const event = response.body[0];
        expect(event).toHaveProperty('sport');
        expect(event).toHaveProperty('homeTeam');
        expect(event).toHaveProperty('awayTeam');
        expect(event).toHaveProperty('status');
      }
    });
  });

  describe('GET /sports/by-country', () => {
    test('should return events for a specific country', async () => {
      const response = await api()
        .get('/api/sports/by-country')
        .query({ country: 'Brazil' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        response.body.forEach((event: any) => {
          expect(event.country).toMatch(/Brazil|BR/);
        });
      }
    });

    test('should return 400 without country parameter', async () => {
      const response = await api().get('/api/sports/by-country');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /sports/by-sport/:sport', () => {
    test('should return events for a specific sport', async () => {
      const response = await api().get('/api/sports/by-sport/Football');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await api().get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
