import { TFunction } from "next-i18next";

import { convertKebabedDateString } from "@deps/helpers/string.helper";
import { Policy, Transaction, TransactionPayor, TransactionStatus, TransactionType } from "@deps/models/policy/sor-policy";
import { FEATURE_FLAGS } from "@deps/utils/optimizely/flags";
import { FeatureFlags } from "@deps/utils/optimizely/optimizely";

import { getPaymentMethod } from "../side-sheet-transaction.helper";
import { TransactionSideSheetValues } from "../types";

export const getInitialPremiumSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): TransactionSideSheetValues => {
    const { effectiveDate, payors, processDate, status, transactionAmounts, transactionId, transactionType } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};
    const isPending = status === ('Pending' as TransactionStatus);
    const isCanceled = status === ('Canceled' as TransactionStatus);
    const amount = isCanceled || transactionType === TransactionType.PaymentInitialPremium ? paymentAmount : appliedAmount;

    const paymentMethod = getPaymentMethod(policy, payors as TransactionPayor[], t);

    return {
        appliedAmount: isPending ? status : appliedAmount,
        effectiveDate: convertKebabedDateString(effectiveDate),
        paymentMethod,
        processDate: convertKebabedDateString(processDate),
        status,
        submittedAmount: isCanceled || isPending ? paymentAmount : requestedAmount,
        transactionId,
        transactionType: t('policy.history.sidesheet.initialPremium') as string,
        transactionValue: amount || requestedAmount,
    };
};

export const getOneTimePremiumSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    featureFlags: FeatureFlags
): TransactionSideSheetValues => {
    try {
        const { effectiveDate, payors, processDate, status, transactionAmounts, transactionId, transactionType } = transaction ?? {};
        const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};

        const isPending = status === ('Pending' as TransactionStatus);
        const isCanceled = status === ('Canceled' as TransactionStatus);
        const isPayment = transactionType === TransactionType.PaymentOneTimePremium;

        const amount = isCanceled || isPayment ? paymentAmount : appliedAmount;

        const reverseRecreateEnabled = featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED];

        return {
            appliedAmount: isPending ? status : appliedAmount,
            cancelCta: isPending
                ? t('policy.history.sidesheet.cancelPayment') as string
                : undefined,
            effectiveDate: convertKebabedDateString(effectiveDate),
            paymentMethod: getPaymentMethod(policy, payors as TransactionPayor[], t),
            processDate: convertKebabedDateString(processDate),
            reverseCta:
                reverseRecreateEnabled && transaction.status === TransactionStatus.Completed
                    ? t('policy.history.reverseRecreateSidesheet.reversePayment') as string
                    : undefined,
            // Payment One Time Premium and One Time Premium are different - we'll need the parentId for Premiums
            reversalTransactionId: isPayment ? transactionId : transaction.parentId,
            status,
            submittedAmount: isCanceled || isPending ? paymentAmount : requestedAmount,
            transactionId,
            transactionType: isPending ? TransactionType.PaymentOneTimePremium : TransactionType.OneTimePremium,
            transactionValue: amount || requestedAmount,
        };
    } catch (error) {
        console.error('getOneTimePremiumSideSheetValues');

        return {};
    }
};
