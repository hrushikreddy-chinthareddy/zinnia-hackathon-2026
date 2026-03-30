import fs from 'fs';
import path from 'path';

import type { TransactionDefinition } from '@deps/lib/transaction-builder/types';

import type { NextApiRequest, NextApiResponse } from 'next';

const DEFINITIONS_PATH = path.join(
    process.cwd(),
    'src',
    'data',
    'transaction-builder',
    'definitions.json'
);

function readDefinitions(): Record<string, TransactionDefinition> {
    const raw = fs.readFileSync(DEFINITIONS_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, TransactionDefinition>;
}

function writeDefinitions(data: Record<string, TransactionDefinition>): void {
    fs.writeFileSync(DEFINITIONS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };
    const definitions = readDefinitions();

    if (req.method === 'GET') {
        const def = definitions[id];
        if (!def)
            return res
                .status(404)
                .json({ error: `Transaction '${id}' not found` });
        return res.status(200).json(def);
    }

    if (req.method === 'PUT') {
        const body = req.body as TransactionDefinition;
        if (!definitions[id]) {
            return res
                .status(404)
                .json({ error: `Transaction '${id}' not found` });
        }
        const updated: TransactionDefinition = {
            ...definitions[id],
            ...body,
            id, // prevent ID mutation
            createdAt: definitions[id]?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        definitions[id] = updated;
        writeDefinitions(definitions);
        return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
        if (!definitions[id]) {
            return res
                .status(404)
                .json({ error: `Transaction '${id}' not found` });
        }
        delete definitions[id];
        writeDefinitions(definitions);
        return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
