import {
    FullSurrenderRequest,
    PartialWithdrawalOneTimeRequest,
} from '@zinnia/api-types/types/bpm';
import {
    ArrangementType,
    LineOfBusiness,
    Policy,
} from '@zinnia/api-types/types/sor';

import {
    NewLoanRequestQuery,
    LoanRepaymentOneTimeRequestQuery,
    OneTimePremiumRequestQuery,
    SystematicProgramUpdateRequestQuery,
} from '@deps/queries/api/bpm';
import {
    DOC_CONTEXT,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';

import { EventConfig } from './submit-transaction-event-constants';

interface BaseSuccessEventProps<T> {
    query: T;
    policy: Policy | undefined;
    caseId: string | undefined;
    sessionId: string;
    userId: string;
}

export const getCarrierFromPolicy = (policy: Policy | undefined) =>
    policy?.carrierId;

export const getProductKindFromPolicy = (policy: Policy | undefined) =>
    policy?.product?.lineOfBusiness === LineOfBusiness.LIFE
        ? 'policy'
        : 'contract';

// if caseId is present, it is an existing case, otherwise it is a new case
export const deriveDocContextFromQuery = (query: { caseId?: string }) => {
    return {
        doc_context: query?.caseId
            ? DOC_CONTEXT.EXISTING_CASE
            : DOC_CONTEXT.NEW_CASE,
    };
};

export const getAmountFromQuery = (query: {
    transactionAmounts?: { requestedAmount?: number };
}): { amount?: number } => {
    // Only check for requestedAmount if it exists in the expected structure
    if (
        query?.transactionAmounts &&
        'requestedAmount' in query.transactionAmounts
    ) {
        const amount = query.transactionAmounts.requestedAmount;
        return amount !== undefined ? { amount } : {};
    }
    return {};
};

export const buildNonFinancialTransactionsSubmittedEvent = ({
    transactionSubmittedEventType,
    query,
    policy,
    caseId,
    sessionId,
    userId,
}: BaseSuccessEventProps<any> & {
    transactionSubmittedEventType: TransactionSubmittedEventType;
}): TransactionSuccessfulEvent => {
    return {
        ...EventConfig[transactionSubmittedEventType],
        carrier: getCarrierFromPolicy(policy) ?? '',
        ...deriveDocContextFromQuery(query),
        case_id: caseId ?? '',
        product_kind: getProductKindFromPolicy(policy),
        session_id: sessionId,
        user_id: userId,
        userId,
    };
};

export const buildOneTimeFinancialTransactionSubmittedEvent = ({
    query,
    policy,
    caseId,
    sessionId,
    transactionSubmittedEventType,
    userId,
}: BaseSuccessEventProps<
    | NewLoanRequestQuery
    | LoanRepaymentOneTimeRequestQuery
    | OneTimePremiumRequestQuery
    | PartialWithdrawalOneTimeRequest
> & {
    transactionSubmittedEventType: TransactionSubmittedEventType;
}): TransactionSuccessfulEvent => {
    return {
        ...EventConfig[transactionSubmittedEventType],
        ...getAmountFromQuery(query),
        ...deriveDocContextFromQuery(query),
        carrier: getCarrierFromPolicy(policy) ?? '',
        case_id: caseId ?? '',
        product_kind: getProductKindFromPolicy(policy),
        session_id: sessionId,
        user_id: userId,
        userId,
    };
};

export const buildFullSurrenderSubmittedEvent = ({
    query,
    policy,
    caseId,
    sessionId,
    userId,
}: BaseSuccessEventProps<FullSurrenderRequest>): TransactionSuccessfulEvent => {
    return {
        ...EventConfig[TransactionSubmittedEventType.SURRENDER],
        carrier: getCarrierFromPolicy(policy) ?? '',
        ...deriveDocContextFromQuery(query),
        case_id: caseId ?? '',
        product_kind: getProductKindFromPolicy(policy),
        session_id: sessionId,
        user_id: userId,
        userId,
    };
};

export const buildSystematicProgramSubmittedEvent = ({
    query,
    action,
    policy,
    caseId,
    sessionId,
    userId,
}: BaseSuccessEventProps<SystematicProgramUpdateRequestQuery> & {
    action: 'add' | 'update' | 'cancel';
}): TransactionSuccessfulEvent => {
    let eventType;
    switch (query?.systematicProgram?.arrangementType) {
        case ArrangementType.WITHDRAWAL:
            switch (action) {
                case 'add':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_SETUP;
                    break;
                case 'cancel':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_CANCEL;
                    break;
                case 'update':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_WITHDRAWAL_UPDATE;
                    break;
            }
            break;
        case ArrangementType.REQUIREDMINIMUMDISTRIBUTION:
            switch (action) {
                case 'add':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_RMD_SETUP;
                    break;
                case 'cancel':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_RMD_CANCEL;
                    break;
                case 'update':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_RMD_UPDATE;
                    break;
            }
            break;
        case ArrangementType.LOANREPAYMENT:
            switch (action) {
                case 'add':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_LOAN_SETUP;
                    break;
                case 'cancel':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_LOAN_CANCEL;
                    break;
                case 'update':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_LOAN_UPDATE;
                    break;
            }
            break;
        case ArrangementType.PAYMENT:
        default:
            switch (action) {
                case 'add':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_SETUP;
                    break;
                case 'cancel':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_CANCEL;
                    break;
                case 'update':
                    eventType =
                        TransactionSubmittedEventType.SYSTEMATIC_PAYMENT_UPDATE;
                    break;
            }
            break;
    }
    return {
        ...EventConfig[eventType],
        autopay_frequency: query?.systematicProgram?.frequency,
        amount: query?.systematicProgram?.amount,
        carrier: getCarrierFromPolicy(policy) ?? '',
        case_id: caseId ?? '',
        product_kind: getProductKindFromPolicy(policy),
        session_id: sessionId,
        user_id: userId,
        userId,
    };
};
