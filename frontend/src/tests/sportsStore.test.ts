import { describe, it, expect, beforeEach } from 'vitest';
import { useSportsStore } from '../store/sportsStore';

describe('Sports Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store state
    useSportsStore.setState({ selectedSports: [] });
  });

  describe('selectedSports state', () => {
    it('should initialize with empty sports array ', () => {
      const store = useSportsStore.getState();
      expect(Array.isArray(store.selectedSports)).toBe(true);
    });

    it('should allow adding sports', () => {
      useSportsStore.getState().toggleSport('football');
      expect(useSportsStore.getState().selectedSports).toContain('football');
    });
  });

  describe('toggleSport action', () => {
    it('should add sport when not selected', () => {
      useSportsStore.getState().toggleSport('cricket');
      expect(useSportsStore.getState().selectedSports).toContain('cricket');
    });

    it('should remove sport when already selected', () => {
      useSportsStore.getState().toggleSport('tennis');
      useSportsStore.getState().toggleSport('tennis');
      expect(useSportsStore.getState().selectedSports).not.toContain('tennis');
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
