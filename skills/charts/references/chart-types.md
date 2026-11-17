# Chart types

Pick from the question the chart answers.

| Question | Chart |
| --- | --- |
| How does it change over time? Will it cross a limit? | Line |
| How much per period, and what is it made of? | Stacked bar |
| What share does each part take of one total? | Donut (or a single stacked bar) |
| Does one thing depend on another? | Scatter |
| When does it happen? (hour × day, week × month) | Heatmap |
| One number and its direction | KPI value with a sparkline |

If a table would answer it better, use a table.

## Line

- The primary series gets the palette's first colour and a 2px stroke; comparison series (last month, last year) are the neutral grey and thinner.
- Each series draws only where it has data. This month stops at today.
- **Forecast:** carry the primary series forward at its recent rate as a dotted line in the same colour, starting at today.
- **Limit:** a target or budget is one horizontal line in the target colour, labelled once on the line itself, not a dataset with a dot on every day.
- **Crossing:** mark where the forecast meets the limit with a small ring and a note ("Over budget Nov 26").
- Mark "Today" on the x axis and the latest value with one dot.
- Name each series beside its last point.

## Stacked bar

- Stack when the segments add up to the bar. Grouped bars only for side-by-side comparison of a few series.
- Order segments so the most important one sits on the baseline, where its length is easiest to compare.
- Each segment above the first gives up 2px at its foot, so fills never touch.
- Round the top corners of the top segment and the bottom corners of the bottom one; clamp the radius so thin segments still close.
- Name the series beside the last bar, level with their own segment.
- Bars start at zero, always.

## Donut

- Up to three slices in palette colours, then a grey "Other". Never a rainbow.
- Even gaps between slices and softly rounded slice corners.
- The total goes in the centre of the ring (not the centre of the canvas, which shifts when a legend wraps).
- Put the breakdown in a list under the ring (swatch, name, share), not percentage labels piled on thin slices.
- Hover picks the slice by angle under the pointer, so the whole ring is a target, not just the thin stroke. The matching list row lights up too.
- If parts need precise comparison, use a bar instead.

## Scatter

- One colour per group, up to three.
- The pointer picks the nearest dot within a radius; tooltips go below the dot in the top half of the chart and above it in the bottom half.
- One least-squares trend line per group, across only the range that group covers.
- Axis titles in words with units ("Prompt size, tokens"), not field names.
- The axis range comes from the data. Never clip the slow or large outliers; they're often the point.

## Heatmap

- One hue from pale to deep, blended in OKLCH so each step looks evenly darker.
- Four to six distinct steps, not a smooth gradient: the eye compares steps, not shades.
- The lowest step is nearly the background so quiet cells recede.
- No raw numbers in every cell. Show the value in a tooltip; label only the hottest cell if needed.
- Label a few columns (every 6 hours, not all 24) and never rotate them.
- Cells are square unless the layout gives a fixed height.
- Entrance: a quick diagonal wave from the top left.

## KPI with sparkline

- The number is the hero; the sparkline is context with no axes, no grid, no labels.
- Show the change in words and sign ("+12% vs last month"), coloured only if up/down has a clear good/bad direction.
