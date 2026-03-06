import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../components/MapComponent', () => ({
  default: ({ onCountrySelect }: { onCountrySelect: (c: string) => void }) => (
    <div data-testid="map-component" onClick={() => onCountrySelect('USA')}>
      Map
    </div>
  ),
}));

vi.mock('../components/GlobalDashboard', () => ({
  default: () => <div data-testid="global-dashboard">GlobalDashboard</div>,
}));

vi.mock('../components/SportsPanel', () => ({
  default: ({ country }: { country: string }) => (
    <div data-testid="sports-panel">SportsPanel:{country}</div>
  ),
}));

vi.mock('../components/ChatAssistant', () => ({
  default: () => <div data-testid="chat-assistant">ChatAssistant</div>,
}));

const mockConnect = vi.fn().mockReturnValue(() => {});
vi.mock('../services/websocket', () => ({
  useWebSocket: () => ({ connect: mockConnect }),
}));

const mockSetLiveEvents = vi.fn();
vi.mock('../store/sportsStore', () => ({
  useSportsStore: () => ({ setLiveEvents: mockSetLiveEvents, liveEvents: [] }),
}));

vi.mock('../services/api', () => ({
  getLiveEvents: vi.fn().mockResolvedValue([]),
}));

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockReturnValue(() => {});
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('map-component')).toBeDefined();
  });

  it('shows GlobalDashboard by default when no country is selected', () => {
    render(<App />);
    expect(screen.getByTestId('global-dashboard')).toBeDefined();
    expect(screen.queryByTestId('sports-panel')).toBeNull();
  });

  it('shows SportsPanel after a country is selected on the map', async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('map-component'));

    await waitFor(() => {
      expect(screen.getByTestId('sports-panel')).toBeDefined();
      expect(screen.getByText('SportsPanel:USA')).toBeDefined();
    });
  });

  it('hides GlobalDashboard after a country is selected', async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('map-component'));

    await waitFor(() => {
      expect(screen.queryByTestId('global-dashboard')).toBeNull();
    });
  });

  it('toggles ChatAssistant when the button is clicked', async () => {
    render(<App />);

    expect(screen.queryByTestId('chat-assistant')).toBeNull();

    fireEvent.click(screen.getByText('Show AI Assistant'));

    await waitFor(() => {
      expect(screen.getByTestId('chat-assistant')).toBeDefined();
    });
  });

  it('hides ChatAssistant when toggled off', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Show AI Assistant'));
    await waitFor(() => {
      expect(screen.getByTestId('chat-assistant')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Hide AI Assistant'));
    await waitFor(() => {
      expect(screen.queryByTestId('chat-assistant')).toBeNull();
    });
  });

  it('calls getLiveEvents on mount to load initial data', async () => {
    const { getLiveEvents } = await import('../services/api');
    render(<App />);
    await waitFor(() => {
      expect(getLiveEvents).toHaveBeenCalled();
    });
  });
});
