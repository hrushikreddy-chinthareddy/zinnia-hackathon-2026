export type NestedFieldData = string | number | boolean | null;
export type FieldData = string | number | boolean | object | null; //TODO: should be more specific than object
export type DataKey = string | symbol;
export type MetaData = Partial<Tags> & Partial<Link> & Partial<LinkedField>;
export type Tags = Record<typeof tags, string[]>;
export type Link = Record<typeof link, string>;
export type LinkedField = Record<typeof linkedField, string>;
export type DataTuple = [DataKey, FieldData];
export type DataRecord = Record<DataKey, FieldData>;
export type NestedTuple = [DataKey, FieldData | Record<DataKey, object>];
export type PolicySectionData = Record<DataKey, FieldData> | DataRecord[];
export type PolicySection = [DataKey, PolicySectionData];
export type SubSection = [DataKey, DataTuple[], MetaData?];
export type SubSectionRecord = Record<DataKey, DataTuple[]>;

export type PreparedPolicy = {
    policyBasics: DataTuple[]; // Array of fieldName -> fieldValue
    policySections: PolicySection[]; // Array of (fieldName -> (fieldValue | object))
};

export type PreparedPolicySection = {
    fields?: DataTuple[];
    subSections?: SubSection[];
};

export const tags = Symbol('tags');
export const link = Symbol('link');
export const linkedField = Symbol('linkedField');
