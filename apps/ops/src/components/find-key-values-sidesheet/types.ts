import { Collapse, Expand } from '@deps/hooks/useTreeState';

export type ExpandCollapse = typeof Expand | typeof Collapse;

export interface FindAllKeyValuesSidebarProps {
    planCode: string;
    policyNumber: string;
    container?: any;
    handleCalendarOpen?: (isOpen: boolean) => void;
}

export type Primitive = string | number | boolean;

const FIELD = Symbol('FIELD');
const SECTION = Symbol('SECTION');
const GROUP = Symbol('GROUP');

export const FieldType = {
    field: FIELD,
    section: SECTION,
    group: GROUP,
} as const;

const POLICY = Symbol('POLICY');
const CONTRACT = Symbol('CONTRACT');
const TRANSACTION = Symbol('TRANSACTION');

export const DocumentFormat = {
    policy: POLICY,
    contract: CONTRACT,
    transaction: TRANSACTION,
} as const;

export type DocumentFormatType =
    (typeof DocumentFormat)[keyof typeof DocumentFormat];

export type CustomSectionGroups = [string, string[]];

export type DataField = {
    type: typeof FieldType.field;
    label: string;
    value: string;
    link?: string;
    toolTip?: string;
};

export type DataSection = {
    type: typeof FieldType.section;
    label: string;
    children: DataNode[];
    tags?: string[];
};

export type DataGroup = {
    type: typeof FieldType.group;
    children: DataNode[][]; // arrays of arrays (groups) of nodes
};

export type DataNode = DataField | DataSection | DataGroup;
