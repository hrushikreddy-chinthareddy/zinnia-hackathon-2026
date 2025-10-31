import { Policy, ProductType } from '@xd/api-types/dist/generated-types/sor';

export type DataField = string | number | boolean | null;

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

export type Section = [
    string,
    {
        fields?: NestedData;
        subSections?: NestedData;
    }
];

export type ToSections = {
    basics: NestedData[] | null;
    sections: Section[];
};

export const [Expand, Collapse] = [true, false];

export type ExpandCollapse = typeof Expand | typeof Collapse;

export interface FindAllKeyValuesSidebarProps {
    planCode?: string;
    policyNumber?: string;
}

export enum FormatterType {
    POLICY = 'policy',
    TRANSACTION = 'transaction',
}

export type TransformationsConfig = {
    labels: { [key: string]: string };
    parseTitles?: ({
        sectionTitle,
        acc,
        currentVal,
        currentKey,
    }: {
        sectionTitle: string;
        acc: ToSections;
        currentVal: any; //FIXME
        currentKey: string;
    }) => ToSections;
    formatterType: FormatterType;
    showSection?: (
        sectionTitle: string,
        policy?: Policy,
        planCode?: string,
        productType?: ProductType
    ) => boolean | undefined;
};
