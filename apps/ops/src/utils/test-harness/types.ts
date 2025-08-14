import { AxiosResponse } from 'axios';

export enum PolicyState {
    PENDING_ISSUED = 'PENDINGISSUED',
    ACTIVE_FREELOOK = 'ACTIVE_FREELOOK', // change dates to within the last 30 days
    ACTIVE = 'ACTIVE', // change date to past 3 months
}

export enum IssuanceType {
    IUL = 'IUL',
    UL = 'UL',
    EVGL_MYGA_3 = 'EVGL_MYGA_3',
    EVGL_MYGA_5 = 'EVGL_MYGA_5',
    EVGL_MYGA_7 = 'EVGL_MYGA_7',
    FARMERS_IUL = 'FARMERS_IUL',
    FARMERS_TERM = 'FARMERS_TERM',
    FARMERS_ROP = 'FARMERS_ROP',
}

export interface TestHarnessCreateResponse extends AxiosResponse {
    planCode: string;
    policyNumber: string;
    initialPremiumFailed: boolean;
    lifecycleFailed: boolean;
    message?: string;
}

export interface IssuanceRequestBody {
    type: IssuanceType;
    govtId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    policyNumber: string;
    policyState: PolicyState;
    agentFirstName?: string;
    agentLastName?: string;
    agentProducerKey?: string;
    agentLicenseNumber?: string;
    agentCompanyProducerID?: string;
}
