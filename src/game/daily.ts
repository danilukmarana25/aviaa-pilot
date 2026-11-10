/** One date-seeded route per day, one attempt, a 7 day streak strip. */
export type DailyRecord = {
  date: string;
  score: number;
  used: boolean;
  streak: number;
  /** last 7 days, newest last */
  history: boolean[];
};

export const EMPTY_DAILY: DailyRecord = {
  date: '',
  score: 0,
  used: false,
  streak: 0,
  history: [false, false, false, false, false, false, false],
};

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function seedFromDateKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** AV-2611 style call sign derived from the day seed. */
export function callSign(key: string): string {
  const seed = seedFromDateKey(key);
  return `AV-${String(seed % 10000).padStart(4, '0')}`;
}

export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00`);
  const db = Date.parse(`${b}T00:00:00`);
  if (isNaN(da) || isNaN(db)) {
    return 99;
  }
  return Math.round((db - da) / 86400000);
}

/** Rolls the record over to `today` without touching the stored score of a past day. */
export function rollDaily(record: DailyRecord, today: string): DailyRecord {
  if (record.date === today) {
    return record;
  }
  const gap = record.date ? daysBetween(record.date, today) : 99;
  const history = record.history.slice();
  const shift = Math.min(7, Math.max(1, gap));
  for (let i = 0; i < shift; i++) {
    history.shift();
    history.push(false);
  }
  return {
    date: today,
    score: 0,
    used: false,
    streak: gap === 1 && record.used ? record.streak : 0,
    history,
  };
}

export function completeDaily(
  record: DailyRecord,
  today: string,
  score: number,
): DailyRecord {
  const rolled = rollDaily(record, today);
  if (rolled.used) {
    return rolled;
  }
  const history = rolled.history.slice();
  history[history.length - 1] = true;
  return {
    ...rolled,
    used: true,
    score: Math.max(rolled.score, score),
    streak: rolled.streak + 1,
    history,
  };
}

export function hoursUntilTomorrow(now: Date): number {
  return Math.max(1, 24 - now.getHours());
}
