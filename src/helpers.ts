export interface TimeResult {
  timezone: string;
  datetime: string;
  date: string;
  time: string;
  day_of_week: string;
  is_dst: boolean;
  utc_offset: string;
}

export interface ConversionResult {
  source: TimeResult;
  target: TimeResult;
  time_difference: string;
}

export function formatUtcOffset(date: Date, tz: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "longOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value ?? "UTC";
}

export function getOffsetMinutes(date: Date, tz: string): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  return (new Date(utcStr).getTime() - new Date(tzStr).getTime()) / 60000;
}

export function isDst(date: Date, tz: string): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);

  const janOffset = getOffsetMinutes(jan, tz);
  const julOffset = getOffsetMinutes(jul, tz);
  const nowOffset = getOffsetMinutes(date, tz);

  const standardOffset = Math.max(janOffset, julOffset);
  return nowOffset < standardOffset;
}

export function getTimeResult(date: Date, tz: string): TimeResult {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "long",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value])
  );

  const isoDate = `${parts.year}-${parts.month}-${parts.day}`;
  const isoTime = `${parts.hour}:${parts.minute}:${parts.second}`;

  return {
    timezone: tz,
    datetime: `${isoDate}T${isoTime}`,
    date: isoDate,
    time: isoTime,
    day_of_week: parts.weekday ?? "",
    is_dst: isDst(date, tz),
    utc_offset: formatUtcOffset(date, tz),
  };
}

export function validateTimezone(tz: string): void {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch {
    throw new Error(`Invalid timezone: "${tz}". Use IANA format like "America/New_York".`);
  }
}

export function computeTimeDifference(date: Date, sourceTz: string, targetTz: string): string {
  const sourceOffset = -getOffsetMinutes(date, sourceTz);
  const targetOffset = -getOffsetMinutes(date, targetTz);
  const diffMinutes = targetOffset - sourceOffset;
  const hours = diffMinutes / 60;

  if (Number.isInteger(hours)) {
    return `${hours >= 0 ? "+" : ""}${hours.toFixed(1)}h`;
  }
  const formatted = hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${hours >= 0 ? "+" : ""}${formatted}h`;
}
