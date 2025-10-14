#!/usr/bin/env node
import http from 'http';

import { createServer, DEFAULT_TOKEN } from './server.js';

const port = Number.parseInt(process.env.PORT ?? '3100', 10);
const apiToken = process.env.MOCK_API_TOKEN ?? DEFAULT_TOKEN;

const app = createServer({ apiToken });

const server = http.createServer(app);

server.listen(port, () => {
  const baseUrl = `http://localhost:${port}`;
  console.log('[mock-server] ActiveCampaign mock server running');
  console.log(`[mock-server] Base URL: ${baseUrl}`);
  console.log(`[mock-server] Health check: ${baseUrl}/health`);
  console.log(`[mock-server] OpenAPI explorer: ${baseUrl}/openapi`);
  console.log(`[mock-server] Expected Api-Token header: ${apiToken}`);
});
