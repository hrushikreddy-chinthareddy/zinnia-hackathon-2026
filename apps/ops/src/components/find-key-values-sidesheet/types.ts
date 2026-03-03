import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Collapse, Expand } from '@deps/hooks/useTreeState';
import { PolicyFeature, Rider } from '@zinnia/api-types/types/sor';

export type ExpandCollapse = typeof Expand | typeof Collapse;

export interface FindAllKeyValuesSidebarProps {
    planCode: string;
    policyNumber: string;
    container?: any;
    handleCalendarOpen?: (isOpen: boolean) => void;
}

export interface RiderSidesheetProps {
    policyDetails: PolicyDetails;
    rider: Rider | null;
}

export interface FeatureSidesheetProps {
    policyDetails: PolicyDetails;
    feature: PolicyFeature | null;
}

export type Primitive = string | number | boolean;

export const FIELD = Symbol('FIELD');
export const SECTION = Symbol('SECTION');
export const GROUP = Symbol('GROUP');

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

export type DataField = {
    type: typeof FieldType.field;
    label: string;
    value: string;
    link?: string;
    toolTip?: string;
    isPII?: boolean;
};

export type DataSection = {
    type: typeof FieldType.section;
    label: string;
    children: DataNode[];
    tags?: string[];
    isPIILabel?: boolean;
};

export type DataGroup = {
    type: typeof FieldType.group;
    children: DataNode[][]; // arrays of arrays (groups) of nodes
};

export type DataNode = DataField | DataSection | DataGroup;

export type TransformFunction = (node: DataNode) => DataNode | undefined;
