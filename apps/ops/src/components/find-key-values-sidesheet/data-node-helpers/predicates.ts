import {
    DataNode,
    DataSection,
    FieldType,
    DataField,
    DataGroup,
} from '../types';

export function isDataSection(node: DataNode): node is DataSection {
    return node.type === FieldType.section;
}
export function isDataSectionOrField(
    node: DataNode
): node is DataSection | DataField {
    return node.type === FieldType.section || node.type === FieldType.field;
}
export function isDataField(node: DataNode): node is DataField {
    return node.type === FieldType.field;
}
export function isDataGroup(node: DataNode): node is DataGroup {
    return node.type === FieldType.group;
}
