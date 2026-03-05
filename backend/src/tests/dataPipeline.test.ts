import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startDataPipeline } from '../services/dataPipeline';

describe('Data Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should execute tick on interval', () => {
    startDataPipeline();

    expect(console.log).toHaveBeenCalledWith('Starting data pipeline...');

    vi.advanceTimersByTime(31 * 1000); // 31 seconds

    expect(console.log).toHaveBeenCalledWith(
      '✅ Data pipeline tick -',
      expect.any(String)
    );
  });
});
