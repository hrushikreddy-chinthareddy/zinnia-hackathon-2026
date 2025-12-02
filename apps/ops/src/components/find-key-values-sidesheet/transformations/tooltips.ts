import { TFunction } from 'next-i18next';

import { formatToolTip } from './formatters';
import { transformObject } from '../data-node-helpers/mutations';
import { isNotNullish } from '../data-node-helpers/predicates';
import { DataNode, DocumentFormatType, DocumentFormat } from '../types';

export const addToolTips = (
    data: DataNode[],
    t: TFunction,
    type?: DocumentFormatType
) => {
    const nomenclature =
        type === DocumentFormat.transaction ? 'transaction' : 'policy';
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                formatToolTip({
                    t,
                    nomenclature,
                })
            )
        )
        .filter(isNotNullish);
};
