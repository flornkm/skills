import { textWidth, type Font, AXIS_FONT } from "./text";

export type Anchor = "start" | "middle" | "end";
export type Span = { start: number; end: number };
export type AxisLabel<T> = { value: T; x: number; label: string; width: number; anchor: Anchor };

// Where a label's box starts and ends for a given anchor.
export function spanOf(label: { x: number; width: number; anchor: Anchor }): Span {
  const start =
    label.anchor === "start"
      ? label.x
      : label.anchor === "end"
        ? label.x - label.width
        : label.x - label.width / 2;
  return { start, end: start + label.width };
}

// Edge labels hug the plot instead of hanging off it: a label that would cross an edge is
// anchored to that edge instead of centred on its tick.
export function anchorInside(x: number, width: number, left: number, right: number): Anchor {
  if (x - width / 2 < left) return "start";
  if (x + width / 2 > right) return "end";
  return "middle";
}

const collides = (a: Span, b: Span, gap: number) => a.start < b.end + gap && b.start < a.end + gap;

export type FitOptions<T> = {
  values: readonly T[];
  x: (value: T) => number;
  format: (value: T) => string;
  left: number;
  right: number;
  gap?: number;
  font?: Font;
  reserved?: readonly Span[];
  // Even when everything fits, a busy axis reads worse than a calm one: five dates beat thirty.
  maxLabels?: number;
};

function layoutLabels<T>({
  values,
  x,
  format,
  left,
  right,
  gap = 12,
  font = AXIS_FONT,
  reserved = [],
  maxLabels = 8,
}: FitOptions<T>) {
  const all = values.map((value) => {
    const label = format(value);
    const width = textWidth(label, font);
    const px = x(value);
    return { value, x: px, label, width, anchor: anchorInside(px, width, left, right) };
  });
  const free = all.filter((l) => !reserved.some((r) => collides(spanOf(l), r, gap)));
  const last = free[free.length - 1];
  for (let stride = Math.max(1, Math.ceil(free.length / maxLabels)); stride <= free.length; stride++) {
    const picked = free.filter((_, i) => i % stride === 0);
    const fits = picked.every((l, i) => i === 0 || !collides(spanOf(picked[i - 1]), spanOf(l), gap));
    if (!fits) continue;
    // Thinning can drop the final value; it comes back only if it still keeps the gap.
    const end = picked[picked.length - 1];
    if (end !== last && !collides(spanOf(end), spanOf(last), gap)) picked.push(last);
    return { labels: picked, stride };
  }
  return { labels: free.slice(0, 1), stride: Number.POSITIVE_INFINITY };
}

// Keeps every nth label, smallest n first, until no two labels (and no label and a reserved
// span, such as a "Today" marker) are closer than `gap`. Labels are measured, not guessed, so this
// holds at any width, in any language, with any format.
export function fitLabels<T>(options: FitOptions<T>): AxisLabel<T>[] {
  return layoutLabels(options).labels;
}

// Tries every format ("Nov 4" and "4", "$1,200" and "$1.2K") and keeps the one that needs the
// least thinning; on a tie the earlier, longer one wins. Shorten before you thin: a compact label
// on every tick beats a long one on every other. Formats that leave fewer than `minLabels` only
// win when nothing else does.
export function fitAxis<T>({
  formats,
  minLabels = 2,
  ...options
}: Omit<FitOptions<T>, "format"> & {
  formats: readonly ((value: T) => string)[];
  minLabels?: number;
}): AxisLabel<T>[] {
  let best: { labels: AxisLabel<T>[]; stride: number } | null = null;
  for (const format of formats) {
    const result = layoutLabels({ ...options, format });
    const enough = result.labels.length >= minLabels;
    const bestEnough = best !== null && best.labels.length >= minLabels;
    if (best === null || (enough && !bestEnough) || (enough === bestEnough && result.stride < best.stride)) {
      best = result;
    }
  }
  return best?.labels ?? [];
}
