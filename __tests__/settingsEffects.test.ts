import { DIFFICULTY } from '../src/constants/config';
import { DEFAULT_SETTINGS, sanitize } from '../src/game/storage';

describe('settings effects', () => {
  it('ships three difficulty profiles that really differ', () => {
    expect(DIFFICULTY.CRUISE.speed).toBeLessThan(DIFFICULTY.STANDARD.speed);
    expect(DIFFICULTY.STORM.speed).toBeGreaterThan(DIFFICULTY.STANDARD.speed);
    expect(DIFFICULTY.CRUISE.turb).toBeGreaterThan(DIFFICULTY.STORM.turb);
    expect(DIFFICULTY.STORM.ring).toBeGreaterThan(DIFFICULTY.CRUISE.ring);
    expect(DIFFICULTY.STORM.cycle).toBeLessThan(DIFFICULTY.CRUISE.cycle);
  });

  it('defaults to the button bar on standard difficulty with guides on', () => {
    expect(DEFAULT_SETTINGS.controlScheme).toBe('buttons');
    expect(DEFAULT_SETTINGS.difficulty).toBe('STANDARD');
    expect(DEFAULT_SETTINGS.laneGuides).toBe(true);
    expect(DEFAULT_SETTINGS.reducedMotion).toBe(false);
  });

  it('persists every option through the store', () => {
    const stored = sanitize({
      settings: {
        controlScheme: 'sides',
        difficulty: 'CRUISE',
        laneGuides: false,
        reducedMotion: true,
      },
    });
    expect(stored.settings.controlScheme).toBe('sides');
    expect(stored.settings.difficulty).toBe('CRUISE');
    expect(stored.settings.laneGuides).toBe(false);
    expect(stored.settings.reducedMotion).toBe(true);
  });

  it('repairs an unknown option instead of crashing', () => {
    const stored = sanitize({ settings: { difficulty: 'NONSENSE', controlScheme: 7 } });
    expect(stored.settings.difficulty).toBe('STANDARD');
    expect(stored.settings.controlScheme).toBe('buttons');
  });

  it('has no audio option, because the app has no audio', () => {
    expect(Object.keys(DEFAULT_SETTINGS)).not.toContain('volume');
    expect(Object.keys(DEFAULT_SETTINGS)).not.toContain('music');
    expect(Object.keys(DEFAULT_SETTINGS)).not.toContain('sound');
  });
});
