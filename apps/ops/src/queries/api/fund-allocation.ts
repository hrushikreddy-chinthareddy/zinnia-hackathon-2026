import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import { TransactionResponse } from '@zinnia/api-types/types/bpm';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

interface IFundAllocationsInvestments {
    fundId: string;
    allocationPercentage: number;
    startDate: string;
}

export interface FundAllocationChangeRequest {
    caseId?: string;
    correlationid?: string;
    effectiveDate: string;
    reverseInitiator?: boolean;
    allocation: {
        investmentType: string;
        modelId?: string;
        fundAllocationsInvestments: IFundAllocationsInvestments[];
    };
    allocationOption?: string;
}

export const checkEligibilityFundAllocation = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionResponse, AxiosResponse>(
            `${baseAppUrl}/api/bpm/v1/policies/${planCode}/${policyNumber}/fundallocations/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityFundAllocation::an error occurred during eligibility check',
            error
        );
        return error?.data;
    }
};

export const validateFundAllocation = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    body: FundAllocationChangeRequest
): Promise<any> => {
    try {
        const { data } = await client.post<any, AxiosResponse>(
            `${baseAppUrl}/api/bpm/v1/policies/${planCode}/${policyNumber}/fundallocations/validation`,
            body
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'validateFundAllocation::an error occurred during validation',
            error
        );
        return error?.data as any;
    }
};

export const fundAllocation = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    body: FundAllocationChangeRequest
): Promise<any> => {
    try {
        const { data } = await client.post<any, AxiosResponse>(
            `${baseAppUrl}/api/bpm/v1/policies/${planCode}/${policyNumber}/fundallocations`,
            body
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'fundAllocation::an error occurred during fund allocation',
            error
        );
        return error?.data as any;
    }
};
