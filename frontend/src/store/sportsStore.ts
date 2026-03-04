import { create } from 'zustand'

interface LiveEvent {
  id: string
  country: string
  country_code: string
  sport: string
  homeTeam: string
  awayTeam: string
  score: string
  status: 'live' | 'upcoming' | 'finished'
  timestamp: number
}

interface SportsStore {
  liveEvents: LiveEvent[]
  selectedCountry: string | null
  setLiveEvents: (events: LiveEvent[]) => void
  setSelectedCountry: (country: string | null) => void
  addEvent: (event: LiveEvent) => void
  updateEvent: (id: string, event: Partial<LiveEvent>) => void
}

export const useSportsStore = create<SportsStore>((set) => ({
  liveEvents: [],
  selectedCountry: null,

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
}))
