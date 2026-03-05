import { create } from 'zustand';

/**
 * Data structure representing a single sports match or event.
 */
interface LiveEvent {
  id: string;
  country: string;
  country_code: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: 'live' | 'upcoming' | 'finished';
  timestamp: number;
}

/**
 * Zustand state tree for managing global sports data.
 */
interface SportsStore {
  liveEvents: LiveEvent[];
  selectedCountry: string | null;
  selectedSports: string[];
  setLiveEvents: (events: LiveEvent[]) => void;
  setSelectedCountry: (country: string | null) => void;
  addEvent: (event: LiveEvent) => void;
  updateEvent: (id: string, event: Partial<LiveEvent>) => void;
  toggleSport: (sport: string) => void;
}

/**
 * Provides a global state store for the React application to reactively manage
 * live events, selected countries, and sport filters.
 */
export const useSportsStore = create<SportsStore>((set) => ({
  liveEvents: [],
  selectedCountry: null,
  selectedSports: [],

  setLiveEvents: (events) => set({ liveEvents: events }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),

  addEvent: (event) =>
    set((state) => ({
      liveEvents: [...state.liveEvents, event],
    })),

  updateEvent: (id, event) =>
    set((state) => ({
      liveEvents: state.liveEvents.map((e) =>
        e.id === id ? { ...e, ...event } : e
      ),
    })),

  toggleSport: (sport) =>
    set((state) => {
      const exists = state.selectedSports.includes(sport);
      return {
        selectedSports: exists
          ? state.selectedSports.filter((s) => s !== sport)
          : [...state.selectedSports, sport],
      };
    }),
}));
