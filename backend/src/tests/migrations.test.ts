import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTables } from '../database/migrations';

describe('Database Migrations', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should execute table creation queries successfully', async () => {
    const mockQuery = vi.fn().mockResolvedValue(true);
    
    await expect(createTables(mockQuery)).resolves.not.toThrow();
    
    // Specifically creates users, favorite_sports, watched_matches
    expect(mockQuery).toHaveBeenCalledTimes(3);
  });

  it('should log and throw when a query fails', async () => {
    const mockQuery = vi.fn().mockRejectedValue(new Error('Syntax Error'));
    
    await expect(createTables(mockQuery)).rejects.toThrow('Syntax Error');
    expect(console.error).toHaveBeenCalled();
  });
});
