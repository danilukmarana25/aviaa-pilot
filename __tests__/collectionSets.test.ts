import {
  ownedInRegion,
  regionComplete,
  REGIONS,
  STAMPS,
  stampsOfRegion,
} from '../src/game/stamps';

describe('collection sets', () => {
  it('holds 12 stamps in 3 regions of 4', () => {
    expect(STAMPS).toHaveLength(12);
    expect(REGIONS).toHaveLength(3);
    REGIONS.forEach(region => {
      expect(stampsOfRegion(region.id)).toHaveLength(4);
    });
  });

  it('gives every stamp a unique id, a name and the leg it drops on', () => {
    const ids = STAMPS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    STAMPS.forEach(stamp => {
      expect(stamp.name.length).toBeGreaterThan(2);
      expect(stamp.leg).toMatch(/^LEG \d$/);
    });
  });

  it('counts the owned stamps of a region', () => {
    const owned = ['c1', 'c2', 'r1'];
    expect(ownedInRegion(owned, 'coast')).toBe(2);
    expect(ownedInRegion(owned, 'ridge')).toBe(1);
    expect(ownedInRegion(owned, 'aurora')).toBe(0);
  });

  it('flips a region to complete only on all four', () => {
    expect(regionComplete(['c1', 'c2', 'c3'], 'coast')).toBe(false);
    expect(regionComplete(['c1', 'c2', 'c3', 'c4'], 'coast')).toBe(true);
  });

  it('describes a perk for every region', () => {
    REGIONS.forEach(region => {
      expect(region.perk.length).toBeGreaterThan(10);
      expect(region.perkShort.length).toBeGreaterThan(2);
    });
  });
});
