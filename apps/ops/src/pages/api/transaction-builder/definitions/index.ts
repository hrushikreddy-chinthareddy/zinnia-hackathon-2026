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
    if (req.method === 'GET') {
        const definitions = readDefinitions();
        return res.status(200).json(Object.values(definitions));
    }

    if (req.method === 'POST') {
        const body = req.body as TransactionDefinition;
        if (!body?.id || !body?.label) {
            return res.status(400).json({ error: 'id and label are required' });
        }

        const definitions = readDefinitions();
        if (definitions[body.id]) {
            return res
                .status(409)
                .json({ error: `Transaction '${body.id}' already exists` });
        }

        const now = new Date().toISOString();
        const newDef: TransactionDefinition = {
            ...body,
            createdAt: now,
            updatedAt: now,
        };

        definitions[body.id] = newDef;
        writeDefinitions(definitions);
        return res.status(201).json(newDef);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
