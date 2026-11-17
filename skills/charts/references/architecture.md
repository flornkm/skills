# Architecture

Every chart is the same three pieces. Keeping them apart is what makes charts reliable: the geometry is a pure function you can test at any width without a browser.

```
components/charts/
  core/            ← copied from kit/: scale, text, axis, labels, path, time, react
  theme.ts         ← CSS variables for the palette (see palette.md)
  line-chart/
    geometry.ts    ← layoutLine({ data, width, height }) → every position in pixels
    geometry.test.ts
    line-chart.tsx ← measures, calls layout, draws SVG, places the tooltip
```

## 1. Measure

```tsx
const [ref, width] = useWidth<HTMLDivElement>();

return (
  <div ref={ref} style={{ height }} className="relative">
    {width > 0 && <svg width={width} height={height}>…</svg>}
  </div>
);
```

- Draw at the measured pixel width. **Never scale a fixed `viewBox` to fit**: text and strokes shrink with it and an 11px label becomes 7px on a phone.
- The height is fixed per chart (or a function of width, like `Math.min(260, width * 0.6)`), and the box reserves it before the first measure, so nothing shifts on load or hydration. If the layout may swap end labels for a legend row, the reserved height includes that row.
- The server renders the empty box. That's the honest answer: the server doesn't know the width.

## 2. Lay out

`geometry.ts` takes data, width and height and returns everything the SVG needs, already in pixels: the plot rectangle, scales, paths, the labels that survived, their anchors.

Order matters. Labels claim space first, marks get what's left:

1. Format and measure the labels that sit outside the plot (y gutter if any, series names at the end, the x axis row).
2. Derive the plot rectangle from those measurements, not from fixed margins.
3. Build the scales on that rectangle.
4. Fit the x labels (`fitAxis`), the y ticks (`tickCountFor` + `axisTicks`), and nudge end labels apart (`spread`).
5. Build paths and marks.

```ts
export function layoutLine({ points, series, width, height }: Input) {
  const font = AXIS_FONT;
  const endLabelWidth = widest(series.map((s) => s.label), font);
  const showEndLabels = endLabelWidth + 8 <= width * 0.25;

  const plot = {
    left: 0,
    right: width - (showEndLabels ? endLabelWidth + 8 : 0),
    top: 8,
    bottom: height - 22,
  };

  // The domain covers the data and every reference line (a goal above the data must show).
  const max = Math.max(
    ...points.flatMap((p) => series.map((s) => p.values[s.key] ?? 0)),
    limit?.value ?? 0,
    1,
  );
  const { top, ticks } = axisTicks(max, tickCountFor(plot.bottom - plot.top));
  const x = scaleLinear([times[0], times[times.length - 1]], [plot.left, plot.right]);
  const y = scaleLinear([0, top], [plot.bottom, plot.top]);

  const xLabels = fitAxis({
    values: times,
    x,
    formats: DAY_FORMATS,
    left: plot.left,
    right: plot.right,
    reserved: todayX === null ? [] : [{ start: todayX - 24, end: todayX + 24 }],
  });

  return { plot, x, y, ticks, xLabels, showEndLabels, lines /* … */ };
}
```

When a decision depends on space (end labels or legend, full or compact numbers), make it inside the layout from measurements, never with a viewport media query. The chart may sit in a sidebar on a wide screen.

## 3. Draw

The component only renders what the layout returned. No positioning maths in JSX.

- `<svg aria-hidden>` holds marks and labels; the wrapper carries `role`, `aria-label` and the key numbers as text.
- Text uses `font-variant-numeric: tabular-nums`, the font size the layout measured with, and `dy="0.32em"` to centre vertically.
- Labels drawn over marks get a halo in the surface colour: `stroke: var(--chart-surface); stroke-width: 4; paint-order: stroke`.
- The tooltip is HTML, absolutely positioned over the SVG (`placeTooltip`), so it can wrap, use the app's type, and never be clipped by the SVG.
- Set `overflow: visible` on the SVG only for halos and end dots; labels must already fit inside.

## Fonts

`textWidth` measures with the canvas, which needs the same font the SVG renders. Pass the resolved family, and re-run the layout once web fonts have loaded (`document.fonts.ready`), or the first layout measures the fallback font. Before measuring is possible it overestimates, so the first paint drops a label rather than overlapping one.

## Libraries

If the project already uses a chart library, apply the same rules through its API (custom tick formatters, `interval`, `minTickGap`, custom label components). Reach for this kit when the library fights the design: unusual chart types, branded tooltips, or labels it can't place.
