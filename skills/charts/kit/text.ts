export type Font = { size: number; family: string; weight?: number };

// Match what the SVG actually renders: same size, weight and family as the text style. Pass the
// resolved family (e.g. from getComputedStyle) when the CSS uses a variable.
export const AXIS_FONT: Font = { size: 11, family: "system-ui, sans-serif", weight: 400 };

let context: CanvasRenderingContext2D | null | undefined;

// Real text width from the canvas. On the server, or before the canvas exists, it overestimates
// on purpose (0.62em per character), so a first layout drops labels rather than overlapping them.
export function textWidth(text: string, font: Font = AXIS_FONT) {
  if (context === undefined) {
    context = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  }
  if (!context) return text.length * font.size * 0.62;
  context.font = `${font.weight ?? 400} ${font.size}px ${font.family}`;
  return context.measureText(text).width;
}

// Longest label in a set, for reserving a gutter (y labels, series names) before laying out.
export const widest = (labels: readonly string[], font: Font = AXIS_FONT) =>
  labels.reduce((max, label) => Math.max(max, textWidth(label, font)), 0);
