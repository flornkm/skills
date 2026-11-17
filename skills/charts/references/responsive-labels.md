# Responsive labels

Labels are what break first. A chart that looks right at 1040px usually has crushed dates, overlapping series names and a y axis eating a third of the width at 320px. Plan for the narrow case first.

## The widths

Lay out and check every chart at **260, 320, 390, 768 and 1040px** of container width (not viewport). 260 is a card in a narrow column or a phone with padding; if it works there, it works.

## Measure, don't guess

- Measure every label with `textWidth` (canvas `measureText`) in the font, size and weight the SVG renders. A guessed constant like "60px per date" breaks with a longer locale, a currency symbol or a unit.
- Before measuring is possible it overestimates (0.62em per character), so the first layout drops labels instead of overlapping them.
- Re-run the layout once web fonts have loaded.
- Keep axis text at 11px or more. When space runs out, show fewer labels, never smaller ones.

## When space runs out, in this order

1. **Shorten the format.** `Nov 4` → `4`, `$1,200` → `$1.2K`, `November` → `Nov` → `N`. Add the year only when the data spans more than one. `fitAxis` tries the formats longest first.
2. **Thin the labels.** Keep every nth, evenly, so the gaps stay regular. Never keep "all except a few".
3. **Fewer gridlines.** The count comes from the plot height (`tickCountFor`), not a constant.
4. **Move labels inside the plot.** Y values sit on their gridline at the left edge with a halo, instead of a gutter of numbers.
5. **Drop secondary text.** Notes, units in titles, the comparison series' name. The detail is still in the tooltip.
6. **Move names off the chart.** End-of-line names become a small HTML legend row under the chart when they'd take more than a quarter of the width.
7. **Show less data.** Fewer bars, a shorter range, a bigger bucket (2-hour heatmap cells instead of 1-hour), or paging. A readable week beats a crushed month.

Never rotate labels. Never scale the SVG with a `viewBox`. Never let a label leave the chart's box.

## X axis

```ts
const xLabels = fitAxis({
  values: times,
  x,
  formats: DAY_FORMATS,
  left: plot.left,
  right: plot.right,
  gap: 12,
  reserved: markers.map((m) => ({ start: m.x - m.width / 2, end: m.x + m.width / 2 })),
});
```

- **Edges:** a label that would cross the plot edge is anchored to it (`text-anchor="start"` on the first, `"end"` on the last) instead of hanging off or being clipped. `fitLabels` does this.
- **Markers win:** "Today", the current value, a forecast end. Pass them as `reserved` spans so ordinary ticks around them step aside.
- **The last label:** after thinning, only add the final tick back if it still keeps the gap.
- **Unevenly spaced data:** decide whether x is time (proportional gaps) or sequence (even spacing) and say so in the tooltip; don't silently squash gaps.

## Y axis

- Ticks are round numbers from `axisTicks`, at most as many as the height allows.
- Labels sit on their gridline inside the plot (`y - 5`, `text-anchor="start"`), drawn after the marks with a halo, and the zero label is skipped. If marks fill the left edge (bars starting at zero), use a gutter instead, sized by the widest formatted tick plus 8px.
- **Thresholds and reference lines** (budgets, targets, healthy ranges) aren't round numbers. Collapse duplicates, then keep them by importance with `keepByPriority(items, 24)`, so the target beats the secondary bound when they're close.
- **Band labels:** a label for a shaded range goes inside the band when it fits, above it when the band is shorter than the text.
- **Domain:** include every reference line in the domain (a limit above the data must be visible), plus headroom. Guard zero ranges and non-finite values.

## Series names at the end of lines and bars

```ts
const nameWidth = widest(series.map((s) => s.label));
const inline = nameWidth + 8 <= width * 0.25;
const plotRight = width - (inline ? nameWidth + 8 : 0);
const names = inline
  ? spread(
      series.map((s) => ({ label: s.label, width: textWidth(s.label), y: y(lastValue(s)) })),
      14,
      plot.top,
      plot.bottom,
    )
  : [];
```

- Reserve the gutter from the measured names **before** building the x scale.
- `spread` keeps their order, keeps them 14px apart and inside the plot.
- If they don't fit inline, render a legend row under the chart (HTML, wraps naturally) with the same swatch the tooltip uses.

## Bars

- Category labels: measure the widest. If it's wider than the band, try a shorter format, then thin, then switch to **horizontal bars**, where labels get their own column on the left. Don't rotate text.
- Value labels inside a bar only if the measured text fits with 4px padding; above it if there's room; otherwise only in the tooltip.
- Below about 4px per bar, aggregate (weeks instead of days) rather than drawing slivers.

## Donut and rings

- The total goes in the ring's centre, sized to the inner diameter: measure it and step the font down a size, then drop the caption line, before it touches the ring.
- Labels on slices only when the arc is longer than the measured label. Otherwise the breakdown is a list under the ring.
- Below a small size (around 120px), drop secondary text in the centre entirely.

## Heatmap

- Column labels go through `fitLabels`, so a narrow chart shows every 6th or 12th hour.
- Cells have a minimum size (about 8px). Below that, merge buckets instead of shrinking cells.
- No numbers in cells unless the measured value fits; the tooltip carries the value.

## Notes and annotations

- Test each note's box against axis labels and marks (`overlaps`). If it doesn't fit, try the other side of its target, then drop it. An annotation that covers data is worse than none.

## Tooltip

- Measure the tooltip, then `placeTooltip` it: the side with room, clamped inside the chart. `maxWidth` is the chart width, so it wraps on phones instead of overflowing.
- Close it on scroll; on touch, the chart allows vertical panning (`touch-action: pan-y`) so scrolling the page never gets stuck on a chart.
- Hit areas are bigger than marks: nearest-x snapping for lines and bars, nearest-dot within ~28px for scatters, the full wedge (not just the stroke) for donuts.

## Test it

The layout is a pure function, so test it at every width. Collect a box for every label the layout returns and assert there are no problems:

```ts
import { labelProblems, textBox } from "./core/labels";

for (const width of [260, 320, 390, 768, 1040]) {
  test(`labels fit at ${width}px`, () => {
    const g = layoutLine({ points, series, width, height: 240 });
    const boxes = [
      ...g.xLabels.map((l) => textBox(l.x, g.plot.bottom + 12, l.width, 11, l.anchor, l.label)),
      ...g.names.map((n) => textBox(g.plot.right + 8, n.y, n.width, 11, "start", n.label)),
    ];
    expect(labelProblems(boxes, width, 240)).toEqual([]);
    expect(g.xLabels.length).toBeGreaterThanOrEqual(2);
  });
}
```

Use realistic data, including the longest labels you expect (large numbers, long series names) and the edge cases: one point, all zeros, a single huge outlier, missing values. Then screenshot the real component at 320 and 1040, in light and dark, and look.
