import { TFunction } from 'next-i18next';

import { typedEntries } from '@deps/utils/objects';

import { formatAsDataValue } from '../transformations/formatters';
import { sectionTypeToSubSectionTitleFields } from '../translations/subsection-field-to-title';
import { DataNode, FieldType, DataSection, TransformFunction } from '../types';
import {
    isNonNullishObject,
    isPrimitive,
    isUnknownArray,
    isNonEmptyString,
    isNotNullish,
} from './predicates';

/**
 * Converts an arbitrary source data object to a Spruce tree
 * Spruce data trees will categorize everything into 3 node types:
 * - DataField - a simple key-value pair
 * - DataSection - a named (and optionally tagged) collection of nested Spruce nodes
 * - DataGroup - an unnamed collection of subgroups of Spruce nodes
 *
 * @param obj - the source data object
 * @param t - the translation function
 * @returns the data node
 */
export function spruceFromSourceData(obj: unknown, t: TFunction): DataNode[] {
    if (!isNonNullishObject(obj)) return [];

    return typedEntries(obj)
        .map(([key, value]) => convertTuple(key, value, t))
        .filter(isNotNullish);
}

/**
 * Converts a tuple of key-value pairs to a Spruce node
 *
 * @param key - the key of the tuple
 * @param value - the value of the tuple
 * @param t - the translation function
 * @returns the data node
 */
function convertTuple(
    key: string,
    value: unknown,
    t: TFunction
): DataNode | undefined {
    // Skip nullish values
    if (value === null || value === '') return;

    // Primitive → Field
    if (isPrimitive(value)) {
        return {
            type: FieldType.field,
            label: key,
            value: String(value),
        };
    }

    // Array → Section -> subsection-field-to-title.ts
    if (isUnknownArray(value)) {
        const sectionLabelFieldName = sectionTypeToSubSectionTitleFields[key];
        if (sectionLabelFieldName) {
            const sections: DataSection[] = value
                .map((item): DataSection | undefined => {
                    //object within each array item
                    if (!isNonNullishObject(item)) return;
                    const sectionLabel = item[sectionLabelFieldName];
                    if (!isNonEmptyString(sectionLabel)) return; // TODO: maybe skip, maybe provide default label?

                    // TODO: filter out fields that are not visible, including the title field
                    const fields: DataNode[] = spruceFromSourceData(item, t);

                    return {
                        type: FieldType.section,
                        label: formatAsDataValue({
                            fieldData: sectionLabel,
                            t,
                        }),
                        children: fields, // TODO: recurse?
                    };
                })
                .filter(isNotNullish);

            return {
                type: FieldType.section,
                label: key,
                children: sections,
            };
        } else {
            // value is list of groups
            const groups: DataNode[][] = value.map((item) =>
                spruceFromSourceData(item, t)
            );
            if (groups.length === 0) return;

            return {
                type: FieldType.section,
                label: key,
                children: [
                    // In some instances the array will also contain fields and sections
                    {
                        type: FieldType.group,
                        children: groups,
                    },
                ],
            };
        }
    }

    // Object → Section
    if (typeof value === 'object' && !Array.isArray(value)) {
        const children = spruceFromSourceData(value, t);

        if (children.length === 0) return;

        return {
            type: FieldType.section,
            label: key,
            children,
        };
    }

    return;
}
/**
 * Recursively transforms an array of nodes
 *
 * @param nodes - the nodes to transform
 * @param transform - the transform function
 * @returns the transformed nodes
 */
export const transformNodes = ({
    nodes,
    transforms,
}: {
    nodes: DataNode[];
    transforms: TransformFunction | TransformFunction[];
}): DataNode[] => {
    if (!Array.isArray(transforms)) {
        transforms = [transforms];
    }
    return nodes
        .map((node) => {
            const ret = transforms.reduce<DataNode | undefined>(
                (acc, transform) => {
                    return acc ? transformNode(acc, transform) : undefined;
                },
                node
            );
            return ret;
        })
        .filter(isNotNullish);
};

/**
 * Recursively transforms a single node
 *
 * @param node - the node to transform
 * @param transform - the transform function
 * @returns the transformed node
 */
export const transformNode = (
    node: DataNode,
    transform: (node: DataNode) => DataNode | undefined
): DataNode | undefined => {
    switch (node.type) {
        case FieldType.field:
            return transform(node);
        case FieldType.section: {
            const newChildren = node.children
                .map((child) => transformNode(child, transform))
                .filter(isNotNullish);

            return transform({
                ...node,
                children: newChildren,
            });
        }
        case FieldType.group: {
            const newGroups = node.children.map((group) =>
                group
                    .map((subGroup) => transformNode(subGroup, transform))
                    .filter(isNotNullish)
            );
            return transform({
                ...node,
                children: newGroups,
            });
        }
        default:
            return transform(node);
    }
};

/**
 * Applies a series of transformations to a data node
 *
 * @param initialTransformFn - the initial transform function
 * @param fns - the array of transform functions
 * @returns the transformed data node
 */
export const applyTransformationsToNodes =
    <T>(
        initialTransformFn: (data: T, t?: TFunction) => DataNode[],
        ...fns: Array<(data: DataNode[], t?: TFunction) => DataNode[]>
    ) =>
    (initialValue: T) => {
        const initialTransformedData = initialTransformFn(initialValue);
        const v = fns.reduce((acc, fn) => {
            const ret = fn(acc);
            return ret;
        }, initialTransformedData);
        return v;
    };
