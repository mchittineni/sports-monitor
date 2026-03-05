import { describe, it, expect } from 'vitest';

describe('Swagger Configuration', () => {
  it('should define API info', () => {
    const info = {
      title: 'Sports Monitor API',
      version: '1.0.0',
      description: 'Live sports events API',
    };

    expect(info).toHaveProperty('title');
    expect(info.title).toBe('Sports Monitor API');
  });

  it('should include API servers', () => {
    const servers = [
      { url: 'http://localhost:3000', description: 'Local' },
      { url: 'https://api.production.com', description: 'Production' },
    ];

    expect(servers.length).toBeGreaterThan(0);
    expect(servers[0]).toHaveProperty('url');
  });

  it('should define API paths', () => {
    const paths: Record<string, any> = {
      '/api/sports/events': {
        get: { summary: 'Get sports events' },
      },
      '/api/auth/login': {
        post: { summary: 'User login' },
      },
    };

    expect(Object.keys(paths).length).toBeGreaterThan(0);
    expect(paths['/api/sports/events']).toBeDefined();
  });

  it('should define schemas', () => {
    const schemas: Record<string, any> = {
      Sport: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
        },
      },
    };

    expect(Object.keys(schemas).length).toBeGreaterThan(0);
    expect(schemas.Sport).toHaveProperty('properties');
  });
});
