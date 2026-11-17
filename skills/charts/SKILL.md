---
name: charts
description: "Build custom SVG charts and dashboards in React that look designed, not library-default, and stay legible at every container width. Use whenever you build, restyle or review a chart, graph, sparkline, donut, heatmap, KPI card or dashboard; when a chart library can't do the design (unusual chart types, branded tooltips, custom labels); when axis labels, tick labels, series names or legends overlap, rotate, clip or get crushed on small screens; or when the user says a chart looks cheap, generic, busy or 'default'."
---

# Charts

Chart libraries are built to render any data, not to explain yours. Left alone they give you a rainbow, a legend box on top, rotated dates, and a line that dips where the data never did. And on a phone the labels pile into each other.

Build charts as plain SVG in React, drawn at the container's real pixel width, with every label measured and placed before anything is drawn. Not canvas: SVG is styleable, accessible, crisp, and the text is real text.

## Workflow

1. **Say what the chart is for in one sentence.** "Are we going over budget this month?" That picks the chart type, the one series that matters, and the annotation. See [chart types](references/chart-types.md).
2. **Copy the kit** from [`kit/`](kit) into the project (e.g. `components/charts/core/`). It has no dependencies besides React:
   - `scale.ts`: linear scales, round ticks, gridline count from height
   - `text.ts`: label widths measured with the canvas
   - `axis.ts`: `fitAxis` / `fitLabels`, which pick formats and thin labels so they never collide, and anchor edge labels inward
   - `labels.ts`: `spread` for end labels, `keepByPriority` for thresholds, `labelProblems` for tests
   - `path.ts`: line, area, and a monotone curve that never overshoots
   - `time.ts`: UTC calendar days and long-to-short formats
   - `react.ts`: `useWidth`, `useScrub` (pointer, touch, keyboard) and `placeTooltip`
3. **Split every chart into three parts** ([architecture](references/architecture.md)):
   - `geometry.ts`: a pure `layout({ data, width, height })` that returns every position in pixels. Labels claim their space first, the plot gets the rest.
   - `chart.tsx`: measures the width, reserves the height, renders exactly what the layout returned, and puts an HTML tooltip on top.
   - `geometry.test.ts`: runs the layout at 260, 320, 390, 768 and 1040px and asserts `labelProblems(...)` is empty.
4. **Handle narrow widths in this order:** shorter formats, fewer labels, fewer gridlines, labels inside the plot, drop secondary text, names into a legend row, less data. Never rotate labels, never scale a `viewBox`, never go below 11px. Details in [responsive labels](references/responsive-labels.md).
5. **Apply the design rules** below, the [palette](references/palette.md) and [interaction and motion](references/interaction.md).
6. **Verify:** the layout tests pass, then screenshot the real component at 320 and 1040px, in light and dark, and go through the checklist.

## Design rules

### Data honesty
- **Missing is not zero.** Future days and gaps are `null`; the line stops at today instead of crashing to the floor.
- **Curves never overshoot** (`monotonePath`). A spline that dips makes a cumulative total look like it fell.
- **Bars start at zero.** Lines may zoom, bars may not.
- **The domain comes from the data plus every reference line** (budgets, targets, ranges), with headroom. Never a hard-coded max that clips data.
- **Stack when parts make a whole;** group only to compare side by side.
- **One trend line per series,** across the range that series covers.
- **Dates are calendar days in UTC.**

### Colour
- **Three hues at most,** the rest folds into a grey "Other".
- **Colour means something:** one hue pale to deep for sequences, warm for slow or hot, the target colour only past the limit.
- **Heatmaps get a few distinct steps,** and the quietest cells are nearly the background.
- **Check every palette** for colour blindness, contrast and both themes.

### Labels and ink
- **Name series where they end,** in their colour. A legend is the fallback when names don't fit.
- **Values sit on their gridline inside the plot,** with a halo.
- **Round ticks** (1, 2, 5 × 10ⁿ) and labels for people: `$400`, `10M`, `Nov 4`.
- **Annotate the point of the chart on the chart:** "Over budget Nov 26".
- **Gridlines are the quietest thing.** Axis lighter than text, text lighter than data.
- **No dot on every point,** no borders on bars, no shadows. Mark today, the latest value, the crossing.
- **Stacked segments get a 2px gap** and round only the outer corners.

### Interaction and motion
- **Scrub, don't hunt:** snap to the nearest position, one tooltip for all series. Arrow keys work; keyboard focus opens the tooltip.
- **The tooltip is measured and stays inside the chart,** opening on the side with room.
- **Highlight by dimming the rest** to about 15%.
- **One shared entrance,** started when the chart is mostly on screen, once, following the data (lines draw left to right, donuts sweep clockwise). Reduced motion shows the final state.

### Accessibility
- The SVG is `aria-hidden`; the wrapper has a label that states what the chart shows, and the key number is also in text.

## Checklist

- [ ] I can say what the chart is for, and the highlighted series answers it.
- [ ] The layout is a pure function, and its tests pass at 260, 320, 390, 768 and 1040px with no label problems.
- [ ] No rotated, overlapping, clipped or sub-11px labels at any width; edge labels are anchored inward.
- [ ] The SVG is drawn at the measured width; nothing shifts on load.
- [ ] Three hues or fewer, colour-blind safe, working in light and dark.
- [ ] Gaps and the future are empty, not zero; no curve overshoots; bars start at zero.
- [ ] No legend box unless names don't fit inline.
- [ ] Hover, touch and arrow keys show one tooltip that stays on screen.
- [ ] Nothing in the chart is a library default nobody chose.

## Reference

- [Architecture](references/architecture.md): measure, lay out, draw; fonts; using a library instead.
- [Responsive labels](references/responsive-labels.md): every axis, label and legend at every width, with the test recipe.
- [Chart types](references/chart-types.md): which chart for which question, and specifics per type.
- [Palette](references/palette.md): the OKLCH ramp, theme tokens, sequential ramps and checks.
- [Interaction and motion](references/interaction.md): scrubbing, tooltips, keyboard, the entrance.
