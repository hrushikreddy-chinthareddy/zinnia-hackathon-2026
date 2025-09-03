export type NestedFieldData = string | number | boolean | null;
export type FieldData = string | number | boolean | object | null; //TODO: should be more specific than object
export type DataTuple = [string, FieldData];
export type DataRecord = Record<string, FieldData>;
export type NestedTuple = [string, FieldData | Record<string, object>];
export type PolicySectionData = Record<string, FieldData> | DataRecord[];
export type PolicySection = [string, PolicySectionData];
export type SubSection = [string, DataTuple[]];

export type PreparedPolicy = {
    policyBasics: DataTuple[]; // Array of fieldName -> fieldValue
    policySections: PolicySection[]; // Array of (fieldName -> (fieldValue | object))
};

export type PreparedPolicySection = {
    fields?: DataTuple[];
    subSections?: SubSection[];
};
