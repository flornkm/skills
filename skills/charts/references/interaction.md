# Interaction and motion

## Scrubbing

A chart is a row of positions (days, bars, dots). The pointer picks the nearest one; it never has to land on a mark.

- **Line and bar:** map the pointer's x to the closest index. Show one vertical guide, one dot per series at that index, and one tooltip listing every series.
- **Scatter:** the nearest dot within ~28px counts. Nothing nearby, no tooltip.
- **Donut:** the angle under the pointer picks the slice, anywhere in the ring.
- **Touch:** the same, with a finger drag. Don't block page scroll on a vertical swipe.
- **Keyboard:** the chart has `tabIndex={0}` and a label. Left/right arrows (and up/down for a scatter, in reading order) move between positions. Keyboard focus opens the tooltip; a mouse click that focuses the chart does not. Escape closes it.

Hover marks glide with inline transitions (about 180ms ease-out; just a 150ms opacity fade with reduced motion), so they move the same whatever CSS the host project generates.

## Tooltip

- Follows the hovered position and opens on whichever side has room.
- When neither side has room (a phone, a dot in the middle), it slides to stay inside the chart rather than off the screen.
- Rows use the same swatch as the series label: a small rounded square in the series colour.
- Values are formatted for people, with units. The date heads the tooltip once, not on every row.
- No tooltip should be needed to read the main point; it adds detail.

## Highlighting

Picking out a series dims every other mark to about 15% opacity. Don't brighten, thicken or animate the picked one.

In a donut with a list underneath, hovering a slice lights its row and vice versa. A divider between rows disappears when either neighbour is lit, so the lit row reads as one soft shape.

## The entrance

One shared entrance for every chart on the page:

```js
export const EASE_OUT = [0.22, 1, 0.36, 1];
export const IN_VIEW = { once: true, amount: 0.5 }; // mostly on screen, only once
export const reveal = (delay = 0, duration = 0.5) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: IN_VIEW,
  transition: { duration, delay, ease: EASE_OUT },
});
```

Then let the data choose the movement:

- **Line:** clip-reveal left to right. A forecast starts only once history has finished drawing, then runs at an even pace, so the crossing ring appears exactly as the dotted line reaches it.
- **Bars:** grow from the baseline, staggered by a few ms per bar.
- **Donut:** a clockwise sweep from twelve o'clock.
- **Heatmap:** a quick diagonal wave from the top left.
- **Labels and axes:** fade in with the chart, never fly in.

Clip paths and masks don't count as on screen themselves, so key the in-view trigger to the chart's container, not to the mask.

Total entrance under a second. With `prefers-reduced-motion: reduce`, render the final state with no movement.

## Server rendering

Charts that measure their container have width 0 until mounted. Render the frame at its final height on the server so nothing shifts, and draw marks once the width is known.
