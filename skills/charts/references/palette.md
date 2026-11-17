# Palette

Charts take their colours from the brand they live in. Never hard-code hex values in a chart; every colour is a CSS variable, so the same chart re-themes for another brand, or for dark mode, by overriding variables on a parent.

## Start from the project

1. Look for the brand's tokens first: CSS variables, a Tailwind theme, a design-system package, a `design.md` or brand guide. Use its primary colour, text colours, surface and border tokens.
2. If the brand already defines chart or data-visualisation colours, use them and check them (below). Don't invent a second palette.
3. Only when there's nothing, derive one.

## The tokens

Map the brand onto these names, and have charts use only these:

```css
.chart {
  --chart-1: …;        /* the series that matters: the brand's primary, or close to it */
  --chart-2: …;
  --chart-3: …;
  --chart-neutral: …;  /* comparison series ("last month") and "Other" */
  --chart-target: …;   /* limits, budgets, targets only: a warm red that isn't a series colour */
  --chart-axis: …;     /* the zero line */
  --chart-grid: …;     /* gridlines: the quietest thing on the chart */
  --chart-ink: …;      /* axis labels and notes: the brand's secondary or tertiary text colour */
  --chart-text: …;     /* series names and emphasised labels: the brand's primary text colour */
  /* What the chart sits on, for label halos. A card sets --chart-backdrop to its own fill. */
  --chart-surface: var(--chart-backdrop, Canvas);
}
```

Write each with `light-dark(light, dark)` (and `color-scheme: light dark` on the root), or set them per theme the way the project already switches themes.

## Deriving a categorical ramp

Three hues at most. A fourth category becomes `--chart-neutral` as "Other".

- Start at the brand's primary colour in OKLCH. That's `--chart-1`.
- Rotate the hue in even steps for `--chart-2` and `--chart-3` (around 50–60° each), and step the lightness too, so the colours stay apart by lightness, not only by hue. That's what keeps them distinct for colour-blind readers and in greyscale.
- Keep the chroma similar, so no series looks louder than the one that matters.
- For dark mode, raise the lightness a little and keep the hues.

A worked example (a violet brand), for reference only. Replace it with the brand's own:

```css
--chart-1: light-dark(oklch(0.5 0.23 285), oklch(0.55 0.24 290));
--chart-2: light-dark(oklch(0.63 0.23 340), oklch(0.63 0.22 345));
--chart-3: light-dark(oklch(0.76 0.16 55), oklch(0.67 0.15 60));
```

## Meaningful colour

Before reaching for the ramp, ask whether the data already has a colour:

- **Heat or busyness:** pale → warm → deep.
- **Speed:** warm for slow, cool for fast.
- **Money over a limit:** the target colour, only past the limit.
- **Good or bad:** only when the direction is unambiguous, and never as the only signal (add a sign or a word). Use the brand's own success and danger colours.

## Sequential ramp (heatmaps)

One hue, usually the brand's primary, blended in OKLCH from nearly the surface colour to deep, in four to six steps:

```js
const ramp = (hue, steps = 5) =>
  Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return `oklch(${0.97 - t * 0.52} ${0.02 + t * 0.16} ${hue})`;
  });
```

In dark mode, run the lightness the other way, so the quiet cells are nearly the dark surface.

## Text colour

Series names, labels and notes must stay readable, which a series colour often isn't (a pale or yellowish hue on white). Draw text in the series colour only when it reaches 4.5:1 against the surface; otherwise use `--chart-text` and put a small swatch in the series colour next to the name.

## Checks

Run these on every palette, in both themes:

1. **Colour-blind:** simulate protanopia, deuteranopia and tritanopia (Chrome DevTools > Rendering > Emulate vision deficiencies). Every pair of series must still be told apart, by lightness if not by hue.
2. **Contrast:** lines and marks at least 3:1 against the surface; text at least 4.5:1. `--chart-neutral` is for marks; check it, and darken it if a comparison line disappears.
3. **Greyscale:** a screenshot in greyscale still shows which series is primary.

If two colours only differ by hue, change their lightness.
