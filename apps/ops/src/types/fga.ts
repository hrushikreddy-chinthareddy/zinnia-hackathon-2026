export type CheckTupleResponse = {
    allowed: boolean;
};

export enum FgaRelation {
    Party = 'party',
}

export type GetCarrierListQuery = {
    user: string;
    relation: string;
    planCode?: string | string[] | undefined;
    policyNumber?: string | undefined;
};

export type Tuple = {
    user: string;
    relation: string;
    object: string;
};
