export type FieldData = string | number | boolean | object | null;
export type DataTuple = [string, FieldData];
export type DataRecord = Record<string, FieldData>;
export type NestedTuple = [string, FieldData, object];
export type PolicySectionData =
    | Record<string, FieldData | NestedTuple>
    | DataRecord[];
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
