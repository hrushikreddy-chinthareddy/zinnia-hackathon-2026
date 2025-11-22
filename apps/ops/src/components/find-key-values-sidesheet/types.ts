import { TFunction } from 'next-i18next';

import {
    Party,
    Policy,
    ProductType,
    Transaction,
} from '@zinnia/api-types/types/sor';

export type DataTuple = [string, DataField];

export type NestedDataTuple = [string, NestedData];

export type NestedData =
    // Either an array of NestedDataTuple (like a tree of children):
    | ((
          | NestedData[]
          // Or a tuple of [DataField, DataField | NestedDataTuple]:
          | DataTuple
      ) &
          MetaData)
    | null;

export type MetaData = {
    [label]?: string;
    [tags]?: string[];
    [link]?: string;
    [linkedField]?: string;
    [toolTip]?: string;
};
export const label = Symbol('label');
export const tags = Symbol('tags');
export const link = Symbol('link');
export const linkedField = Symbol('linkedField');
export const toolTip = Symbol('toolTip');

// export type Section = [
//     string,
//     {
//         fields?: NestedData;
//         subSections?: NestedData;
//     }
// ];

// export type ToSections = {
//     basics: NestedData[] | null;
//     sections: Section[];
// };

export type ExpandCollapse = typeof Expand | typeof Collapse;

export interface FindAllKeyValuesSidebarProps {
    planCode: string;
    policyNumber: string;
    container?: any;
    handleCalendarOpen?: (isOpen: boolean) => void;
}

export enum FormatterType {
    POLICY = 'policy',
    TRANSACTION = 'transaction',
}

export type ToSectionsProps = {
    policy: Policy;
    t: TFunction;
    searchValue?: string;
    planCode?: string;
    productType?: ProductType;
    allPartiesById?: Record<string, Party>;
    config: TransformationsConfig;
} & (ToPolicySectionsProps | ToTransactionSectionsProps);

export type ToPolicySectionsProps = {
    type: FormatterType.POLICY;
};

export type ToTransactionSectionsProps = {
    type: FormatterType.TRANSACTION;
    transaction: Transaction;
};

export type TransformationsConfig = {
    labels: { [key: string]: string };
    parseTitles?: ({
        sectionTitle,
        acc,
        currentVal,
        currentKey,
    }: {
        sectionTitle: keyof Policy;
        acc: DataNode[];
        currentVal: object;
        currentKey: string;
    }) => DataNode[];
    showSection?: (
        sectionTitle: string,
        policy?: Policy,
        planCode?: string,
        productType?: ProductType
    ) => boolean | undefined;
};

export type Primitive = string | number | boolean;

const FIELD = Symbol('FIELD');
const SECTION = Symbol('SECTION');
const GROUP = Symbol('GROUP');

export const FieldType = {
    field: FIELD,
    section: SECTION,
    group: GROUP,
} as const;

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
