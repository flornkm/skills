export type LinearScale = {
  (value: number): number;
  invert: (pixel: number) => number;
};

export function scaleLinear(
  [d0, d1]: readonly [number, number],
  [r0, r1]: readonly [number, number],
): LinearScale {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const scale = ((value: number) => r0 + (value - d0) * k) as LinearScale;
  scale.invert = (pixel) => (k === 0 ? d0 : d0 + (pixel - r0) / k);
  return scale;
}

// The smallest round step (1, 2, 5 × 10ⁿ) at least as big as `raw`, so an axis never gets more
// gridlines than asked for. No 2.5: most chart data is counted, not measured.
export function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw * (1 - 1e-9)) ?? 10 * power;
}

// Gridline values from zero to just above `max`, with a little headroom so the tallest mark
// never touches the top. Ticks are multiplied, never added up, so float error can't reach a label.
export function axisTicks(max: number, count = 4, headroom = 1.08) {
  const top = Math.max(max, Number.EPSILON) * headroom;
  const step = niceStep(max / count);
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) =>
    Number((i * step).toFixed(6)),
  );
  return { top, ticks };
}

// How many gridlines a plot of this height can hold without the labels touching. Short charts
// on phones get two or three, tall ones up to six.
export function tickCountFor(plotHeight: number, minGap = 32) {
  return Math.max(2, Math.min(6, Math.floor(plotHeight / minGap)));
}
