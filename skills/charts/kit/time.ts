export const DAY = 86_400_000;

// Dates are calendar days, not instants: parse and format them in UTC so no timezone shifts a
// Monday onto a Sunday.
export const toTime = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

const formatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });

const monthDay = formatter({ month: "short", day: "numeric" });
const dayOnly = formatter({ day: "numeric" });
const monthOnly = formatter({ month: "short" });

// Longest to shortest, for fitAxis: it falls back to the next one when labels run out of room.
export const DAY_FORMATS = [
  (time: number) => monthDay.format(time),
  (time: number) => dayOnly.format(time),
] as const;

// No single-letter fallback: "J J A" is ambiguous. Thin months instead.
export const MONTH_FORMATS = [(time: number) => monthOnly.format(time)] as const;

// For weekly buckets, keyed by the week's first day. "Week of" belongs in the tooltip or the
// title, not on every tick.
export const WEEK_FORMATS = DAY_FORMATS;

const full = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const NUMBER_FORMATS = [
  (value: number) => full.format(value),
  (value: number) => compact.format(value),
] as const;

export const USD_FORMATS = [
  (value: number) => usd.format(value),
  (value: number) => usdCompact.format(value),
] as const;
