import { clampLane, laneHeight, laneTop } from '../src/game/lanes';
import { BOARD_FRAME, LANES } from '../src/constants/config';

describe('lane navigation', () => {
  it('climbs and descends one lane at a time', () => {
    expect(clampLane(1, -1)).toBe(0);
    expect(clampLane(1, 1)).toBe(2);
  });

  it('never leaves the airway', () => {
    expect(clampLane(0, -1)).toBe(0);
    expect(clampLane(LANES - 1, 1)).toBe(LANES - 1);
  });

  it('splits the board into three equal lanes', () => {
    const h = laneHeight(320);
    expect(h).toBe(Math.floor((320 - 2 * BOARD_FRAME) / 3));
    expect(laneTop(0, h)).toBe(BOARD_FRAME);
    expect(laneTop(2, h)).toBe(BOARD_FRAME + 2 * h);
  });
});
