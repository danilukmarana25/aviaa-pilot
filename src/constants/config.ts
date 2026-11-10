import { Dimensions } from 'react-native';

const win = Dimensions.get('window');

export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

/** Splash hold. EXACTLY 8000 ms — driven by one timer, never by a tap. */
export const LOADER_DURATION_MS = 8000;

/** Route shape */
export const LEGS_FREE = 3;
export const LEGS_CHALLENGE = 5;
export const LANES = 3;
export const LEG_DURATION_MS = 10000;

/** Airway scrolling */
export const BASE_SPEED = 160;
export const SPEED_STEP = 8;
export const SPEED_CAP = 320;

/** Spawn pacing (ms between entities, converted to x-gaps by the generator) */
export const STAMP_INTERVAL_MS: [number, number] = [800, 1400];
export const TURB_INTERVAL_MS: [number, number] = [1600, 2600];

/** Wing integrity */
export const WINGS = 3;
export const INVULN_MS = 900;

/** Slipstream */
export const SLIP_TIER = 5;
export const SLIP_MULT_CAP = 3;

/** Landing */
export const ZONE_BASE_W = 72;
export const ZONE_BONUS_PER_TIER = 14;
export const ZONE_BONUS_CAP = 42;
export const GOLD_PX = 8;
export const SILVER_PX = 22;
export const BRONZE_PX = 40;
export const LAND_TIMEOUT_MS = 6000;
export const APPROACH_MS = 450;
export const RESOLVE_HOLD_MS = 900;
export const RING_CYCLE_MS = 1600;

/** Progression */
export const XP_PER_POINT = 0.1;
export const RANK_STEP_XP = 600;
export const ROUTE_LEG_BONUS = 50;
export const NO_MISS_BONUS = 200;

/** Geometry of the airway board (never derived from a padded parent) */
export const AIRWAY_W = Math.min(SCREEN_W - 32, 380);
export const PAD = 8;
export const BORDER = 2;
export const BOARD_FRAME = PAD + BORDER; // 10
export const RUNWAY_W = AIRWAY_W - 2 * BOARD_FRAME;

/** Actors */
export const PLANE_W = 72;
export const PLANE_H = 46;
export const PLANE_X = BOARD_FRAME + 18;
export const STAMP_SIZE = 34;
export const TURB_W = 54;
export const RING_SIZE = 86;
export const HIT_SHRINK = 6;

/** The floating instrument bar reserves this strip — no actor spawns under it. */
export const NO_SPAWN_STRIP = 120;
export const BAR_H = 72;
export const BAR_BOTTOM = 24;

/** Hints */
export const HINT_VISIBLE_MS = 4500;
export const HINT_IDLE_MS = 6000;

/** Difficulty multipliers (SettingsScreen row 2) */
export const DIFFICULTY = {
  CRUISE: { speed: 0.85, turb: 1.3, ring: 0.85, cycle: 1880 },
  STANDARD: { speed: 1, turb: 1, ring: 1, cycle: 1600 },
  STORM: { speed: 1.2, turb: 0.75, ring: 1.25, cycle: 1280 },
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY;
export type ControlScheme = 'buttons' | 'sides';

export const STORAGE_KEY = 'aviaapilot.v1';
