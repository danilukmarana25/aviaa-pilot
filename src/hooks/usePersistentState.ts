import { useCallback, useEffect, useState } from 'react';
import {
  clearCareer,
  loadCareer,
  saveCareer,
  type CareerRecord,
} from '../game/storage';

type Listener = (record: CareerRecord) => void;

let current: CareerRecord = loadCareer();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach(l => {
    try {
      l(current);
    } catch (e) {
      // a stale subscriber must not break the write
    }
  });
}

export const careerStore = {
  get(): CareerRecord {
    return current;
  },
  set(next: CareerRecord) {
    current = next;
    saveCareer(current);
    emit();
  },
  update(fn: (prev: CareerRecord) => CareerRecord) {
    careerStore.set(fn(current));
  },
  reset(): CareerRecord {
    current = clearCareer();
    emit();
    return current;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/**
 * Selector hook — a screen subscribes to the slice it draws, not to the whole career.
 */
export function useCareerSelector<T>(
  selector: (record: CareerRecord) => T,
): T {
  const [value, setValue] = useState<T>(() => selector(careerStore.get()));

  useEffect(() => {
    const unsubscribe = careerStore.subscribe(record => {
      const next = selector(record);
      setValue(prev => (Object.is(prev, next) ? prev : next));
    });
    setValue(selector(careerStore.get()));
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

export function useCareer(): CareerRecord {
  return useCareerSelector(r => r);
}

export function useCareerActions() {
  const update = useCallback(
    (fn: (prev: CareerRecord) => CareerRecord) => careerStore.update(fn),
    [],
  );
  const reset = useCallback(() => careerStore.reset(), []);
  return { update, reset };
}

export default useCareerSelector;
