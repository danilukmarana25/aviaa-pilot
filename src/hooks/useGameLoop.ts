import { useEffect, useRef } from 'react';

/**
 * requestAnimationFrame loop with a clamped dt.
 * Starts when `active` turns true and is cancelled in the effect cleanup —
 * nothing keeps running after the screen is left.
 */
export function useGameLoop(
  active: boolean,
  onFrame: (dtMs: number, elapsedMs: number) => void,
) {
  const cbRef = useRef(onFrame);
  cbRef.current = onFrame;

  useEffect(() => {
    if (!active) {
      return;
    }
    let raf = 0;
    let last = Date.now();
    let elapsed = 0;
    let alive = true;

    const tick = () => {
      if (!alive) {
        return;
      }
      const now = Date.now();
      const dt = Math.min(48, Math.max(0, now - last));
      last = now;
      elapsed += dt;
      try {
        cbRef.current(dt, elapsed);
      } catch (e) {
        // a frame must never take the app down
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [active]);
}

export default useGameLoop;
