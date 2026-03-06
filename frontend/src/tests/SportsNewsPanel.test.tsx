import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import SportsNewsPanel from '../components/SportsNewsPanel';

describe('SportsNewsPanel', () => {
  it('renders the Sports News title', () => {
    render(<SportsNewsPanel />);
    expect(screen.getByText('📰 Sports News')).toBeInTheDocument();
  });

  it('shows loading skeletons initially', () => {
    const { container } = render(<SportsNewsPanel />);
    // Check for the animate-pulse classes
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays news items after loading', async () => {
    render(<SportsNewsPanel />);

    // It relies on the 800ms real timer in the component

    // Wait for the news items to appear
    await waitFor(() => {
      // One of the mock titles
      expect(
        screen.getByText(
          'Champions League Draw: Quarter-Final matchups revealed'
        )
      ).toBeInTheDocument();
    });

    // Verify other fields rendered
    expect(screen.getByText('Soccer')).toBeInTheDocument();
    expect(screen.getByText('Global Sports')).toBeInTheDocument();
  });

  it('renders the View All Headlines button', () => {
    render(<SportsNewsPanel />);
    expect(screen.getByText('View All Headlines')).toBeInTheDocument();
  });
});
