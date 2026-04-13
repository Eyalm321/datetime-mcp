import { describe, it, expect } from "vitest";
import {
  TimeResult,
  ConversionResult,
  formatUtcOffset,
  getOffsetMinutes,
  isDst,
  getTimeResult,
  validateTimezone,
  computeTimeDifference,
} from "../helpers.js";

describe("Module Exports", () => {
  it("exports all expected functions", () => {
    expect(typeof formatUtcOffset).toBe("function");
    expect(typeof getOffsetMinutes).toBe("function");
    expect(typeof isDst).toBe("function");
    expect(typeof getTimeResult).toBe("function");
    expect(typeof validateTimezone).toBe("function");
    expect(typeof computeTimeDifference).toBe("function");
  });
});

describe("TimeResult type contract", () => {
  it("getTimeResult returns object matching TimeResult interface", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result: TimeResult = getTimeResult(date, "UTC");

    expect(typeof result.timezone).toBe("string");
    expect(typeof result.datetime).toBe("string");
    expect(typeof result.date).toBe("string");
    expect(typeof result.time).toBe("string");
    expect(typeof result.day_of_week).toBe("string");
    expect(typeof result.is_dst).toBe("boolean");
    expect(typeof result.utc_offset).toBe("string");
  });
});

describe("Edge cases", () => {
  it("handles midnight correctly", () => {
    const midnight = new Date("2024-06-15T00:00:00Z");
    const result = getTimeResult(midnight, "UTC");
    // Intl.DateTimeFormat with hour12:false may return "24:00:00" or "00:00:00" for midnight
    expect(["00:00:00", "24:00:00"]).toContain(result.time);
    expect(result.date).toBe("2024-06-15");
  });

  it("handles end of day correctly", () => {
    const endOfDay = new Date("2024-06-15T23:59:59Z");
    const result = getTimeResult(endOfDay, "UTC");
    expect(result.time).toBe("23:59:59");
  });

  it("handles date boundary timezone conversions", () => {
    // 1am UTC on June 15 = previous day in US timezones
    const date = new Date("2024-06-15T01:00:00Z");
    const nyResult = getTimeResult(date, "America/New_York");
    expect(nyResult.date).toBe("2024-06-14");
  });

  it("handles leap year date", () => {
    const leapDay = new Date("2024-02-29T12:00:00Z");
    const result = getTimeResult(leapDay, "UTC");
    expect(result.date).toBe("2024-02-29");
  });

  it("handles year boundary", () => {
    const newYearsEve = new Date("2024-12-31T23:30:00Z");
    const tokyoResult = getTimeResult(newYearsEve, "Asia/Tokyo");
    // Tokyo is UTC+9, so 23:30 UTC = 08:30 next day
    expect(tokyoResult.date).toBe("2025-01-01");
  });
});
