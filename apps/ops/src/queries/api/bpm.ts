import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { CreateQualityAuditRequest } from '@deps/types/search';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import {
    FreeLookCancellationRequest,
    FullSurrenderRequest,
    PartialWithdrawalOneTimeRequest,
} from '@zinnia/api-types/types/bpm';
import { Signature } from '@zinnia/api-types/types/case';
import {
    AdhocSystematicProgram,
    FullSurrenderQuoteResponse,
    OneTimePremiumRequest,
    PartialWithdrawalOneTimeQuoteResponse,
    SystematicProgramUpdateRequest,
    LoanRepaymentOneTimeRequest,
    NewLoanRequest,
} from '@zinnia/api-types/types/sor';

const baseUrl = `${baseAppUrl}/api/bpm/v1`;

export interface NewLoanRequestQuery extends NewLoanRequest {
    caseId: string;
}

export interface LoanRepaymentOneTimeRequestQuery
    extends LoanRepaymentOneTimeRequest {
    caseId: string;
}

export interface OneTimePremiumRequestQuery extends OneTimePremiumRequest {
    caseId: string;
}

export interface SystematicProgramUpdateRequestQuery
    extends SystematicProgramUpdateRequest {
    caseId: string;
}

export interface SystematicProgramRequestQuery {
    systematicProgram: AdhocSystematicProgram;
}

export interface CancelTransactionRequestQuery {
    correlationId: string;
    transactionId: string;
    caseId?: string;
    reason: string;
}

export interface ReverseRecreateRequestQuery {
    correlationId: string;
    corrections: {
        transactionId: string;
        amount: number;
    }[];
    noRecreateTransactions: boolean;
    caseID: string;
}

export interface SystematicProgramUpdateResponse {
    status: number;
    data?: {
        caseId: string;
        caseStatus: string;
        correlationId: string;
    };
}

export interface SubmitPremiumResponse {
    status: number;
    data?: {
        caseId: string;
        caseStatus: string;
        correlationId: string;
    };
}

export interface CancelTransactionResponse
    extends SystematicProgramUpdateResponse {}

export interface TransactionResponse {
    status: string | number;
    quoteResponse?:
        | FullSurrenderQuoteResponse
        | PartialWithdrawalOneTimeQuoteResponse;
    validationResult?: ValidationResult[];
    data?: any;
}

export interface TransactionSubmitResponse {
    caseId?: string;
    status?: string;
    correlationId?: string;
}

export interface TransactionRequest {
    effectiveDate: string;
}

export type deleteRoleBodyProps = {
    effectiveDate: string;
    party: Record<string, never>;
    signatures: Signature[];
};

export interface FullSurrenderEligibilityRequest {
    correlationId: string;
    effectiveDate: string;
    reverseInitiator: boolean;
    taxWithholdingInstructions: [];
    payeeOrBeneficiary: null;
    parties: [];
    transactionAmounts: {
        requestedAmount: number | null;
        amountType: string;
        disbursementType: string;
        disbursementPaymentForm: string;
    };
    charges: null;
}

export interface FreelookEligibilityRequest {
    effectiveDate: string;
}

export interface ValidationResult {
    attribute: string | null;
    error: string;
    errorCode: string;
    resolution: string;
}

export enum TransactionResponseStatus {
    Failure = 'failure',
    Success = 'success',
}
export interface CaseQualityAuditEligibilityResponse {
    status: string | number;
}

export const checkEligibilityLoanRepaymentOneTime = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    totalLoanBalance: number | undefined
): Promise<TransactionResponse> => {
    try {
        // TODO MG: Temporary solution while BPM adds logic
        if (!totalLoanBalance || totalLoanBalance <= 0) {
            return {
                status: TransactionResponseStatus.Failure,
                validationResult: [
                    {
                        resolution: 'Total loan balance is 0',
                        attribute: null,
                        error: '',
                        errorCode: '',
                    },
                ],
            };
        }
        const { data } = await client.post<TransactionResponse, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/loanrepaymentonetime/eligibilitycheck`,
            {} as AxiosResponse
        );

        return data;
    } catch (error: any) {
        console.error(
            'checkEligibilityLoanRepaymentOneTime::an error occurred during eligibility check',
            error
        );

        return error?.data;
    }
};

export const checkEligibilityNewLoan = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    maxLoanValue: number | undefined
): Promise<TransactionResponse> => {
    try {
        // TODO MG: Temporary solution while BPM adds logic
        if (maxLoanValue === 0) {
            return {
                status: TransactionResponseStatus.Failure,
                validationResult: [
                    {
                        resolution: 'Maximum loan value is 0',
                        attribute: null,
                        error: '',
                        errorCode: '',
                    },
                ],
            };
        }

        const { data } = await client.post<TransactionResponse, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/newloan/eligibilitycheck`,
            {} as AxiosResponse
        );

        return data;
    } catch (error: any) {
        console.error(
            'checkEligibilityNewLoan::an error occurred during eligibility check',
            error
        );

        return error?.data;
    }
};

export const checkEligibilityOneTimePremium = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/onetimepremium/eligibilitycheck`
        );

        return data;
    } catch (error: any) {
        console.error(
            'checkEligibilityOneTimePremium::an error occurred during eligibility check',
            error
        );

        return error?.data;
    }
};

export const checkEligibilityPartialWithdrawalOneTime = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/partialwithdrawalonetime/eligibilitycheck`,
            {
                effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            }
        );

        return data;
    } catch (error: any) {
        console.error(
            'checkEligibilityPartialWithdrawalOneTime::an error occurred during eligibility check',
            error
        );

        return error?.data;
    }
};

export const checkEligibilitySystematicPrograms = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    arrangementId: string
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/eligibilitycheck`
        );

        return data;
    } catch (error: any) {
        console.error(
            'checkEligibilitySystematicPrograms::an error occurred during eligibility check',
            error
        );

        return error?.data;
    }
};

export const checkEligibilitySystematicProgram = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    arrangementId: string,
    query: SystematicProgramRequestQuery
): Promise<TransactionResponse> => {
    try {
        browserLogInfo('SystematicProgram::Initiating eligibility check', {
            payload: { planCode, policyNumber, arrangementId, query },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/eligibilitycheck`,
            function: 'checkEligibilitySystematicProgram',
        });

        const { data } = await client.post<
            SystematicProgramRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/eligibilitycheck`,
            query
        );

        return data;
    } catch (error: any) {
        browserLogError('SystematicProgram::Eligibility check failed', {
            ...parseErrorInformation(error),
            payload: { planCode, policyNumber, arrangementId, query },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/eligibilitycheck`,
            function: 'checkEligibilitySystematicProgram',
        });

        return error?.data;
    }
};

export const checkEligibilityFullSurrender = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        browserLogInfo('FullSurrender::Initiating eligibility check', {
            payload: { planCode, policyNumber },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/fullsurrender/eligibilitycheck`,
            function: 'checkEligibilityFullSurrender',
        });
        const { data } = await client.post<
            FullSurrenderEligibilityRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fullsurrender/eligibilitycheck`,
            {
                correlationId: '',
                effectiveDate: '',
                reverseInitiator: false,
                taxWithholdingInstructions: [],
                payeeOrBeneficiary: null,
                parties: [],
                transactionAmounts: {
                    requestedAmount: null,
                    amountType: '',
                    disbursementType: '',
                    disbursementPaymentForm: '',
                },
                charges: null,
            }
        );
        return data;
    } catch (error: any) {
        browserLogError('FullSurrender::Eligibility check failed', {
            ...parseErrorInformation(error),
            payload: { planCode, policyNumber },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/fullsurrender/eligibilitycheck`,
            function: 'checkEligibilityFullSurrender',
        });
        return error?.data;
    }
};

export const validateFullSurrenderWithdrawal = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: FullSurrenderRequest
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<FullSurrenderRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fullsurrender/validation`,
            query
        );

        return data;
    } catch (error: any) {
        console.error(
            'validateFullSurrenderWithdrawal::an error occurred during validation',
            error
        );

        return error?.data as TransactionResponse;
    }
};

export const validateLoanPayment = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: LoanRepaymentOneTimeRequestQuery
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<
            LoanRepaymentOneTimeRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/loanrepaymentonetime/validation`,
            query
        );

        return data;
    } catch (error: any) {
        console.error(
            'validateLoanPayment::an error occurred during validation',
            error
        );

        return error?.data as TransactionResponse;
    }
};

export const validateNewLoan = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: NewLoanRequest
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<NewLoanRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/newloan/validation`,
            query
        );

        return data;
    } catch (error: any) {
        console.error(
            'validateNewLoan::an error occurred during validation',
            error
        );

        return error?.data as TransactionResponse;
    }
};

export const validateOneTimePremium = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: OneTimePremiumRequestQuery
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<
            OneTimePremiumRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/onetimepremium/validation`,
            query
        );

        return data;
    } catch (error: any) {
        console.error(
            'validateOneTimePremium::an error occurred during validation',
            error
        );

        return error?.data as TransactionResponse;
    }
};

export const validatePartialWithdrawalOneTime = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: PartialWithdrawalOneTimeRequest
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<
            PartialWithdrawalOneTimeRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/partialwithdrawalonetime/validation`,
            query
        );

        return data;
    } catch (error: any) {
        console.error(
            'validatePartialWithdrawalOneTime::an error occurred during validation',
            error
        );

        return error?.data as TransactionResponse;
    }
};

export const validateSystematicProgramUpdate = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    arrangementId: string,
    query: SystematicProgramUpdateRequestQuery
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<
            SystematicProgramUpdateRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/validation`,
            query
        );

        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'validateSystematicProgramUpdate::an error occurred during validation',
            error
        );

        return { status: error?.status, data: error?.data };
    }
};

export const submitFreeLookCancel = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: FreeLookCancellationRequest
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<
            FreeLookCancellationRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/freelookcancellation`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitFreeLookCancel::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitFullSurrenderWithdrawal = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: FullSurrenderRequest
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<FullSurrenderRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/fullsurrender`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitFullSurrenderWithdrawal::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitOneTimePremium = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: OneTimePremiumRequestQuery
): Promise<SubmitPremiumResponse> => {
    try {
        const response = await client.post<
            OneTimePremiumRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/onetimepremium`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitOneTimePremium::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitLoanPayment = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: LoanRepaymentOneTimeRequestQuery
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<
            LoanRepaymentOneTimeRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/loanrepaymentonetime`,
            query
        );

        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitLoanPayment::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitNewLoan = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: NewLoanRequest
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<NewLoanRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/newloan`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitNewLoan::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitPartialWithdrawalOneTime = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    query: PartialWithdrawalOneTimeRequest
): Promise<TransactionResponse> => {
    try {
        const response = await client.post<
            PartialWithdrawalOneTimeRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/partialwithdrawalonetime`,
            query
        );
        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitPartialWithdrawalOneTime::an error occurred during submission',
            error
        );

        return { status: error.response?.status };
    }
};

export const submitSystematicProgramUpdate = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    arrangementId: string,
    query: SystematicProgramUpdateRequestQuery
): Promise<SystematicProgramUpdateResponse> => {
    const POST = 'post';
    const PUT = 'put';
    const method = arrangementId ? PUT : POST;
    const url = `${baseUrl}/policies/${planCode}/${policyNumber}/systematicprograms/${
        arrangementId ? arrangementId : ''
    }`;

    try {
        const response = await client[method]<
            SystematicProgramUpdateRequestQuery,
            AxiosResponse
        >(url, query);

        return { status: response.status, data: response.data };
    } catch (error: any) {
        console.error(
            'submitSystematicProgramUpdate::an error occurred during validation',
            error
        );

        return error;
    }
};

export const cancelTransaction = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    transactionId: string,
    reason: string = '',
    caseId?: string,
    correlationId?: string
): Promise<CancelTransactionResponse> => {
    try {
        const corrId = correlationId ?? uuidV4();
        const response = await client.post<
            CancelTransactionRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/canceltransaction`,
            {
                correlationId: corrId || '',
                transactionId,
                reason,
                ...(caseId ? { caseId } : {}),
            },
            {
                headers: {
                    'x-correlation-id': correlationId,
                },
            }
        );
        return { status: response.status, data: response.data };
    } catch (e: any) {
        console.error(
            'cancelTransaction:: an error occurred while trying to cancel the transaction',
            e
        );

        return { status: e.response?.status };
    }
};

export const reverseRecreateTransaction = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    correlationId?: string,
    transactionId?: string,
    caseID?: string
): Promise<CancelTransactionResponse> => {
    try {
        const corrId = correlationId ?? uuidV4();
        const response = await client.post<
            ReverseRecreateRequestQuery,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/reverserecreate`,
            {
                correlationId: corrId,
                corrections: [
                    {
                        transactionId: transactionId || '',
                        amount: 0,
                    },
                ],
                noRecreateTransactions: false,
                caseID: caseID || '',
            },
            {
                headers: {
                    'x-correlation-id': correlationId,
                },
            }
        );
        return { status: response.status, data: response.data };
    } catch (e: any) {
        console.error(
            'reverseTransaction:: an error occurred while trying to reverse the transaction',
            e
        );

        return { status: e.response?.status };
    }
};

export const checkEligibilityManageRole = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    role: string
): Promise<TransactionResponse> => {
    try {
        const { data } = await client.post<TransactionRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${role}/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            `checkEligibilityManageRole::Error checking eligibility for ${role}`,
            {
                ...parseErrorInformation(error),
                planCode,
                policyNumber,
                role,
                file: 'bpm::checkEligibilityManageRole',
            }
        );

        return error?.response?.data || error?.data;
    }
};

export const checkEligibilityManageBankChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        browserLogInfo('BankInfo::Initiating eligibility check', {
            payload: { planCode, policyNumber },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/bankaccount/eligibilitycheck`,
            function: 'checkEligibilityManageBankChange',
        });
        const { data } = await client.post<TransactionRequest, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/bankaccount/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityManageBankChange::Error checking eligibility for bank change',
            {
                ...parseErrorInformation(error),
                planCode,
                policyNumber,
                file: 'bpm::checkEligibilityManageBankChange',
            }
        );

        return error?.response?.data || error?.data;
    }
};

export const checkEligibilityFreelookCancellation = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<TransactionResponse> => {
    try {
        browserLogInfo('FreelookCancellation::Initiating eligibility check', {
            payload: { planCode, policyNumber },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/freelookcancellation/eligibilitycheck`,
            function: 'checkEligibilityFreelookCancellation',
        });
        const { data } = await client.post<
            FreelookEligibilityRequest,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/freelookcancellation/eligibilitycheck`,
            {
                effectiveDate: dayjs().format('YYYY-MM-DD'),
            }
        );
        return data;
    } catch (error: any) {
        browserLogError('FreelookCancellation::Eligibility check failed', {
            ...parseErrorInformation(error),
            payload: { planCode, policyNumber },
            url: `${baseUrl}/policies/${planCode}/${policyNumber}/freelookcancellation/eligibilitycheck`,
            function: 'checkEligibilityFreelookCancellation',
        });
        return error?.data;
    }
};

export const checkCaseQualityAuditEligibility = async (
    query: CreateQualityAuditRequest
): Promise<CaseQualityAuditEligibilityResponse> => {
    const caseQualityAuditUrl = `${baseAppUrl}/api/process/workflow/v1/qualityaudit/eligibilitycheck`;

    try {
        browserLogInfo(
            'CaseQualityAuditEligibility::Initiating eligibility check',
            {
                payload: query,
                url: caseQualityAuditUrl,
                function: 'checCaseQualityAuditEligibility',
            }
        );

        const response = await client.post<
            CreateQualityAuditRequest,
            AxiosResponse
        >(caseQualityAuditUrl, query);
        return { status: response.status };
    } catch (error: any) {
        browserLogError(
            'CaseQualityAuditEligibility::Eligibility check failed',
            {
                ...parseErrorInformation(error),
                payload: query,
                url: caseQualityAuditUrl,
                function: 'checCaseQualityAuditEligibility',
            }
        );
        return error?.data;
    }
};
