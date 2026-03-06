import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMonitoringDashboard } from '../services/dashboardService';

vi.mock('@aws-sdk/client-cloudwatch', () => ({
  CloudWatchClient: vi.fn(() => ({
    send: vi.fn(async () => ({ ResponseMetadata: { RequestId: 'test' } })),
  })),
  PutDashboardCommand: vi.fn((params) => ({ params })),
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMonitoringDashboard', () => {
    it('should create a monitoring dashboard', async () => {
      const result = await createMonitoringDashboard('dev');
      expect(result).toBeDefined();
    });

    it('should use default environment', async () => {
      const result = await createMonitoringDashboard();
      expect(result).toBeDefined();
    });

    it('should handle admin environment', async () => {
      const result = await createMonitoringDashboard('admin');
      expect(result).toBeDefined();
    });
  });
});
