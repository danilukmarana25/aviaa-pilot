import { useCallback } from 'react';
import { DIFFICULTY, type ControlScheme, type DifficultyKey } from '../constants/config';
import type { SettingsRecord } from '../game/storage';
import { careerStore, useCareerSelector } from './usePersistentState';

export function useSettings(): SettingsRecord {
  return useCareerSelector(r => r.settings);
}

export function useDifficultyFactors() {
  const key = useCareerSelector(r => r.settings.difficulty);
  return DIFFICULTY[key];
}

export function useReducedMotion(): boolean {
  return useCareerSelector(r => r.settings.reducedMotion);
}

export function useSettingsActions() {
  const setControlScheme = useCallback((controlScheme: ControlScheme) => {
    careerStore.update(prev => ({
      ...prev,
      settings: { ...prev.settings, controlScheme },
    }));
  }, []);

  const setDifficulty = useCallback((difficulty: DifficultyKey) => {
    careerStore.update(prev => ({
      ...prev,
      settings: { ...prev.settings, difficulty },
    }));
  }, []);

  const setLaneGuides = useCallback((laneGuides: boolean) => {
    careerStore.update(prev => ({
      ...prev,
      settings: { ...prev.settings, laneGuides },
    }));
  }, []);

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    careerStore.update(prev => ({
      ...prev,
      settings: { ...prev.settings, reducedMotion },
    }));
  }, []);

  return { setControlScheme, setDifficulty, setLaneGuides, setReducedMotion };
}

export default useSettings;
