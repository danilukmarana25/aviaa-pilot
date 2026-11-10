/** 12 route stamps in 3 regions of 4. A completed region unlocks a flight perk. */
export type RegionId = 'coast' | 'ridge' | 'aurora';

export type Stamp = {
  id: string;
  name: string;
  region: RegionId;
  leg: string;
};

export type Region = {
  id: RegionId;
  name: string;
  perk: string;
  perkShort: string;
};

export const REGIONS: Region[] = [
  {
    id: 'coast',
    name: 'COASTAL REGION',
    perk: 'EVERY LEG STARTS AT SLIPSTREAM 5',
    perkShort: 'WARM START',
  },
  {
    id: 'ridge',
    name: 'RIDGE REGION',
    perk: 'LANDING SAFE ZONE +6 PX',
    perkShort: 'WIDE STRIP',
  },
  {
    id: 'aurora',
    name: 'AURORA REGION',
    perk: 'FIRST TURBULENCE HIT OF A SESSION IS FORGIVEN',
    perkShort: 'STORM SHIELD',
  },
];

export const STAMPS: Stamp[] = [
  { id: 'c1', name: 'SALT PIER', region: 'coast', leg: 'LEG 1' },
  { id: 'c2', name: 'LOW TIDE', region: 'coast', leg: 'LEG 2' },
  { id: 'c3', name: 'GULL LINE', region: 'coast', leg: 'LEG 3' },
  { id: 'c4', name: 'HARBOUR LAMP', region: 'coast', leg: 'LEG 4' },
  { id: 'r1', name: 'STONE PASS', region: 'ridge', leg: 'LEG 1' },
  { id: 'r2', name: 'PINE SADDLE', region: 'ridge', leg: 'LEG 2' },
  { id: 'r3', name: 'COLD SPUR', region: 'ridge', leg: 'LEG 3' },
  { id: 'r4', name: 'SUMMIT MARK', region: 'ridge', leg: 'LEG 4' },
  { id: 'a1', name: 'NIGHT MAIL', region: 'aurora', leg: 'LEG 1' },
  { id: 'a2', name: 'POLAR ARC', region: 'aurora', leg: 'LEG 2' },
  { id: 'a3', name: 'GREEN VEIL', region: 'aurora', leg: 'LEG 3' },
  { id: 'a4', name: 'LAST LIGHT', region: 'aurora', leg: 'LEG 4' },
];

export function stampsOfRegion(region: RegionId): Stamp[] {
  return STAMPS.filter(s => s.region === region);
}

export function ownedInRegion(owned: string[], region: RegionId): number {
  const ids = stampsOfRegion(region).map(s => s.id);
  return owned.filter(id => ids.includes(id)).length;
}

export function regionComplete(owned: string[], region: RegionId): boolean {
  return ownedInRegion(owned, region) >= 4;
}

export type Perks = {
  warmStart: boolean; // coast
  wideStrip: boolean; // ridge
  stormShield: boolean; // aurora
};

export const NO_PERKS: Perks = {
  warmStart: false,
  wideStrip: false,
  stormShield: false,
};

export function perksFromStamps(owned: string[]): Perks {
  return {
    warmStart: regionComplete(owned, 'coast'),
    wideStrip: regionComplete(owned, 'ridge'),
    stormShield: regionComplete(owned, 'aurora'),
  };
}

/** The stamp a given region/leg combination drops. */
export function stampForLeg(region: RegionId, legIndex: number): Stamp {
  const list = stampsOfRegion(region);
  return list[legIndex % list.length];
}
