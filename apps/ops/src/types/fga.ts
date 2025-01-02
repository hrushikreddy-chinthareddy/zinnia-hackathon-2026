import { BulkCheckTuple, FGA_Tuple } from '@zinnia/utils';

export type CheckTupleResponse = {
    allowed: boolean;
};

export enum FgaRelation {
    Party = 'party',
    UiAccess = 'ui_access',
}

export type GetCarrierListQuery = {
    user: string;
    relation: string;
    planCode?: string | string[] | undefined;
    policyNumber?: string | undefined;
};

export type Tuple = FGA_Tuple;

export type TupleRequest = {
    tuples: FGA_Tuple[];
};

export type TupleResponse = {
    tuples: BulkCheckTuple[];
};

export type ListResponse = {
    objects: string[];
};
