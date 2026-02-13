import { TFunction } from 'next-i18next';

import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { getPolicyTransaction } from '@deps/queries/api/policies';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
    Transaction,
    TransactionPayor,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

import { getPaymentMethod } from '../side-sheet-transaction.helpers';
import { ReverseTransactionSidesheetValues } from './types';

export const getReverseRecreateTransactionSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReverseTransactionSidesheetValues => {
    const {
        effectiveDate,
        payors,
        status,
        transactionId,
        transactionType,
        originalTransactionId,
    } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } =
        transaction.transactionAmounts ?? {};

    const isPending = transaction.status === TransactionStatus.PENDING;
    const amount =
        transactionType === TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM
            ? paymentAmount
            : appliedAmount;

    const paymentMethod = getPaymentMethod(
        policy,
        payors as TransactionPayor[],
        t
    );

    const getOriginalTransactionValues = async () => {
        const { policyNumber, product } = policy;
        const originalTransactionValues = await getPolicyTransaction(
            `${product?.planCode}`,
            `${policyNumber}`,
            `${originalTransactionId}`
        );

        if (!originalTransactionValues) {
            return {};
        }

        // XG: remove process date for now
        // the processDate for this transaction is not necessarily the same as the processDate
        // of this transaction's `reverseInitiator`
        const {
            status,
            transactionType,
            transactionAmounts,
            /* processDate, */ reversalDate,
        } = originalTransactionValues;

        if (transactionAmounts === undefined) {
            return {};
        }
        const { appliedAmount, paymentAmount, requestedAmount } =
            transactionAmounts;

        const isPending = status === TransactionStatus.PENDING;

        const amount =
            transactionType ===
            TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM
                ? paymentAmount
                : appliedAmount;

        return {
            submittedAmount: amount || requestedAmount,
            appliedAmount: isPending ? status : appliedAmount,
            // XG: remove process date for now
            // processDate: convertKebabedDateString(processDate),
            reversalDate: convertKebabedDateString(reversalDate),
        };
    };

    return {
        effectiveDate: convertKebabedDateString(effectiveDate),
        status,
        transactionId: transactionId + '-reverse',
        transactionType: `${
            isPending
                ? t('policy.history.sidesheet.paymentOneTimePremium')
                : t('policy.history.sidesheet.oneTimePremium')
        }`,
        newAppliedAmount: amount || requestedAmount,
        paymentMethod: paymentMethod,
        getAsyncSideSheetValues: getOriginalTransactionValues,
        transactionValue: amount || requestedAmount,
    };
};

export const replacesReverseInitiator = async (
    transaction: Transaction,
    reverseInitiators: Transaction[],
    policy: Policy
): Promise<boolean> => {
    // if the originalTransactionId of this transaction is matches any transaction in reverseInitiator array
    // then it is the original reversed transaction
    // and we need to display the reversed transaction sidesheet
    const originalTransactionId = transaction.originalTransactionId;
    const reverseInitiatorIds = reverseInitiators.map(
        ({ transactionId }: Transaction) => transactionId
    );

    // if there is no originalTransactionId or reversedTransactionIds, then it is not a reversed transaction
    if (!originalTransactionId?.length || !reverseInitiatorIds?.length)
        return false;

    // check if this transaction replaces any reverseInitiator
    // and save it in checkedIds
    if (reverseInitiatorIds.includes(originalTransactionId)) return true;

    const parentId = transaction.parentId;
    // check if parentId
    // if there is no parentId, we went to the original transaction
    // and it is not a reversed transaction
    if (!parentId?.length) return false;

    // if there is no planCode, or policyNumber, we cannot call the API
    const planCode = policy?.product?.planCode;
    const policyNumber = policy?.policyNumber;
    if (!planCode?.length || !policyNumber?.length) return false;

    // get the parent transaction from the api
    // and keep searching until we find the original transaction
    const parentTransaction = await getPolicyTransaction(
        planCode,
        policyNumber,
        parentId
    ).catch(() => null);

    if (parentTransaction)
        return replacesReverseInitiator(
            parentTransaction,
            reverseInitiators,
            policy
        );

    // if none of the above we can be confident
    // this transaction doesn't replace a reverseInitiator
    return false;
};
