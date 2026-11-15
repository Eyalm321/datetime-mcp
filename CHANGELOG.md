# Changelog

## 1.0.2 (unreleased)

No tool or API changes. Same Node support. The server now reports its real version (it said 1.0.0).

### Security and dependencies
- `@modelcontextprotocol/sdk` 1.12 → 1.32.2, `zod` 3 → 4.6.7 (internal dependency; the tests pass unchanged).
- `npm audit --omit=dev`: 0 critical, 0 high (3 moderate, not reachable: they are in the SDK's HTTP transport, which this stdio server never loads). Dev-only findings in the older vitest remain, fixed by the vitest 5 follow-up.
- Every dependency version is at least 14 days old (#1).

### Maintenance
- Dependabot with a 14-day cooldown (#1).
- npm publishing uses trusted publishing (OIDC). Workflow actions are pinned to commit SHAs (#2).

## Earlier versions

See the [GitHub releases](https://github.com/Eyalm321/datetime-mcp/releases).
