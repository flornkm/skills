import { useCallback, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";

// Charts draw in real pixels so text and strokes never scale with the container. The width is 0
// until the element is measured, which is also what the server renders: reserve the height and
// draw nothing until then. Callback refs returning a cleanup need React 19; on 18, keep the
// observer in a ref and disconnect it when the node is null.
export function useWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);
  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

const STEP_KEYS: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };

// Scrubbing through a chart's positions with a pointer, a finger or the arrow keys. `pick` maps a
// pointer position inside the chart to the index it should snap to, or null for nothing nearby.
export function useScrub({
  count,
  pick,
  label,
  valueText,
}: {
  count: number;
  pick: (x: number, y: number) => number | null;
  // What the chart shows, and what the focused position says out loud ("Sep 14: 2,071 sign-ups").
  label: string;
  valueText: (index: number) => string;
}) {
  const [active, setActive] = useState(count - 1);
  const [visible, setVisible] = useState(false);
  const [pointerY, setPointerY] = useState<number | null>(null);
  const index = Math.max(0, Math.min(count - 1, active));

  const onPointer = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = pick(event.clientX - bounds.left, event.clientY - bounds.top);
    if (next === null) return setVisible(false);
    setActive(next);
    setPointerY(event.clientY - bounds.top);
    setVisible(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") return setVisible(false);
    let next: number | null = null;
    if (event.key in STEP_KEYS) next = index + STEP_KEYS[event.key];
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(Math.max(0, Math.min(count - 1, next)));
    setPointerY(null);
    setVisible(true);
  };

  return {
    index,
    visible,
    pointerY,
    props: {
      tabIndex: 0,
      role: "slider" as const,
      "aria-valuemin": 0,
      "aria-valuemax": count - 1,
      "aria-valuenow": index,
      "aria-valuetext": valueText(index),
      "aria-label": label,
      onPointerMove: onPointer,
      onPointerDown: onPointer,
      onPointerLeave: () => setVisible(false),
      onKeyDown,
      // A click focuses the chart too, but only keyboard focus should open the tooltip by itself.
      onFocus: (event: FocusEvent<HTMLElement>) => {
        if (event.currentTarget.matches(":focus-visible")) setVisible(true);
      },
      onBlur: () => setVisible(false),
    },
  };
}

// Opens on whichever side of `x` has room; when neither does (a phone, a point in the middle), it
// slides to stay inside the chart rather than off the screen.
export function placeTooltip({
  x,
  width,
  bounds,
  gap = 12,
}: {
  x: number;
  width: number;
  bounds: number;
  gap?: number;
}) {
  const fitsRight = x + gap + width <= bounds;
  const side = fitsRight || x < bounds - x ? ("right" as const) : ("left" as const);
  const preferred = side === "right" ? x + gap : x - gap - width;
  return { side, left: Math.max(0, Math.min(bounds - width, preferred)) };
}
