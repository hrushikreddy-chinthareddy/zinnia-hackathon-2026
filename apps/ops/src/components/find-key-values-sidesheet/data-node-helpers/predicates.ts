import {
    DataNode,
    DataSection,
    FieldType,
    DataField,
    DataGroup,
    Primitive,
} from '../types';

export function isDataSection(node: DataNode): node is DataSection {
    return node.type === FieldType.section;
}
export function isDataField(node: DataNode): node is DataField {
    return node.type === FieldType.field;
}
export function isDataGroup(node: DataNode): node is DataGroup {
    return node.type === FieldType.group;
}
export function isDataSectionOrField(
    node: DataNode
): node is DataSection | DataField {
    return node.type === FieldType.section || node.type === FieldType.field;
}
export function isDataSectionOrGroup(
    node: DataNode
): node is DataSection | DataGroup {
    return node.type === FieldType.section || node.type === FieldType.group;
}
export const isPrimitive = (v: any): v is Primitive => {
    return (
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    );
};
export const isUnknownArray = (v: unknown): v is unknown[] => Array.isArray(v);
export const isNonNullishObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v != null;
export const isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v !== ''; // TODO: more specific TS type
