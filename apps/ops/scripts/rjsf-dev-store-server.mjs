/**
 * Ephemeral in-memory store for AI-generated Full RJSF payloads (local dev only).
 * Data is lost when this process exits.
 *
 * Usage: pnpm run rjsf-dev-store
 * Default URL: http://127.0.0.1:3847
 *
 * Point the app at it with NEXT_PUBLIC_RJSF_DEV_STORE_URL=http://127.0.0.1:3847
 */
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.RJSF_DEV_STORE_PORT || 3847);
const HOST = process.env.RJSF_DEV_STORE_HOST || '127.0.0.1';

/** @type {Map<string, { output: unknown; createdAt: string; peopleSlug: string; label: string }>} */
const store = new Map();

function sanitizeToAiTransactionSlugSegment(raw) {
    const cleaned = String(raw)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
    return cleaned.length > 0 ? cleaned : 'transaction';
}

function peopleSlugFromOutput(output) {
    const o = output && typeof output === 'object' ? output : {};
    const base =
        o.processSubType || o.taskType || o.formId || 'transaction';
    return `ai_${sanitizeToAiTransactionSlugSegment(String(base))}`;
}

function labelFromOutput(output) {
    const o = output && typeof output === 'object' ? output : {};
    const base =
        o.processSubType || o.taskType || o.formId || 'transaction';
    return String(base);
}

function sendJson(res, status, body) {
    const data = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(data);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                if (!raw.trim()) {
                    resolve(null);
                    return;
                }
                resolve(JSON.parse(raw));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${HOST}`);

    try {
        if (req.method === 'GET' && url.pathname === '/schemas') {
            const items = [...store.entries()]
                .map(([id, meta]) => ({
                    id,
                    peopleSlug: meta.peopleSlug,
                    label: meta.label,
                    createdAt: meta.createdAt,
                }))
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
            return sendJson(res, 200, { items });
        }

        if (req.method === 'GET' && url.pathname.startsWith('/schemas/')) {
            const id = decodeURIComponent(url.pathname.slice('/schemas/'.length));
            const row = store.get(id);
            if (!row) {
                return sendJson(res, 404, { error: 'Not found' });
            }
            return sendJson(res, 200, {
                id,
                peopleSlug: row.peopleSlug,
                fullRjsfOutput: row.output,
            });
        }

        if (req.method === 'POST' && url.pathname === '/schemas') {
            const body = await readBody(req);
            const output =
                body &&
                typeof body === 'object' &&
                body.fullRjsfOutput !== undefined
                    ? body.fullRjsfOutput
                    : body;
            if (output == null || typeof output !== 'object') {
                return sendJson(res, 400, {
                    error: 'Expected JSON body with fullRjsfOutput',
                });
            }
            const id = `ai_${randomUUID()}`;
            const peopleSlug = peopleSlugFromOutput(output);
            const label = labelFromOutput(output);
            const createdAt = new Date().toISOString();
            store.set(id, { output, createdAt, peopleSlug, label });
            return sendJson(res, 201, { id, peopleSlug, label, createdAt });
        }

        return sendJson(res, 404, { error: 'Not found' });
    } catch (e) {
        return sendJson(res, 500, {
            error: e instanceof Error ? e.message : 'Server error',
        });
    }
});

server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
        `[rjsf-dev-store] listening on http://${HOST}:${PORT} (${store.size} schemas in memory)`
    );
    // eslint-disable-next-line no-console
    console.log(
        '[rjsf-dev-store] Set NEXT_PUBLIC_RJSF_DEV_STORE_URL to this URL in apps/ops/.env.development.local'
    );
});
