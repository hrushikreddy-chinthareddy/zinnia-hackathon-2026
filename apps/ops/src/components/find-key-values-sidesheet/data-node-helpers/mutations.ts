import { TFunction } from 'next-i18next';

import { typedEntries } from '@deps/utils/objects';

import { formatAsDataValue } from '../formatters';
import { sectionTypeToSubSectionTitleFields } from '../translations/subsection-field-to-title';
import { DataNode, FieldType, DataSection } from '../types';
import {
    isNonNullishObject,
    isPrimitive,
    isUnknownArray,
    isNonEmptyString,
    isNotNullish,
} from './predicates';

export function spruceFromSourceData(obj: unknown, t: TFunction): DataNode[] {
    if (!isNonNullishObject(obj)) return [];

    return typedEntries(obj)
        .map(([key, value]) => convertTuple(key, value, t))
        .filter(isNotNullish);
}
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

export const transformObject = (
    node: DataNode,
    transform: (node: DataNode) => DataNode | null
): DataNode | null => {
    switch (node.type) {
        case FieldType.field:
            return transform(node);
        case FieldType.section: {
            const newChildren = node.children
                .map((child) => transformObject(child, transform))
                .filter(isNotNullish);

            return transform({
                ...node,
                children: newChildren,
            });
        }
        case FieldType.group: {
            const newGroups = node.children.map((group) =>
                group
                    .map((child) => transformObject(child, transform))
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

// pipe needs to take the first arg as Policy/Transaction -> DataNode[]
// and the rest as DataNode[] -> DataNode[]
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
