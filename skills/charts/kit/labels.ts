// The vertical pitch two 11px labels need to pass labelProblems: their box (1.2em) plus its 2px
// pad. Use fontSize * 1.2 + 2 for other sizes.
export const LABEL_PITCH = Math.ceil(11 * 1.2 + 2);

// Nudges labels apart vertically so none sit closer than `gap`, keeping their order and staying
// between `min` and `max`. Used for series names at the end of lines and stacked bars.
export function spread<T extends { y: number }>(
  items: readonly T[],
  gap = LABEL_PITCH,
  min = -Infinity,
  max = Infinity,
): T[] {
  const placed = [...items].sort((a, b) => a.y - b.y).map((item) => ({ ...item }));
  for (let i = 0; i < placed.length; i++) {
    const floor = i === 0 ? min : placed[i - 1].y + gap;
    placed[i].y = Math.max(placed[i].y, floor);
  }
  for (let i = placed.length - 1; i >= 0; i--) {
    const ceiling = i === placed.length - 1 ? max : placed[i + 1].y - gap;
    placed[i].y = Math.min(placed[i].y, ceiling);
  }
  return placed;
}

// When labels on one axis can't all fit (threshold values, reference lines, markers), keep the
// important ones: walk from highest priority down and drop anything closer than `gap` to a label
// already kept. Duplicated values collapse into one. Lower number = more important.
export function keepByPriority<T extends { at: number; priority: number }>(
  items: readonly T[],
  gap: number,
): T[] {
  const kept: T[] = [];
  for (const item of [...items].sort((a, b) => a.priority - b.priority)) {
    if (kept.every((k) => Math.abs(k.at - item.at) >= gap)) kept.push(item);
  }
  return kept.sort((a, b) => a.at - b.at);
}

export type Box = { x: number; y: number; width: number; height: number; id?: string };

// A text label's box, for collision checks. `y` is the text's vertical centre (dy="0.32em").
export function textBox(
  x: number,
  y: number,
  width: number,
  fontSize: number,
  anchor: "start" | "middle" | "end",
  id?: string,
): Box {
  const left = anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2;
  return { x: left, y: y - fontSize * 0.6, width, height: fontSize * 1.2, id };
}

export const overlaps = (a: Box, b: Box, pad = 0) =>
  a.x < b.x + b.width + pad &&
  b.x < a.x + a.width + pad &&
  a.y < b.y + b.height + pad &&
  b.y < a.y + a.height + pad;

// Every pair of labels that touch, plus every label that leaves the chart. Run it in a test
// against the layout at several widths; an empty list is the goal.
export function labelProblems(boxes: readonly Box[], width: number, height: number, pad = 2) {
  const problems: string[] = [];
  boxes.forEach((box, i) => {
    if (box.x < 0 || box.x + box.width > width || box.y < 0 || box.y + box.height > height) {
      problems.push(`${box.id ?? i} leaves the ${width}×${height} chart`);
    }
    for (let j = i + 1; j < boxes.length; j++) {
      if (overlaps(box, boxes[j], pad)) problems.push(`${box.id ?? i} overlaps ${boxes[j].id ?? j}`);
    }
  });
  return problems;
}
