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

// Picks every nth label, smallest n first, until no two labels (and no label and a reserved
// span, such as a "Today" marker) are closer than `gap`. Labels are measured, not guessed, so this
// holds at any width, in any language, with any format.
export function fitLabels<T>({
  values,
  x,
  format,
  left,
  right,
  gap = 12,
  font = AXIS_FONT,
  reserved = [],
}: {
  values: readonly T[];
  x: (value: T) => number;
  format: (value: T) => string;
  left: number;
  right: number;
  gap?: number;
  font?: Font;
  reserved?: readonly Span[];
}): AxisLabel<T>[] {
  const all = values.map((value) => {
    const label = format(value);
    const width = textWidth(label, font);
    const px = x(value);
    return { value, x: px, label, width, anchor: anchorInside(px, width, left, right) };
  });
  const free = all.filter((l) => !reserved.some((r) => collides(spanOf(l), r, gap)));
  for (let stride = 1; stride <= free.length; stride++) {
    const picked = free.filter((_, i) => i % stride === 0);
    const fits = picked.every((l, i) => i === 0 || !collides(spanOf(picked[i - 1]), spanOf(l), gap));
    if (fits) return picked;
  }
  return free.slice(0, 1);
}

// Tries each format from longest to shortest ("Nov 4" → "4", "$1,200" → "$1.2K") and keeps the
// first that still shows at least `minLabels`. A compact format beats a crushed axis.
export function fitAxis<T>({
  formats,
  minLabels = 3,
  ...options
}: Omit<Parameters<typeof fitLabels<T>>[0], "format"> & {
  formats: readonly ((value: T) => string)[];
  minLabels?: number;
}) {
  let best: AxisLabel<T>[] = [];
  for (const format of formats) {
    const labels = fitLabels({ ...options, format });
    if (labels.length >= minLabels) return labels;
    if (labels.length > best.length) best = labels;
  }
  return best;
}
