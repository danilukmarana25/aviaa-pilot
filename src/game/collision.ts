export type Box = { x: number; y: number; w: number; h: number };

export function overlaps(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function shrink(box: Box, by: number): Box {
  return {
    x: box.x + by,
    y: box.y + by,
    w: Math.max(1, box.w - by * 2),
    h: Math.max(1, box.h - by * 2),
  };
}
