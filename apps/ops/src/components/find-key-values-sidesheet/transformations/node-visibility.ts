import { LineOfBusiness, ProductType } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { combinedTransform } from './formatters';
import { transformNodes } from '../data-node-helpers/mutations';
import { isNotNullish } from '../data-node-helpers/predicates';
import { sectionVisibility } from '../translations/carrier-rules';
import { excludeFields } from '../translations/exclude-fields';
import { DataNode, FieldType } from '../types';

export const excludeNodesByLabel = (
    nodes: DataNode[],
    t: TFunction,
    policyNomenclature?: string
) => {
    return transformNodes(
        nodes,
        combinedTransform({
            t,
            exclude: Array.from(excludeFields),
            policyNomenclature,
        })
    );
};

export const excludeNodesByCarrierRules = ({
    nodes,
    lineOfBusiness,
    productType,
    planCode,
}: {
    nodes: DataNode[];
    lineOfBusiness?: LineOfBusiness;
    productType?: ProductType;
    planCode?: string;
}) => {
    return transformNodes(nodes, (node: DataNode) =>
        isNodeVisibileByCarrierRules({
            node,
            lineOfBusiness,
            productType,
            planCode,
        })
    );
};

export const isNodeVisibileByCarrierRules = ({
    node,
    lineOfBusiness,
    productType,
    planCode,
}: {
    node: DataNode;
    lineOfBusiness?: LineOfBusiness;
    productType?: ProductType;
    planCode?: string;
}) => {
    if (node.type === FieldType.section || node.type === FieldType.field) {
        const sectionRule = sectionVisibility[node.label];
        return !sectionRule ||
            (lineOfBusiness && sectionRule.has(lineOfBusiness)) ||
            (productType && sectionRule.has(productType)) ||
            (planCode && sectionRule.has(planCode))
            ? node
            : undefined;
    }
    return node;
};
/**
 * Filters nodes based on user-defined search string
 *
 * @param nodes - nodes to filter
 * @param search - search string
 * @returns filtered nodes
 */

export function searchNodes(nodes: DataNode[], search: string): DataNode[] {
    // should only filter on fields, still highlight section labels
    // if there are no fields in section | group, remove the section / group
    const lower = search.toLowerCase();

    const filterNode = (node: DataNode): DataNode | undefined => {
        if (node.type === FieldType.field) {
            const match =
                node.label.toLowerCase().includes(lower) ||
                node.value.toLowerCase().includes(lower);
            return match ? node : undefined;
        }

        if (node.type === FieldType.section) {
            const filteredChildren = node.children
                .map(filterNode)
                .filter(isNotNullish);

            if (filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren,
                };
            }
            return undefined;
        }

        if (node.type === FieldType.group) {
            const filteredGroups = node.children
                .map((group) => group.map(filterNode).filter(isNotNullish))
                .filter((subGroup) => subGroup.length > 0);

            if (filteredGroups.length > 0) {
                return {
                    ...node,
                    children: filteredGroups,
                };
            }
        }
        return undefined;
    };

    return nodes.map(filterNode).filter(isNotNullish);
}
