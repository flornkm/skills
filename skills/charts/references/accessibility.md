# Accessibility

A chart is accessible when someone who can't see it, can't use a mouse, or sees colours differently still gets the same answer from it.

## 1. A text alternative

- The `<svg>` is `aria-hidden`. The wrapper carries the chart's name (`aria-label`, or `aria-labelledby` pointing at the card title).
- The point of the chart is also in text, in the card or next to it: "$162 spent this month, on track to pass the $400 budget on Nov 26." That sentence is what most readers need.

## 2. The whole dataset as a table

Stepping through points one by one is slow. Render the same rows as a real table with `ChartDataTable` from the kit:

```tsx
<ChartDataTable
  caption="Weekly sign-ups by channel, Jul 6 to Sep 21"
  rows={weeks}
  rowKey={(w) => w.week}
  columns={[
    { header: "Week of", cell: (w) => formatDay(toTime(w.week)) },
    ...channels.map((c) => ({ header: c.label, cell: (w) => w[c.key] ?? "Not tracked" })),
    { header: "Total", cell: (w) => formatNumber(total(w)) },
  ]}
/>
```

- Hidden by default (visually hidden, not `display: none`), so screen readers find it right after the chart.
- For data-heavy products, offer it to everyone with a "View as table" toggle (`visible`).
- Values are formatted the way the tooltip formats them. Missing stays "Not tracked", never 0.

## 3. Keyboard and focus

- The interactive chart is one tab stop (`tabIndex={0}`). Arrow keys move between positions, Home and End jump to the ends, Escape closes the tooltip. `useScrub` does this.
- **Focus is visible.** The wrapper gets a focus ring on `:focus-visible` (2px, offset, in the brand's focus colour), and the active position shows a guide line or ring on the mark, so a keyboard user always sees where they are.
- Keyboard focus opens the tooltip; a mouse click that focuses the chart doesn't.
- Anything you can do by hovering, you can do with the keyboard: highlighting a series from its name, opening a slice of a donut.

## 4. Screen reader output

- `useScrub` sets `role="slider"` for arrow-key navigation, `aria-roledescription="interactive chart"` so it isn't announced as a slider, `aria-label` with the chart's name, and `aria-valuetext` for the current position.
- Write `valueText` as a sentence a person would say: "Sep 14: 2,071 sign-ups, goal reached", not "index 10".
- Notes on the chart ("Over budget Nov 26") are in the text alternative too, since the SVG is hidden.

## 5. Colour, contrast and high-contrast mode

- Follow the [palette](palette.md) checks: colour-blind safe, 3:1 for marks, 4.5:1 for text, readable in greyscale, and good or bad never shown by colour alone.
- Name series directly, so nobody has to match colours to a legend.
- **Windows high contrast (forced colours)** replaces your colours with a few system colours, and fills can disappear. Keep marks distinguishable:

```css
@media (forced-colors: active) {
  .chart svg { forced-color-adjust: none; }
  .chart [data-mark="bar"] { stroke: CanvasText; stroke-width: 1; }
  .chart [data-mark="line"] { stroke: CanvasText; }
  .chart [data-series="2"] { stroke-dasharray: 6 3; }   /* second line dashed */
  .chart [data-series="3"] { stroke-dasharray: 2 3; }   /* third line dotted */
  .chart text { fill: CanvasText; }
  .chart [data-mark="target"] { stroke: Highlight; }
}
```

Tag marks with `data-mark` and `data-series` in the SVG so these selectors have something to hold on to.

## 6. Motion

- The entrance runs once, under a second, and `prefers-reduced-motion: reduce` shows the final state immediately.
- Hover marks glide with short transitions; with reduced motion they only fade.
- Nothing loops or moves on its own while the reader is looking at the data.

## 7. Touch and zoom

- Touch scrubbing allows vertical panning (`touch-action: pan-y`), so the page never gets stuck on a chart.
- Targets are bigger than marks: nearest position, nearest dot within ~28px, the whole donut wedge.
- Text stays at 11px or more and is drawn at real pixel size, so browser zoom enlarges it with everything else.

## Check

- Tab to the chart: the focus ring shows, arrow keys move, the tooltip and active marker follow, Escape closes it.
- With VoiceOver or NVDA: the chart is announced with its name and as an interactive chart, each position reads as a sentence, and the data table follows with every value.
- With Windows high contrast (or Chrome DevTools > Rendering > Emulate forced-colors): every series is still distinguishable.
- With reduced motion on: no entrance animation.
