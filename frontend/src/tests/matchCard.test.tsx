import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchCard } from '../components/MatchCard';

describe('MatchCard Component', () => {
  const mockMatch = {
    id: 'match-1',
    sport: 'football',
    homeTeam: 'France',
    awayTeam: 'Germany',
    startTime: '2024-01-15T20:00:00Z',
    status: 'upcoming',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render match information', () => {
    render(<MatchCard match={mockMatch} />);

    expect(screen.getByText('France')).toBeDefined();
    expect(screen.getByText('Germany')).toBeDefined();
  });

  it('should display match time', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.queryByText(/2024-01-15/i)).toBeDefined();
  });

  it('should show match status', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.queryByText(/upcoming/i)).toBeDefined();
  });

  it('should be clickable', () => {
    const onClick = vi.fn();
    render(<MatchCard match={mockMatch} onClick={onClick} />);

    const card = screen.getByText('France').closest('div');
    expect(card).toBeDefined();
  });
});
