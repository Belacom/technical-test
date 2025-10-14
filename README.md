# ActiveCampaign Batch Report – Technical Test

This repository contains everything a candidate needs to complete the assignment.
The goal is to connect to a mock ActiveCampaign API, collect batch (campaign)
stats for the last four weeks, and export them to a CSV file.

## Prerequisites

- Node.js 22 or newer
- npm

Install project dependencies with:

```bash
npm install
```

## Available scripts

**Start the mock API server**

```bash
npm run mock:server
```

The server uses the official [`ActiveCampaign API v3`](ActiveCampaign%20API%20v3.yaml)
OpenAPI specification as the starting point, serves a subset of endpoints, and
stores a small in-memory dataset with recent campaigns. By default the server is
available at `http://localhost:3100` and expects the header `Api-Token: mock-api-token`.
An interactive Scalar-powered explorer is served at `http://localhost:3100/openapi`.

**Run your solution**

```bash
npm run start
```

If you want to run your solution in watch mode (e.g. during development), use:

```bash
npm run watch
```

## Your objectives

1. Implement `generateBatchReport` in `src/report.js`.
   - Connect to the mock API over HTTP. Do **not** import the dataset directly.
   - Collect the statistics for every campaign that was sent during the last
     four weeks (28 days) relative to the current date.
   - Produce a CSV file that includes at least the following columns per row:
     `campaignId`, `campaignName`, `sendDate`, `emailsSent`, `totalOpens`,
     `totalClicks`, `totalBounces`, `totalUnsubscribes`.
   - The CSV must contain a header row.
2. Write the CSV file to the SFTP path provided.
3. Document how to execute your solution in `SOLUTION.md`.

You are encouraged to structure the project as you see fit (e.g. extracting
helpers or using additional dependencies).

### Acceptance criteria

- Only campaigns whose `ldate` is within the last 4 weeks from the 15th of October 2025 appear in the CSV.
- All required columns are present and use the same names as above.
- The file is written to the provided SFTP path.

## Mock data reference

The mock API currently exposes the following endpoints:

- `GET /health` – basic health check.
- `GET /api/3/campaigns` – list of campaigns with metadata and stats.
- `GET /api/3/campaigns/{campaignID}` – campaign details.

The response structure follows the ActiveCampaign API specification.

You can find the OpenAPI specification at <https://localhost:3100/openapi>
when the mock server is running.

The in-memory dataset is located at `mock-server/data/campaigns.js`.

## What we expect from a submission

- Clear code.
- Instructions that make it easy to understand and run your solution.
- Clean git history.

Good luck!
