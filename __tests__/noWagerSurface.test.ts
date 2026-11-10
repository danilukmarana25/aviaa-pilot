import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..', 'src');

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const FILES = walk(ROOT).filter(f => /\.(ts|tsx)$/.test(f));
const SOURCE = FILES.map(f => fs.readFileSync(f, 'utf8')).join('\n');

describe('no wager surface', () => {
  it('reads every source file', () => {
    expect(FILES.length).toBeGreaterThan(20);
  });

  it('has no betting, balance or cash-out wording', () => {
    expect(SOURCE).not.toMatch(/\bcashout\b|\bcash out\b/i);
    expect(SOURCE).not.toMatch(/\bwager\b/i);
    expect(SOURCE).not.toMatch(/\bpayout\b/i);
    expect(SOURCE).not.toMatch(/\bjackpot\b/i);
    expect(SOURCE).not.toMatch(/\bbalance\b/i);
  });

  it('has no ad, billing or purchase module', () => {
    expect(SOURCE).not.toMatch(/admob|billing|in-app purchase|iap\b/i);
  });

  it('makes no network call', () => {
    expect(SOURCE).not.toMatch(/\bfetch\s*\(/);
    expect(SOURCE).not.toMatch(/XMLHttpRequest|WebSocket|axios/);
    expect(SOURCE).not.toMatch(/https?:\/\//);
  });

  it('uses no gesture-handler and no navigation library', () => {
    expect(SOURCE).not.toMatch(/react-native-gesture-handler/);
    expect(SOURCE).not.toMatch(/@react-navigation/);
  });

  it('keeps native-driver animations on transform and opacity only', () => {
    FILES.forEach(file => {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.includes('useNativeDriver: true')) {
        return;
      }
      expect(text).not.toMatch(/toValue[^}]*\n?\s*}\s*,\s*\n?\s*width:/);
    });
    const loader = fs.readFileSync(
      path.join(ROOT, 'screens', 'LoaderScreen.tsx'),
      'utf8',
    );
    expect(loader).toContain('useNativeDriver: false');
  });
});
