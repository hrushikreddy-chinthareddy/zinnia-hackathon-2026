import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import {  TransactionResponse } from './bpm';
import { client } from '../api-utils/client';

const baseUrl = `${baseAppUrl}/api/bpm/v1`;

export interface FundTransferRequest {
    caseId?: string;
    correlationId?: string;
    effectiveDate?: string;
    reverseInitiator?: boolean;
    fundAllocation: {
        allocationOption: string;
    };
    transactionAmounts: {
        amountType: string;
    };
    funds: {
        transferFrom: { fundId: string; requestedAmount: string | number; fundSegments: [] }[];
        transferTo: { fundId: string; requestedAmount: string | number; fundSegments: [] }[];
    };
}

export interface FundTransferResponse {
    status: number;
    data?: {
        caseId: string;
        caseStatus: string;
        correlationId: string;
    };
}

export const checkEligibilityFundTransfer = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionResponse, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fundtransfer/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError('checkEligibilityFundTransfer::an error occurred during eligibility check', {
            ...parseErrorInformation(error),
        });
        return error?.data;
    }
};

export const validateFundTransfer = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: FundTransferRequest
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<FundTransferRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fundtransfer/validation`,
            query
        );
        return data;
    } catch (error: any) {
        browserLogError('validateFundTransfer::an error occurred during validation', {
            ...parseErrorInformation(error),
        });
        return error?.data as TransactionResponse;
    }
};

export const submitFundTransfer = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: FundTransferRequest
): Promise<FundTransferResponse> => {
    try {
        const response = await client.post<FundTransferRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fundtransfer`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        browserLogError('submitFundTransfer::an error occurred during submission', {
            ...parseErrorInformation(error),
        });

        return { status: error.response?.status };
    }
};
