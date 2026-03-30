import {
    DEFAULT_FIELD_REGISTRY,
    getFieldGroups,
} from '@deps/lib/transaction-builder/field-registry';
import type { FieldDefinition } from '@deps/lib/transaction-builder/types';

import type { NextApiRequest, NextApiResponse } from 'next';

export interface FieldsResponse {
    groups: string[];
    fields: FieldDefinition[];
    byGroup: Record<string, FieldDefinition[]>;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<FieldsResponse>
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end();
        return;
    }

    const groups = getFieldGroups(DEFAULT_FIELD_REGISTRY);
    const fields = Object.values(DEFAULT_FIELD_REGISTRY);
    const byGroup: Record<string, FieldDefinition[]> = {};
    for (const group of groups) {
        byGroup[group] = fields.filter((f) => f.group === group);
    }

    return res.status(200).json({ groups, fields, byGroup });
}
