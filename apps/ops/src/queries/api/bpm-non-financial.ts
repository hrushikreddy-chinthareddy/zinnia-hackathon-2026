import {
    CommunicationPreferenceChangeRequest,
    TransactionAcceptedResponse,
    ValidationResult,
} from '@zinnia/api-types/types/bpm';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

import {
    AddressBase,
    BankAccountBase,
    EmailBase,
    PhoneBase,
    PartyNameChangeRequest,
} from '@zinnia/api-types/types/sor';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

const baseUrl = `${baseAppUrl}/api/bpm/v1`;

export enum PreferredAddressIndicator {
    'Yes' = 'YES',
    'No' = 'NO',
}

export enum NonFinancialTransactionActions {
    Add = 'add',
    Delete = 'delete',
    Edit = 'edit',
}

export enum NonFinancialTransactions {
    Address = 'address',
    Allocations = 'allocations',
    BankAccount = 'bankaccount',
    CommunicationPreference = 'communicationpreference',
    Email = 'email',
    EmailAddress = 'emailaddress',
    Number = 'number',
    Phone = 'phone',
    Name = 'name',
}

export interface NonFinancialTransactionBody {
    caseId?: string;
    correlationId: string;
    effectiveDate: string;
    deleteRequest?: boolean;
    preferredAddressIndicator?: PreferredAddressIndicator;
    reverseInitiator?: boolean;
}

export interface NonFinancialTransactionResponse {
    status: string | number;
    quoteResponse?: any;
    sor?: string;
    error?: any;
}

export interface NonFinancialTransactionValidationResponse
    extends NonFinancialTransactionResponse {
    data: {
        err: string;
        status: string | number;
        validationResult?: ValidationResult[];
    };
}

interface AddressBody extends NonFinancialTransactionBody {
    address: AddressBase;
}

interface BankAccountBody extends NonFinancialTransactionBody {
    bankAccount: BankAccountBase;
}

interface EmailBody extends NonFinancialTransactionBody {
    email: EmailBase;
}

interface PhoneBody extends NonFinancialTransactionBody {
    phone: PhoneBase;
}

interface NonFinancialTransaction {
    body: AddressBody | BankAccountBody | EmailBody | PhoneBody;
    partyId?: string;
    planCode?: string;
    policyNumber?: string;
    transaction: NonFinancialTransactions;
}

interface AddNonFinancialTransaction extends NonFinancialTransaction {}
interface EditNonFinancialTransaction extends NonFinancialTransaction {
    itemId?: string;
}

interface ValidateNonFinancialTransaction extends AddNonFinancialTransaction {
    action: NonFinancialTransactionActions;
}

export const addNonFinancialTransaction = async ({
    body,
    partyId,
    planCode,
    policyNumber,
    transaction,
}: AddNonFinancialTransaction): Promise<any> => {
    if (!planCode || !policyNumber || !partyId) {
        console.error(
            'addNonFinancialTransaction::missing plancode, policyNumber, or partyId'
        );
        return;
    }

    try {
        const response = await client.post<any, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${partyId}/${transaction}`,
            body
        );

        return response;
    } catch (error: any) {
        // 400 is a BPM validation error
        if (error?.status === StatusCode.BadRequest) {
            console.warn(
                'addNonFinancialTransaction::BPM error occurred',
                error
            );
        } else {
            console.error(
                'addNonFinancialTransaction::an error occurred',
                error
            );
        }
        return error;
    }
};

export const editNonFinancialTransaction = async ({
    body,
    itemId,
    partyId,
    planCode,
    policyNumber,
    transaction,
}: EditNonFinancialTransaction): Promise<any> => {
    if (!itemId || !planCode || !policyNumber || !partyId) {
        console.error(
            'editNonFinancialTransaction::missing itemid, plancode, policyNumber, or partyId'
        );
        return;
    }

    const today = dayjs().format(ZAHARA_API_DATE_FORMAT);

    if ((body as AddressBody).address)
        (body as AddressBody).address.startDate = today;
    if ((body as EmailBody).email) (body as EmailBody).email.startDate = today;
    if ((body as PhoneBody).phone) (body as PhoneBody).phone.startDate = today;

    try {
        const response = await client.put<any, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${partyId}/${transaction}/${itemId}`,
            body
        );

        return response;
    } catch (error: any) {
        // 400 is a BPM validation error
        if (error?.status === StatusCode.BadRequest) {
            console.warn(
                'editNonFinancialTransaction::BPM error occurred',
                error
            );
        } else {
            console.error(
                'editNonFinancialTransaction::an error occurred',
                error
            );
        }
        return error;
    }
};

export const updateEDeliveryPreferenceByPlanCode = async ({
    partyId,
    planCode,
    policyNumber,
    newPreferencesData,
}: {
    partyId: string;
    planCode: string;
    policyNumber: string;
    newPreferencesData: CommunicationPreferenceChangeRequest;
}): Promise<AxiosResponse<TransactionAcceptedResponse>> => {
    const url = `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${partyId}/communicationpreference`;

    // There is currently a bug where if we try to submit this after policy lifecycling (3pm central)
    // the transaction will fail, this is to submit the next day
    const centralTime = dayjs().tz('America/Chicago');
    let effectiveDate = dayjs();
    if (centralTime.isAfter(centralTime.hour(15), 'hour')) {
        effectiveDate = effectiveDate.add(1, 'day');
    }

    const body: CommunicationPreferenceChangeRequest = {
        ...newPreferencesData,
        effectiveDate: effectiveDate.format(ZAHARA_API_DATE_FORMAT),
    };

    try {
        const response = await client.post<
            CommunicationPreferenceChangeRequest,
            AxiosResponse<TransactionAcceptedResponse>
        >(url.toString(), body);
        return response;
    } catch (error: any) {
        if (error?.status === StatusCode.BadRequest) {
            console.warn(
                'updateEDeliveryPreferenceByPlanCode::BPM error occurred',
                error
            );
            return error;
        }
        console.error(
            'updateEDeliveryPreferenceByPlanCode::an error occurred',
            error
        );
        return error;
    }
};

export const checkEligibilityPhoneChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<NonFinancialTransactionResponse> => {
    try {
        const { data } = await client.post<
            NonFinancialTransactionResponse,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/phonenumber/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityPhoneChange::an error occurred during eligibility check',
            {
                ...parseErrorInformation(error),
                payload: { planCode, policyNumber },
                function: 'webnonfinancial.checkEligibilityPhoneChange',
            }
        );

        return error?.data;
    }
};

export const checkEligibilityBeneficiary = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<NonFinancialTransactionResponse> => {
    try {
        const { data } = await client.post<
            NonFinancialTransactionResponse,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/beneficiary/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityBeneficiary::an error occurred during eligibility check',
            {
                ...parseErrorInformation(error),
                payload: { planCode, policyNumber },
                function: 'webnonfinancial.checkEligibilityBeneficiary',
            }
        );
        return error?.data;
    }
};

export const checkEligibilityAddressChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<NonFinancialTransactionResponse> => {
    try {
        const { data } = await client.post<
            NonFinancialTransactionResponse,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/address/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityAddressChange::an error occurred during eligibility check',
            {
                ...parseErrorInformation(error),
                payload: { planCode, policyNumber },
                function: 'webnonfinancial.checkEligibilityAddressChange',
            }
        );
        return error?.data;
    }
};

export const checkEligibilityEmailChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined
): Promise<NonFinancialTransactionResponse> => {
    try {
        const { data } = await client.post<
            NonFinancialTransactionResponse,
            AxiosResponse
        >(
            `${baseUrl}/policies/${planCode}/${policyNumber}/emailaddress/eligibilitycheck`
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'checkEligibilityEmailChange::an error occurred during eligibility check',
            {
                ...parseErrorInformation(error),
                payload: { planCode, policyNumber },
                function: 'webnonfinancial.checkEligibilityEmailChange',
            }
        );
        return error?.data;
    }
};

export const changePartyName = async ({
    partyId,
    planCode,
    policyNumber,
    newPartyData,
}: {
    partyId: string;
    planCode: string;
    policyNumber: string;
    newPartyData: PartyNameChangeRequest;
}): Promise<AxiosResponse<TransactionAcceptedResponse>> => {
    const url = `${baseAppUrl}/api/policy/v1/transactions/${planCode}/${policyNumber}/parties/${partyId}/partyname`;

    browserLogInfo('existingPartyNameChange::transaction_started', {
        planCode,
        policyNumber,
        partyId,
    });
    try {
        const response = await client.post<
            PartyNameChangeRequest,
            AxiosResponse<TransactionAcceptedResponse>
        >(url.toString(), newPartyData);
        browserLogInfo('existingPartyNameChange::transaction_completed', {
            planCode,
            policyNumber,
            partyId,
        });
        return response;
    } catch (error: any) {
        if (error?.status === StatusCode.BadRequest) {
            browserLogInfo(
                'existingPartyNameChange::transaction_error::BPM error occurred',
                {
                    error,
                }
            );
            console.warn(
                'existingPartyNameChange::transaction_error::BPM error occurred',
                error
            );
            return error;
        }
        browserLogInfo(
            'existingPartyNameChange::transaction_error::BPM error occurred',
            {
                error,
            }
        );
        console.error(
            'existingPartyNameChange::transaction_error::an error occurred',
            error
        );
        return error;
    }
};

export const validateNonFinancialTransaction = async ({
    body,
    partyId,
    planCode,
    policyNumber,
    transaction,
    action,
}: ValidateNonFinancialTransaction): Promise<
    NonFinancialTransactionValidationResponse | undefined
> => {
    if (!planCode || !policyNumber || !partyId) {
        browserLogInfo(
            'ValidateNonFinancialTransaction::missing plancode, policyNumber, or partyId'
        );
    }
    let operation = '';
    switch (action) {
        case NonFinancialTransactionActions.Add:
            operation = 'Add';
            break;
        case NonFinancialTransactionActions.Edit:
            operation = 'Update';
            break;
        case NonFinancialTransactionActions.Delete:
            operation = 'Delete';
            break;
        default:
            operation = 'Add';
    }

    try {
        const response = await client.post<any, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/bankaccount/${partyId}/validation?operation=${operation}`,
            body
        );

        return response;
    } catch (error: any) {
        if (error?.status === StatusCode.BadRequest) {
            browserLogInfo(
                'ValidateNonFinancialTransaction::transaction_error::BPM error occurred',
                {
                    error,
                    transaction,
                    planCode,
                    policyNumber,
                    action,
                }
            );
        } else {
            browserLogInfo(
                'ValidateNonFinancialTransaction::transaction_error::BPM error occurred',
                {
                    error,
                    transaction,
                    planCode,
                    policyNumber,
                    action,
                }
            );
        }
        return error;
    }
};
