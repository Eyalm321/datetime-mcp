import { describe, it, expect } from "vitest";
import {
  formatUtcOffset,
  getOffsetMinutes,
  isDst,
  getTimeResult,
  validateTimezone,
  computeTimeDifference,
} from "../helpers.js";

describe("validateTimezone", () => {
  it("accepts valid IANA timezones", () => {
    expect(() => validateTimezone("America/New_York")).not.toThrow();
    expect(() => validateTimezone("Europe/London")).not.toThrow();
    expect(() => validateTimezone("Asia/Tokyo")).not.toThrow();
    expect(() => validateTimezone("UTC")).not.toThrow();
  });

  it("rejects invalid timezones", () => {
    expect(() => validateTimezone("Invalid/Zone")).toThrow('Invalid timezone: "Invalid/Zone"');
    expect(() => validateTimezone("NotATimezone")).toThrow("Invalid timezone");
    expect(() => validateTimezone("")).toThrow("Invalid timezone");
  });
});

describe("formatUtcOffset", () => {
  it("returns a string containing UTC or GMT offset", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const offset = formatUtcOffset(date, "America/New_York");
    expect(offset).toMatch(/GMT|UTC/);
  });

  it("returns UTC for UTC timezone", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const offset = formatUtcOffset(date, "UTC");
    expect(offset).toMatch(/GMT|UTC/);
  });
});

describe("getOffsetMinutes", () => {
  it("returns 0 for UTC", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    expect(getOffsetMinutes(date, "UTC")).toBe(0);
  });

  it("returns a non-zero value for non-UTC timezones", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const offset = getOffsetMinutes(date, "America/New_York");
    expect(offset).not.toBe(0);
  });

  it("returns consistent offsets for known timezones", () => {
    // In winter (no DST), New York is UTC-5 → offset should be 300
    const winter = new Date("2024-01-15T12:00:00Z");
    expect(getOffsetMinutes(winter, "America/New_York")).toBe(300);
  });
});

describe("isDst", () => {
  it("returns true during summer in Northern Hemisphere DST zones", () => {
    const summer = new Date("2024-07-15T12:00:00Z");
    expect(isDst(summer, "America/New_York")).toBe(true);
  });

  it("returns false during winter in Northern Hemisphere DST zones", () => {
    const winter = new Date("2024-01-15T12:00:00Z");
    expect(isDst(winter, "America/New_York")).toBe(false);
  });

  it("returns false for UTC (no DST)", () => {
    const date = new Date("2024-07-15T12:00:00Z");
    expect(isDst(date, "UTC")).toBe(false);
  });
});

describe("getTimeResult", () => {
  it("returns all required fields", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = getTimeResult(date, "UTC");

    expect(result).toHaveProperty("timezone", "UTC");
    expect(result).toHaveProperty("datetime");
    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("time");
    expect(result).toHaveProperty("day_of_week");
    expect(result).toHaveProperty("is_dst");
    expect(result).toHaveProperty("utc_offset");
  });

  it("returns correct date format (YYYY-MM-DD)", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = getTimeResult(date, "UTC");
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns correct time format (HH:MM:SS)", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = getTimeResult(date, "UTC");
    expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it("returns correct datetime format (ISO-like)", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = getTimeResult(date, "UTC");
    expect(result.datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("returns a valid day of week", () => {
    const date = new Date("2024-06-15T12:00:00Z"); // Saturday
    const result = getTimeResult(date, "UTC");
    expect(result.day_of_week).toBe("Saturday");
  });

  it("respects timezone parameter", () => {
    const date = new Date("2024-06-15T04:00:00Z"); // 4am UTC = midnight EDT
    const utcResult = getTimeResult(date, "UTC");
    const nyResult = getTimeResult(date, "America/New_York");
    expect(utcResult.time).not.toBe(nyResult.time);
  });

  it("preserves timezone in result", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = getTimeResult(date, "Asia/Tokyo");
    expect(result.timezone).toBe("Asia/Tokyo");
  });
});

describe("computeTimeDifference", () => {
  it("returns +0.0h for same timezone", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    expect(computeTimeDifference(date, "UTC", "UTC")).toBe("+0.0h");
  });

  it("returns correct difference between UTC and known timezone", () => {
    // In summer, Tokyo is UTC+9
    const date = new Date("2024-06-15T12:00:00Z");
    const diff = computeTimeDifference(date, "UTC", "Asia/Tokyo");
    expect(diff).toBe("+9.0h");
  });

  it("returns negative difference when going west", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const diff = computeTimeDifference(date, "Asia/Tokyo", "UTC");
    expect(diff).toBe("-9.0h");
  });

  it("handles fractional offsets (e.g., India UTC+5:30)", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const diff = computeTimeDifference(date, "UTC", "Asia/Kolkata");
    expect(diff).toBe("+5.5h");
  });
});
