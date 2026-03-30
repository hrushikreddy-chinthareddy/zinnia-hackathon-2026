import fs from 'fs';
import path from 'path';

import { DEFAULT_FIELD_REGISTRY } from '@deps/lib/transaction-builder/field-registry';
import { composeSchema } from '@deps/lib/transaction-builder/schema-composer';
import type {
    ComposedSchema,
    PersonaType,
    TransactionDefinition,
} from '@deps/lib/transaction-builder/types';

import type { NextApiRequest, NextApiResponse } from 'next';

const DEFINITIONS_PATH = path.join(
    process.cwd(),
    'src',
    'data',
    'transaction-builder',
    'definitions.json'
);

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ComposedSchema | { error: string }>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed` });
    }

    const { transactionId, persona, carrierId } = req.body as {
        transactionId: string;
        persona: PersonaType;
        carrierId?: string;
    };

    if (!transactionId || !persona) {
        return res
            .status(400)
            .json({ error: 'transactionId and persona are required' });
    }

    const raw = fs.readFileSync(DEFINITIONS_PATH, 'utf-8');
    const definitions = JSON.parse(raw) as Record<
        string,
        TransactionDefinition
    >;
    const def = definitions[transactionId];

    if (!def) {
        return res
            .status(404)
            .json({ error: `Transaction '${transactionId}' not found` });
    }

    const schema = composeSchema(
        def,
        DEFAULT_FIELD_REGISTRY,
        persona,
        carrierId ?? null
    );

    return res.status(200).json(schema);
}
