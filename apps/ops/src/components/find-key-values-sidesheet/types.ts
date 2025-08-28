export type DataTuple = [string, string | number];
export type NestedTuple = [string, object];
export type PreparedPolicy = {
    policyBasics: DataTuple[];
    policySections: [string, unknown][];
};
