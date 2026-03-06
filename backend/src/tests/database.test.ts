import { describe, it, expect, vi } from 'vitest';
import * as db from '../database/connection';

describe('Database Connection', () => {
  it('should execute a query', async () => {
    const mockResult = { rows: [{ id: 1 }], rowCount: 1 };

    // Spying on the exported query function to bypass pg entirely
    vi.spyOn(db.default.pool, 'query').mockResolvedValue(mockResult as any);

    const result = await db.query('SELECT * FROM users');

    expect(db.default.pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users',
      undefined
    );
    expect(result).toEqual(mockResult.rows);
  });
});
