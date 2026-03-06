// set environment early so index.ts doesn't start the server
process.env.NODE_ENV = 'test';

import request from 'supertest';
import { beforeAll } from 'vitest';

let app: any;

// Lazy-load the app so that vi.mock() calls in test files are registered
// before any modules (cacheHandler, sportsService, etc.) are loaded.
beforeAll(async () => {
  const { default: appInstance } = await import('../index');
  app = appInstance;
});

// export a helper for tests to use
export const api = () => request(app);
