import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SportsPanel from '../components/SportsPanel';
import * as api from '../services/api';

vi.mock('../services/api');

describe('SportsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render country heading', async () => {
    render(<SportsPanel country="France" />);

    await waitFor(() => {
      const headings = screen.getAllByText(/France/);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it('should display list of matches', async () => {
    (api.getSportsData as any).mockResolvedValue([
      {
        id: '1',
        sport: 'football',
        homeTeam: 'France',
        awayTeam: 'Germany',
        score: '1 - 0',
        status: 'live',
      },
    ]);

    render(<SportsPanel country="France" />);

    await waitFor(() => {
      expect(screen.getByText('France')).toBeDefined();
      expect(screen.getByText('Germany')).toBeDefined();
    });
  });

  it('should show empty state when no matches', async () => {
    (api.getSportsData as any).mockResolvedValue([]);

    render(<SportsPanel country="France" />);

    await waitFor(() => {
      expect(screen.getByText(/No ongoing events/i)).toBeDefined();
    });
  });
});
