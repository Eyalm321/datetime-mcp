#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getTimeResult,
  validateTimezone,
  computeTimeDifference,
  getOffsetMinutes,
  type ConversionResult,
} from "./helpers.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_TIMEZONE = process.env.MCP_TIME_TIMEZONE ?? "America/New_York";

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "mcp-time",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Resource: always-on current time (included in context automatically)
// ---------------------------------------------------------------------------

server.resource(
  "current-time",
  "time://current",
  {
    description:
      "Current date and time. Subscribe to this resource for always-on datetime awareness.",
    mimeType: "application/json",
  },
  () => {
    const now = new Date();
    const result = getTimeResult(now, DEFAULT_TIMEZONE);
    return {
      contents: [
        {
          uri: "time://current",
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool: get_current_time
// ---------------------------------------------------------------------------

server.tool(
  "get_current_time",
  `Get the current date and time in a specific timezone. Defaults to ${DEFAULT_TIMEZONE} if no timezone is specified by the user.`,
  {
    timezone: z
      .string()
      .default(DEFAULT_TIMEZONE)
      .describe(
        `IANA timezone name (e.g. "America/New_York", "Europe/London", "Asia/Jerusalem"). Defaults to ${DEFAULT_TIMEZONE}.`
      ),
  },
  async ({ timezone }) => {
    try {
      validateTimezone(timezone);
      const result = getTimeResult(new Date(), timezone);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: convert_time
// ---------------------------------------------------------------------------

server.tool(
  "convert_time",
  "Convert a time from one timezone to another.",
  {
    source_timezone: z
      .string()
      .default(DEFAULT_TIMEZONE)
      .describe(
        `Source IANA timezone (e.g. "America/New_York"). Defaults to ${DEFAULT_TIMEZONE}.`
      ),
    time: z
      .string()
      .describe("Time to convert in 24-hour HH:MM format (e.g. \"14:30\")."),
    target_timezone: z
      .string()
      .describe(
        "Target IANA timezone (e.g. \"Asia/Tokyo\", \"Europe/London\")."
      ),
  },
  async ({ source_timezone, time, target_timezone }) => {
    try {
      validateTimezone(source_timezone);
      validateTimezone(target_timezone);

      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) {
        throw new Error("Invalid time format. Expected HH:MM (24-hour).");
      }
      const [, hourStr, minStr] = match;
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      if (hour > 23 || minute > 59) {
        throw new Error("Invalid time value. Hours 0-23, minutes 0-59.");
      }

      const now = new Date();
      const sourceResult = getTimeResult(now, source_timezone);
      const [y, m, d] = sourceResult.date.split("-").map(Number);

      const sourceDate = new Date(
        Date.UTC(y, m - 1, d, hour, minute, 0)
      );
      const sourceOffsetMin = -getOffsetMinutes(sourceDate, source_timezone);
      sourceDate.setMinutes(sourceDate.getMinutes() - sourceOffsetMin);

      const result: ConversionResult = {
        source: getTimeResult(sourceDate, source_timezone),
        target: getTimeResult(sourceDate, target_timezone),
        time_difference: computeTimeDifference(sourceDate, source_timezone, target_timezone),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`mcp-time server running (default tz: ${DEFAULT_TIMEZONE})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
