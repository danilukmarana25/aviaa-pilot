import { STORAGE_KEY, type ControlScheme, type DifficultyKey } from '../constants/config';
import { EMPTY_DAILY, type DailyRecord } from './daily';
import { RANKS } from './scoring';

export type SettingsRecord = {
  controlScheme: ControlScheme;
  difficulty: DifficultyKey;
  laneGuides: boolean;
  reducedMotion: boolean;
};

export type TierCounts = {
  gold: number;
  silver: number;
  bronze: number;
  miss: number;
};

export type CareerRecord = {
  version: 1;
  flights: number;
  bestScore: number;
  xp: number;
  rankIndex: number;
  stamps: string[];
  tiers: TierCounts;
  routeBests: Record<string, number>;
  daily: DailyRecord;
  settings: SettingsRecord;
};

export const DEFAULT_SETTINGS: SettingsRecord = {
  controlScheme: 'buttons',
  difficulty: 'STANDARD',
  laneGuides: true,
  reducedMotion: false,
};

export function freshCareer(): CareerRecord {
  return {
    version: 1,
    flights: 0,
    bestScore: 0,
    xp: 0,
    rankIndex: 0,
    stamps: [],
    tiers: { gold: 0, silver: 0, bronze: 0, miss: 0 },
    routeBests: {},
    daily: { ...EMPTY_DAILY, history: EMPTY_DAILY.history.slice() },
    settings: { ...DEFAULT_SETTINGS },
  };
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

/** A corrupted or partial store never crashes the app — it degrades to a fresh career. */
export function sanitize(raw: unknown): CareerRecord {
  const base = freshCareer();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const r = raw as Record<string, any>;
  const tiers = (r.tiers || {}) as Record<string, unknown>;
  const settings = (r.settings || {}) as Record<string, unknown>;
  const daily = (r.daily || {}) as Record<string, unknown>;
  const history = Array.isArray(daily.history)
    ? daily.history.slice(0, 7).map((x: unknown) => x === true)
    : base.daily.history.slice();
  while (history.length < 7) {
    history.unshift(false);
  }
  const routeBests: Record<string, number> = {};
  if (r.routeBests && typeof r.routeBests === 'object') {
    for (const key of Object.keys(r.routeBests)) {
      routeBests[key] = num(r.routeBests[key], 0);
    }
  }
  return {
    version: 1,
    flights: num(r.flights, 0),
    bestScore: num(r.bestScore, 0),
    xp: num(r.xp, 0),
    rankIndex: Math.min(RANKS.length - 1, num(r.rankIndex, 0)),
    stamps: Array.isArray(r.stamps)
      ? r.stamps.filter((s: unknown) => typeof s === 'string')
      : [],
    tiers: {
      gold: num(tiers.gold, 0),
      silver: num(tiers.silver, 0),
      bronze: num(tiers.bronze, 0),
      miss: num(tiers.miss, 0),
    },
    routeBests,
    daily: {
      date: typeof daily.date === 'string' ? daily.date : '',
      score: num(daily.score, 0),
      used: bool(daily.used, false),
      streak: num(daily.streak, 0),
      history,
    },
    settings: {
      controlScheme: settings.controlScheme === 'sides' ? 'sides' : 'buttons',
      difficulty:
        settings.difficulty === 'CRUISE' || settings.difficulty === 'STORM'
          ? (settings.difficulty as DifficultyKey)
          : 'STANDARD',
      laneGuides: bool(settings.laneGuides, true),
      reducedMotion: bool(settings.reducedMotion, false),
    },
  };
}

export function serialize(record: CareerRecord): string {
  return JSON.stringify(record);
}

export function deserialize(text: string | null | undefined): CareerRecord {
  if (!text) {
    return freshCareer();
  }
  try {
    return sanitize(JSON.parse(text));
  } catch (e) {
    return freshCareer();
  }
}

/**
 * Local-only backend. No network, ever.
 * The default implementation keeps the record in module scope; a host can swap in
 * any synchronous key/value store through `setStorageBackend`.
 */
export type StorageBackend = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createMemoryBackend(): StorageBackend {
  const map: Record<string, string> = {};
  return {
    getItem: key => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = value;
    },
    removeItem: key => {
      delete map[key];
    },
  };
}

let backend: StorageBackend = createMemoryBackend();

export function setStorageBackend(next: StorageBackend): void {
  backend = next;
}

export function loadCareer(): CareerRecord {
  try {
    return deserialize(backend.getItem(STORAGE_KEY));
  } catch (e) {
    return freshCareer();
  }
}

export function saveCareer(record: CareerRecord): void {
  try {
    backend.setItem(STORAGE_KEY, serialize(record));
  } catch (e) {
    // storage is a convenience, never a crash path
  }
}

export function clearCareer(): CareerRecord {
  try {
    backend.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  const fresh = freshCareer();
  saveCareer(fresh);
  return fresh;
}
