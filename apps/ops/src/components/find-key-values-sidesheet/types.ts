export type NestedFieldData = string | number | boolean | null;
export type FieldData = string | number | boolean | object | null; //TODO: should be more specific than object
export type DataKey = string | symbol;
export type Metadata = Tags;
export type Tags = Record<typeof tags, string[]>;
export type DataTuple = [DataKey, FieldData, Metadata?];
export type DataRecord = Record<DataKey, FieldData>;
export type NestedTuple = [DataKey, FieldData | Record<DataKey, object>];
export type PolicySectionData = Record<DataKey, FieldData> | DataRecord[];
export type PolicySection = [DataKey, PolicySectionData];
export type SubSection = [DataKey, DataTuple[], Metadata?];
export type SubSectionRecord = Record<DataKey, DataTuple[]>;

export type PreparedPolicy = {
    policyBasics: DataTuple[]; // Array of fieldName -> fieldValue
    policySections: PolicySection[]; // Array of (fieldName -> (fieldValue | object))
    people: PolicySection[];
};

export type PreparedPolicySection = {
    fields?: DataTuple[];
    subSections?: SubSection[];
};

export const tags = Symbol('tags');
