import { describe, it, expect } from 'vitest';
import { env } from '../config/env';

describe('env config', () => {
  it('should export all required keys', () => {
    const requiredKeys = [
      'NODE_ENV',
      'PORT',
      'CLIENT_URL',
      'JWT_SECRET',
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'AWS_REGION',
      'EVENTS_TABLE',
      'REDIS_URL',
    ];
    for (const key of requiredKeys) {
      expect(env).toHaveProperty(key);
    }
  });

  it('should parse PORT as a number', () => {
    expect(typeof env.PORT).toBe('number');
  });

  it('should parse DB_PORT as a number', () => {
    expect(typeof env.DB_PORT).toBe('number');
  });

  it('should default AWS_REGION to us-east-1', () => {
    expect(env.AWS_REGION).toBe('us-east-1');
  });

  it('should default DB_NAME to sports_monitor', () => {
    expect(env.DB_NAME).toBe('sports_monitor');
  });

  it('should default REDIS_URL to localhost', () => {
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('should default EVENTS_TABLE to SportsEvents', () => {
    expect(env.EVENTS_TABLE).toBe('SportsEvents');
  });

  it('should use a non-empty JWT_SECRET in non-production', () => {
    expect(typeof env.JWT_SECRET).toBe('string');
    expect(env.JWT_SECRET.length).toBeGreaterThan(0);
  });
});
