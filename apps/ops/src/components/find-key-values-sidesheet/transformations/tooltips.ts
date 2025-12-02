import { TFunction } from 'next-i18next';

import { formatToolTip } from './formatters';
import { transformNodes } from '../data-node-helpers/mutations';
import { DataNode, DocumentFormatType, DocumentFormat } from '../types';

export const addToolTips = (
    nodes: DataNode[],
    t: TFunction,
    type?: DocumentFormatType
) => {
    const nomenclature =
        type === DocumentFormat.transaction ? 'transaction' : 'policy';
    return transformNodes(
        nodes,
        formatToolTip({
            t,
            nomenclature,
        })
    );
};
