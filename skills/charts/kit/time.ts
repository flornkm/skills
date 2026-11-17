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

export const MONTH_FORMATS = [
  (time: number) => monthOnly.format(time),
  (time: number) => monthOnly.format(time).slice(0, 1),
] as const;

const full = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const NUMBER_FORMATS = [
  (value: number) => full.format(value),
  (value: number) => compact.format(value),
] as const;
