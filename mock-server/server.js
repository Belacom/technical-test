import fs from 'fs';
import path from 'path';
import express from 'express';
import yaml from 'js-yaml';
import { apiReference } from '@scalar/express-api-reference';
import { fileURLToPath } from 'url';

import campaigns from './data/campaigns.js';

const SPEC_RELATIVE_PATH = '../ActiveCampaign-API-v3.yml';
export const DEFAULT_TOKEN = 'mock-api-token';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateSpecHasCampaignPath = (spec) => {
  const campaignsPath = spec?.paths?.['/api/3/campaigns'];
  if (!campaignsPath || !campaignsPath.get) {
    throw new Error('The supplied OpenAPI specification does not declare GET /api/3/campaigns.');
  }
};

const parseISODate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toCampaignData = (campaign) => campaign ?? null;

const parseSortDirection = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).toLowerCase();
  if (normalized === 'asc' || normalized === 'ascending') {
    return 1;
  }
  if (normalized === 'desc' || normalized === 'descending') {
    return -1;
  }
  return null;
};

const sortByDate = (items, key, direction) => {
  if (!key || !direction) {
    return items;
  }

  return [...items].sort((a, b) => {
    const left = parseISODate(a[key]);
    const right = parseISODate(b[key]);

    if (!left && !right) {
      return 0;
    }
    if (!left) {
      return 1;
    }
    if (!right) {
      return -1;
    }
    const diff = left.getTime() - right.getTime();
    return direction === 1 ? diff : -diff;
  });
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const parseLimit = (value) => {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
};

const parseOffset = (value) => {
  if (value === undefined) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
};

export function createServer({ apiToken = DEFAULT_TOKEN, now = () => new Date() } = {}) {
  const specPath = path.resolve(__dirname, SPEC_RELATIVE_PATH);
  const fileContents = fs.readFileSync(specPath, 'utf8');
  const specDocument = yaml.load(fileContents);
  validateSpecHasCampaignPath(specDocument);
  const specJson = JSON.stringify(specDocument, null, 2);

  const app = express();
  app.set('json spaces', 2);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: now().toISOString() });
  });

  app.get('/openapi.json', (_req, res) => {
    res.type('application/json').send(specJson);
  });

  app.use('/api/3', (req, res, next) => {
    const token = req.header('Api-Token');
    if (!token) {
      return res.status(401).json({ message: 'Missing Api-Token header' });
    }

    if (token !== apiToken) {
      return res.status(403).json({ message: 'Invalid Api-Token value' });
    }

    next();
  });

  const scalarMiddleware = apiReference({
    spec: {
      content: specJson,
      format: 'json',
    },
    theme: 'default',
    layout: 'sidebar',
  });
  app.use('/openapi', scalarMiddleware);

  app.get('/api/3/campaigns', (req, res) => {
    const orderBySend = req.query['orders[sdate]'];
    const orderByLastSend = req.query['orders[ldate]'];
    const automationFilter = req.query['filters[automation]'];

    let results = campaigns.map(toCampaignData).filter(Boolean);

    if (automationFilter !== undefined) {
      const normalized = String(automationFilter).toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        results = results.filter((campaign) => campaign.type === 'automation');
      } else if (normalized === 'false' || normalized === '0') {
        results = results.filter((campaign) => campaign.type !== 'automation');
      }
    }

    const direction = parseSortDirection(orderBySend || orderByLastSend);
    const sortKey = orderBySend ? 'sdate' : orderByLastSend ? 'ldate' : null;
    results = sortByDate(results, sortKey, direction);
    const sortLabel = sortKey
      ? direction === -1
        ? `${sortKey}:desc`
        : direction === 1
          ? `${sortKey}:asc`
          : sortKey
      : null;

    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);
    const paginated = results.slice(offset, offset + limit);

    res.json({
      campaigns: paginated,
      meta: {
        total: String(results.length),
        page_input: {
          limit,
          offset,
          ...(sortLabel ? { sort: sortLabel } : {}),
        },
      },
    });
  });

  app.get('/api/3/campaigns/:campaignID', (req, res) => {
    const id = Number.parseInt(req.params.campaignID, 10);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ campaign: toCampaignData(campaign) });
  });

  app.use('/api/3', (_req, res) => {
    res.status(501).json({ message: 'Not implemented' });
  });

  return app;
}
