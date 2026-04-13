# datetime-mcp

[![CI](https://github.com/Eyalm321/datetime-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Eyalm321/datetime-mcp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/mcp-datetime-tools)](https://www.npmjs.com/package/mcp-datetime-tools)
[![GitHub Package](https://img.shields.io/github/v/release/Eyalm321/datetime-mcp?label=github%20package)](https://github.com/Eyalm321/datetime-mcp/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides datetime awareness — current time, timezone conversions, and an always-on time resource.

## Quick Start

### Option 1: npx (recommended)

No installation needed. Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["mcp-datetime-tools"],
      "env": {
        "MCP_TIME_TIMEZONE": "America/New_York"
      }
    }
  }
}
```

> Also available as `@eyalm321/datetime-mcp` on [GitHub Packages](https://github.com/Eyalm321/datetime-mcp/packages).

### Option 2: Local install

```bash
git clone https://github.com/Eyalm321/datetime-mcp.git
cd datetime-mcp
npm install
npm run build
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "node",
      "args": ["/absolute/path/to/datetime-mcp/dist/index.js"],
      "env": {
        "MCP_TIME_TIMEZONE": "America/New_York"
      }
    }
  }
}
```

### Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `MCP_TIME_TIMEZONE` | `America/New_York` | Default IANA timezone for all operations |

---

## Tools

### `get_current_time`

Get the current date and time in any IANA timezone.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `timezone` | string | `MCP_TIME_TIMEZONE` | IANA timezone (e.g. `America/New_York`, `Asia/Tokyo`) |

**Example response:**

```json
{
  "timezone": "America/New_York",
  "datetime": "2024-06-15T08:30:00",
  "date": "2024-06-15",
  "time": "08:30:00",
  "day_of_week": "Saturday",
  "is_dst": true,
  "utc_offset": "GMT-04:00"
}
```

### `convert_time`

Convert a time from one timezone to another.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `source_timezone` | string | `MCP_TIME_TIMEZONE` | Source IANA timezone |
| `time` | string | *(required)* | Time in 24-hour `HH:MM` format |
| `target_timezone` | string | *(required)* | Target IANA timezone |

**Example response:**

```json
{
  "source": {
    "timezone": "America/New_York",
    "datetime": "2024-06-15T14:30:00",
    "time": "14:30:00",
    "day_of_week": "Saturday",
    "is_dst": true,
    "utc_offset": "GMT-04:00"
  },
  "target": {
    "timezone": "Asia/Tokyo",
    "datetime": "2024-06-16T03:30:00",
    "time": "03:30:00",
    "day_of_week": "Sunday",
    "is_dst": false,
    "utc_offset": "GMT+09:00"
  },
  "time_difference": "+13.0h"
}
```

## Resources

### `time://current`

Always-on resource providing the current date and time. Subscribe to this resource for continuous datetime awareness in your context.

---

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
