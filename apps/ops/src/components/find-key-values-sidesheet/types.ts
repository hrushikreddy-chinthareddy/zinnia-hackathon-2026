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
};
export const label = Symbol('label');
export const tags = Symbol('tags');
export const link = Symbol('link');
export const linkedField = Symbol('linkedField');

export type PolicySection = [
    string,
    {
        fields?: NestedData;
        subSections?: NestedData;
    }
];

export const [Expand, Collapse] = [true, false];

export type ExpandCollapse = typeof Expand | typeof Collapse;
