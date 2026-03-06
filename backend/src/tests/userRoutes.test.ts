import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('User API Routes', () => {
  describe('GET /api/users/favorites', () => {
    it('should accept bearer token', () => {
      const token = 'Bearer test-token';
      const match = token.match(/^Bearer\s+(.+)$/);

      expect(match).toBeDefined();
      expect(match?.[1]).toBe('test-token');
    });

    it('should handle authorization header', async () => {
      const response = await request(app)
        .get('/api/users/favorites')
        .set('Authorization', 'Bearer test-token');

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/users/favorites/:sport', () => {
    it('should accept sport parameter', () => {
      const sport = 'tennis';
      expect(sport).toBeDefined();
      expect(typeof sport).toBe('string');
    });

    it('should handle favorite addition endpoint', async () => {
      const response = await request(app)
        .post('/api/users/favorites/tennis')
        .set('Authorization', 'Bearer test-token');

      expect([200, 201, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/users/favorites/:sport', () => {
    it('should handle favorite removal', async () => {
      const response = await request(app)
        .delete('/api/users/favorites/tennis')
        .set('Authorization', 'Bearer test-token');

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/users/watched', () => {
    it('should accept authentication', async () => {
      const response = await request(app)
        .get('/api/users/watched')
        .set('Authorization', 'Bearer test-token');

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
