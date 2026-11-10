import {
  clearCareer,
  deserialize,
  freshCareer,
  loadCareer,
  sanitize,
  saveCareer,
  serialize,
} from '../src/game/storage';

describe('persistence', () => {
  beforeEach(() => {
    clearCareer();
  });

  it('round-trips a career record', () => {
    const record = freshCareer();
    record.flights = 4;
    record.bestScore = 2480;
    record.stamps = ['c1', 'r2'];
    saveCareer(record);
    const reloaded = loadCareer();
    expect(reloaded.flights).toBe(4);
    expect(reloaded.bestScore).toBe(2480);
    expect(reloaded.stamps).toEqual(['c1', 'r2']);
  });

  it('survives a reopen with the settings intact', () => {
    const record = freshCareer();
    record.settings.difficulty = 'STORM';
    record.settings.controlScheme = 'sides';
    saveCareer(record);
    expect(loadCareer().settings.difficulty).toBe('STORM');
    expect(loadCareer().settings.controlScheme).toBe('sides');
  });

  it('falls back to a fresh career on corrupted data', () => {
    expect(deserialize('not json at all').flights).toBe(0);
    expect(deserialize(null).rankIndex).toBe(0);
  });

  it('repairs a partial record instead of crashing', () => {
    const repaired = sanitize({ flights: -3, stamps: 'nope', tiers: null });
    expect(repaired.flights).toBe(0);
    expect(repaired.stamps).toEqual([]);
    expect(repaired.tiers.gold).toBe(0);
    expect(repaired.daily.history).toHaveLength(7);
  });

  it('serialises without any network or money field', () => {
    const text = serialize(freshCareer());
    expect(text).not.toMatch(/http/i);
    expect(text).not.toMatch(/balance|wager|bet/i);
  });

  it('wipes everything on reset', () => {
    const record = freshCareer();
    record.flights = 9;
    saveCareer(record);
    expect(clearCareer().flights).toBe(0);
    expect(loadCareer().flights).toBe(0);
  });
});
