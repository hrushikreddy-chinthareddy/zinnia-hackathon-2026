import { BulkCheckTuple, FGA_Tuple } from '@deps/utils/auth';

export type CheckTupleResponse = {
    allowed: boolean;
};

export enum FgaRelation {
    Party = 'party',
    UiAccess = 'ui_access',
}

export enum FgaUiEntity {
    ZinniaLiveHomeExerience = 'entity:zinnia_live_home_experience',
    ZinniaLiveTaskManagment = 'entity:zinnia_live_task_management',
    ZinniaLiveServiceRequest = 'entity:zinnia_live_service_request',
}

export type GetCarrierListQuery = {
    user: string;
    relation: string;
    planCode?: string | string[] | undefined;
    policyNumber?: string | undefined;
};

export type GetRoleListQuery = {
    user: string;
    relation: string;
    type: 'role';
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
