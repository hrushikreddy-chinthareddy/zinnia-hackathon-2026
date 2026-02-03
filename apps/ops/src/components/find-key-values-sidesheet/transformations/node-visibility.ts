import { Product, ProductType } from '@zinnia/api-types/types/sor';

import { transformNodes } from '../data-node-helpers/mutations';
import {
    isDataField,
    isDataGroup,
    isDataSection,
    isDataSectionOrField,
    isNotNullish,
} from '../data-node-helpers/predicates';
import { sectionVisibility } from '../translations/carrier-rules';
import {
    ExcludeFieldsUseCase,
    getExcludeFields,
} from '../translations/exclude-fields';
import { DataNode, FieldType } from '../types';

/**
 * Filters nodes based on exclude fields from exclude-fields config.
 *
 * @param node - node to filter
 * @param useCase - the use case for field visibility (defaults to 'default')
 * @returns filtered node or undefined if excluded
 */
export const excludeNodeByLabel = ({
    node,
    useCase = 'default',
}: {
    node: DataNode;
    useCase?: ExcludeFieldsUseCase;
}): DataNode | undefined => {
    const excludeFields = getExcludeFields(useCase);
    if (isDataSectionOrField(node) && excludeFields.has(node.label)) {
        return undefined;
    }
    return node;
};

/**
 * Filters a single node based on carrier rules
 *
 * @param node - node to filter
 * @param lineOfBusiness - line of business
 * @param productType - product type
 * @param planCode - plan code
 * @returns filtered node
 */
export const excludeNodeByCarrierRules = ({
    node,
    lineOfBusiness,
    productType,
    planCode,
}: {
    node: DataNode;
    lineOfBusiness?: Product.lineOfBusiness;
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

    return transformNodes({
        nodes,
        transforms: (node: DataNode) => {
            // If it's a field, check if it matches the search string
            if (isDataField(node)) {
                const match =
                    node.label.toLowerCase().includes(lower) ||
                    node.value.toLowerCase().includes(lower);
                return match ? node : undefined;
            }

            // If it's a section, check if it's empty
            if (isDataSection(node)) {
                const filteredChildren = node.children.filter(isNotNullish);

                if (filteredChildren.length > 0) {
                    return {
                        ...node,
                        children: filteredChildren,
                    };
                }
                return undefined;
            }

            // If it's a group, check if it's empty
            if (isDataGroup(node)) {
                const filteredGroups = node.children.filter(
                    (group) => group.length > 0
                );

                if (filteredGroups.length > 0) {
                    return {
                        ...node,
                        children: filteredGroups,
                    };
                }
                return undefined;
            }

            // Otherwise, return the node as-is
            return node;
        },
    });
}
