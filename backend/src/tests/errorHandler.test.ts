import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../api/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  it('should format errors correctly in development', () => {
    const err = new Error('Test error');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    // mock process.env
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: 'Test error',
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should hide error stacks in production', () => {
    const err = new Error('Secret error');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    } as any;
    const next = vi.fn();

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });

    process.env.NODE_ENV = originalEnv;
  });
});
