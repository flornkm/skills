export type Point = readonly [x: number, y: number];

const round = (n: number) => Math.round(n * 100) / 100;

export const linePath = (points: readonly Point[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)},${round(y)}`).join("");

export function areaPath(points: readonly Point[], baseline: number) {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)}L${round(last[0])},${round(baseline)}L${round(first[0])},${round(baseline)}Z`;
}

// Splits a series at missing values, so each run is drawn on its own and a gap stays a gap
// instead of a line diving to zero or bridging across.
export function runs<T>(items: readonly T[], isPresent: (item: T) => boolean): T[][] {
  const out: T[][] = [];
  let current: T[] = [];
  for (const item of items) {
    if (isPresent(item)) current.push(item);
    else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

// A bar or stacked segment with its own radius for the top and bottom corners, clamped so a
// thin segment still closes into a shape. Round only the outer corners of a stack.
export function barPath(x: number, y: number, width: number, height: number, top = 0, bottom = 0) {
  if (width <= 0 || height <= 0) return "";
  const t = Math.min(top, width / 2, height / 2);
  const b = Math.min(bottom, width / 2, height / 2);
  const r = (n: number) => round(n);
  return [
    `M${r(x)},${r(y + t)}`,
    t ? `Q${r(x)},${r(y)} ${r(x + t)},${r(y)}` : "",
    `L${r(x + width - t)},${r(y)}`,
    t ? `Q${r(x + width)},${r(y)} ${r(x + width)},${r(y + t)}` : "",
    `L${r(x + width)},${r(y + height - b)}`,
    b ? `Q${r(x + width)},${r(y + height)} ${r(x + width - b)},${r(y + height)}` : "",
    `L${r(x + b)},${r(y + height)}`,
    b ? `Q${r(x)},${r(y + height)} ${r(x)},${r(y + height - b)}` : "",
    "Z",
  ].join("");
}

// A smooth line through every point that never overshoots: between two points it stays within
// their values, so a cumulative count never appears to dip. Same idea as d3's curveMonotoneX.
export function monotonePath(points: readonly Point[]) {
  const n = points.length;
  if (n < 3) return linePath(points);

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0];
    slope[i] = (points[i + 1][1] - points[i][1]) / dx[i];
  }

  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1];
    const b = slope[i];
    tangent[i] =
      a * b <= 0
        ? 0
        : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / a + (dx[i] + 2 * dx[i - 1]) / b);
  }
  tangent[n - 1] = slope[n - 2];

  let d = `M${round(points[0][0])},${round(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const third = dx[i] / 3;
    d += `C${round(x0 + third)},${round(y0 + tangent[i] * third)},${round(x1 - third)},${round(y1 - tangent[i + 1] * third)},${round(x1)},${round(y1)}`;
  }
  return d;
}
