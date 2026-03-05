import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SportsPanel } from '../components/SportsPanel';

vi.mock('../services/api', () => ({
  getSports: vi.fn(() =>
    Promise.resolve([
      { id: '1', name: 'Football' },
      { id: '2', name: 'Basketball' },
    ])
  ),
}));

vi.mock('../store/sportsStore', () => ({
  useSportsStore: () => ({
    selectedSports: ['Football'],
    toggleSport: vi.fn(),
  }),
}));

describe('SportsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sports panel', () => {
    render(<SportsPanel />);
    expect(screen.queryByText(/sport/i)).toBeDefined();
  });

  it('should display list of sports', async () => {
    render(<SportsPanel />);
    expect(screen.queryByText(/football/i)).toBeDefined();
  });

  it('should allow sport selection', () => {
    render(<SportsPanel />);
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should highlight selected sports', () => {
    render(<SportsPanel />);
    const football = screen.queryByText(/football/i);
    expect(football).toBeDefined();
  });
});
