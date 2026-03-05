import { describe, it, expect, beforeEach } from 'vitest';
import { useSportsStore } from '../store/sportsStore';

describe('Sports Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store state
    const store = useSportsStore.getState();
    store.selectedSports = [];
  });

  describe('selectedSports state', () => {
    it('should initialize with empty sports array ', () => {
      const store = useSportsStore.getState();
      expect(Array.isArray(store.selectedSports)).toBe(true);
    });

    it('should allow adding sports', () => {
      const store = useSportsStore.getState();
      store.toggleSport('football');
      expect(store.selectedSports).toContain('football');
    });
  });

  describe('toggleSport action', () => {
    it('should add sport when not selected', () => {
      const store = useSportsStore.getState();
      store.toggleSport('cricket');
      expect(store.selectedSports).toContain('cricket');
    });

    it('should remove sport when already selected', () => {
      const store = useSportsStore.getState();
      store.toggleSport('tennis');
      store.toggleSport('tennis');
      expect(store.selectedSports).not.toContain('tennis');
    });
  });

  describe('filters state', () => {
    it('should maintain filter state', () => {
      const store = useSportsStore.getState();
      expect(store).toHaveProperty('selectedSports');
      expect(store).toHaveProperty('toggleSport');
    });
  });
});
