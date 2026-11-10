import {
  callSign,
  completeDaily,
  dateKey,
  daysBetween,
  EMPTY_DAILY,
  rollDaily,
  seedFromDateKey,
} from '../src/game/daily';

const base = () => ({ ...EMPTY_DAILY, history: EMPTY_DAILY.history.slice() });

describe('daily mode', () => {
  it('derives a stable seed and call sign from the date', () => {
    const key = dateKey(new Date(2026, 10, 10));
    expect(key).toBe('2026-11-10');
    expect(seedFromDateKey(key)).toBe(seedFromDateKey(key));
    expect(seedFromDateKey('2026-11-11')).not.toBe(seedFromDateKey(key));
    expect(callSign(key)).toMatch(/^AV-\d{4}$/);
  });

  it('allows exactly one attempt per day', () => {
    let record = rollDaily(base(), '2026-11-10');
    expect(record.used).toBe(false);
    record = completeDaily(record, '2026-11-10', 1420);
    expect(record.used).toBe(true);
    expect(record.score).toBe(1420);
    const again = completeDaily(record, '2026-11-10', 9999);
    expect(again.score).toBe(1420);
  });

  it('increments the streak on consecutive days', () => {
    let record = completeDaily(base(), '2026-11-10', 100);
    expect(record.streak).toBe(1);
    record = completeDaily(record, '2026-11-11', 200);
    expect(record.streak).toBe(2);
  });

  it('resets the streak after a gap', () => {
    let record = completeDaily(base(), '2026-11-10', 100);
    record = rollDaily(record, '2026-11-14');
    expect(record.streak).toBe(0);
    expect(record.used).toBe(false);
  });

  it('keeps a 7 day history strip', () => {
    const record = completeDaily(base(), '2026-11-10', 100);
    expect(record.history).toHaveLength(7);
    expect(record.history[6]).toBe(true);
    expect(daysBetween('2026-11-10', '2026-11-12')).toBe(2);
  });
});
