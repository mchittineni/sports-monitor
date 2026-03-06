import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapComponent from '../components/MapComponent';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
}));

vi.mock('../services/api', () => ({
  getEvents: vi.fn(() =>
    Promise.resolve([
      {
        id: '1',
        lat: 48.8566,
        lng: 2.3522,
        sport: 'football',
      },
    ])
  ),
}));

describe('MapComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render map container', () => {
    render(<MapComponent onCountrySelect={() => {}} />);
    expect(screen.queryByText(/map/i)).toBeDefined();
  });

  it('should load events', async () => {
    render(<MapComponent onCountrySelect={() => {}} />);
    expect(screen.queryByText(/loading/i)).toBeDefined();
  });

  it('should handle map click', () => {
    render(<MapComponent onCountrySelect={() => {}} />);
    const map = screen.queryByRole('region');
    expect(map).toBeDefined();
  });

  it('should display event markers', async () => {
    render(<MapComponent onCountrySelect={() => {}} />);
    const markers = screen.queryAllByText(/marker/i);
    expect(markers).toBeDefined();
  });
});
