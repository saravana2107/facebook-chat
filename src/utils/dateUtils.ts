import { formatDistanceToNowStrict } from "date-fns";
export const iso = (d = new Date()) => d.toISOString();

/**
 * Format date in compact form like "5m", "2h", "3d"
 *
 * @param date
 * @returns
 */
export function formatCompact(date: Date) {
  const result = formatDistanceToNowStrict(date, { unit: "minute" });

  const map: Record<string, string> = {
    second: "s",
    seconds: "s",
    minute: "m",
    minutes: "m",
    hour: "h",
    hours: "h",
    day: "d",
    days: "d",
    month: "mo",
    months: "mo",
    year: "y",
    years: "y",
  };

  const [value, unit] = result.split(" ");
  return value + map[unit];
}
