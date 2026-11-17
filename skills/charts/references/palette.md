# Palette

## The categorical ramp

Three hues, turning through OKLCH at even perceived steps: violet, magenta, apricot. Three because that is as many as stay apart for every reader. A fourth category becomes a grey "Other".

The chroma runs past sRGB on purpose: wide-gamut screens get the full colour, the rest get the browser's closest match.

```css
.chart {
  --chart-1: light-dark(oklch(0.5 0.23 285), oklch(0.55 0.24 290));   /* violet: the series that matters */
  --chart-2: light-dark(oklch(0.63 0.23 340), oklch(0.63 0.22 345));  /* magenta */
  --chart-3: light-dark(oklch(0.76 0.16 55), oklch(0.67 0.15 60));    /* apricot */

  --chart-neutral: light-dark(oklch(0.86 0.008 260), oklch(0.4 0.01 260));  /* comparison series, "Other" */
  --chart-target:  light-dark(oklch(0.64 0.17 25), oklch(0.66 0.16 25));    /* limits and targets only */

  --chart-axis: light-dark(oklch(0.86 0.008 260), oklch(0.34 0.01 260));
  --chart-grid: light-dark(oklch(0.945 0.005 260), oklch(0.22 0.008 260));
  --chart-ink:  light-dark(oklch(0.56 0.012 260), oklch(0.68 0.012 260));   /* labels */

  /* What the chart sits on, for halos and rings. A card sets --chart-backdrop to its own fill. */
  --chart-surface: var(--chart-backdrop, Canvas);
}
```

`light-dark()` lets a chart theme itself without extra stylesheets. Set `color-scheme: light dark` on the root. Override any token on a parent to re-theme every chart inside it.

If the project has a brand palette, derive the ramp from the brand's main colour instead: keep the lightness and chroma steps, rotate the hue. Don't use brand colours that fail the checks below.

## Meaningful colour

Before reaching for the ramp, ask whether the data already has a colour:

- **Heat / busyness:** pale yellow → orange → deep red.
- **Speed:** warm for slow, cool for fast.
- **Money over a limit:** the target colour, only past the limit.
- **Good / bad:** only when the direction is unambiguous, and never as the only signal (add a sign or a word).

## Sequential ramp (heatmaps)

One hue, blended in OKLCH from near-background to deep, in four to six steps:

```js
// lightness from 0.97 to 0.45, chroma rising with it, one hue
const steps = 5;
const ramp = Array.from({ length: steps }, (_, i) => {
  const t = i / (steps - 1);
  return `oklch(${0.97 - t * 0.52} ${0.02 + t * 0.16} 45)`;
});
```

In dark mode, run the lightness the other way: the quiet cells are nearly the dark background.

## Checks

Run these on every palette, in both themes:

1. **Colour-blind:** simulate protanopia, deuteranopia and tritanopia (Chrome DevTools > Rendering > Emulate vision deficiencies). Every pair of series must still be told apart, by lightness if not by hue.
2. **Contrast against the surface:** lines and small marks at least 3:1 against the background.
3. **Greyscale:** a screenshot in greyscale should still show which series is primary.

If two colours only differ by hue, change their lightness.
