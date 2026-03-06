import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import GlobalDashboard from '../components/GlobalDashboard';

describe('GlobalDashboard', () => {
  it('renders the Global Sports Overview title', () => {
    render(<GlobalDashboard />);
    expect(screen.getByText('🌐 Global Sports Overview')).toBeInTheDocument();
  });

  it('renders the Interactive Map Mode instruction', () => {
    render(<GlobalDashboard />);
    expect(screen.getByText('Interactive Map Mode')).toBeInTheDocument();
    expect(
      screen.getByText(/Click on any highlighted country on the map/i)
    ).toBeInTheDocument();
  });

  it('renders the LiveSportsTVPanel and SportsNewsPanel components inside it', () => {
    render(<GlobalDashboard />);

    // From LiveSportsTVPanel
    expect(screen.getByText('📺 Live Sports TV')).toBeInTheDocument();

    // From SportsNewsPanel
    expect(screen.getByText('📰 Sports News')).toBeInTheDocument();
  });
});
