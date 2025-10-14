# Repository Guidelines

## Project Structure & Module Organization
- `src/report.js` holds the core batch report implementation; add helpers nearby and keep exports explicit for Vitest to mock.
- `__tests__/report.test.js` is the canonical test entry point; mirror its structure when adding new scenarios.
- `mock-server/` contains `server.js` plus `data/campaigns.js` for seeded responses; rely on HTTP calls instead of importing fixtures directly.
- `output/` is reserved for generated CSV files; keep artifacts out of version control.
- `ActiveCampaign-API-v3.yml` documents the upstream contract if you need to confirm field names or response shapes.

## Build, Test, and Development Commands
- `npm install` sets up dependencies; run after switching branches or pulling updates (Node.js 18+ required).
- `npm run mock:server` boots the local API at `http://localhost:3100` (token `mock-api-token`); use `npm run mock:server:watch` while iterating.
- `npm test` executes the Vitest suite once; `npm run test:watch` keeps tests hot-reloaded during development.

## Coding Style & Naming Conventions
- Stick to modern ESM (`import`/`export`), 2-space indentation, and terminate statements with semicolons like the existing files.
- Prefer `const`/`let` over `var`, descriptive camelCase for variables, and uppercase snake case for shared constants (e.g., `DEFAULT_OUTPUT_PATH`).
- Keep modules small and pure; extract reusable HTTP or CSV helpers but expose them via explicit named exports.

## Testing Guidelines
- Use Vitest with descriptive `describe`/`it` blocks; new specs belong in `__tests__/` and should mirror `*.test.js` naming.
- Stub timers and file I/O via `vi` helpers, as shown in `report.test.js`, to keep tests deterministic.
- Cover the happy path and failure modes (network errors, invalid tokens) before sending a PR.

## Commit & Pull Request Guidelines
- Follow the existing history by writing imperative, concise subject lines (e.g., `Add CLI runner for batch export`).
- Reference related issues in the body, note key design decisions, and list the exact commands used for validation.
- PRs should summarize behaviour changes, attach relevant CSV samples if output shifts, and call out updated docs such as `SOLUTION.md`.

## Security & Configuration Tips
- Keep API tokens in environment variables; the mock server expects `Api-Token: mock-api-token`, while production keys must never be committed.
- Default configuration lives in `mock-server/server.js`; adjust ports or dataset paths through parameters instead of hard-coding new constants.
