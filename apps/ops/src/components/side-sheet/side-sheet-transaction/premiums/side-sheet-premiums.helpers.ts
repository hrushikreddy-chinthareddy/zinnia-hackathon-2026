import { i18n, TFunction } from 'next-i18next';

import {
    convertKebabedDateString,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import {
    fetchVersionedPolicy,
    getPolicyTransaction,
} from '@deps/queries/api/policies';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
    Transaction,
    TransactionPayor,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

import { getPaymentMethod } from '../side-sheet-transaction.helpers';
import { TransactionSideSheetValues } from '../types';

export const getAutopayPremiumSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    featureFlags: FeatureFlags
): TransactionSideSheetValues => {
    const {
        effectiveDate,
        payors,
        processDate,
        status,
        transactionAmounts,
        transactionId,
        transactionType,
    } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } =
        transactionAmounts ?? {};

    try {
        const isPending = status === TransactionStatus.PENDING;
        const isCanceled = status === TransactionStatus.CANCELED;
        const paymentMethod = getPaymentMethod(
            policy,
            payors as TransactionPayor[],
            t
        );
        const isPayment = transactionType === TransactionTypeSchemaEnum.SUBSEQUENT_PAYMENT;
        const reverseRecreateEnabled =
            featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED];

        return {
            appliedAmount: isPending ? status : appliedAmount,
            effectiveDate: convertKebabedDateString(effectiveDate),
            getAsyncSideSheetValues: async () => {
                const transactionType = await getTransactionType(
                    policy,
                    transaction,
                    t
                );

                return {
                    transactionType,
                };
            },
            paymentMethod,
            processDate: convertKebabedDateString(processDate),
            reverseCta:
                reverseRecreateEnabled &&
                transaction.status === TransactionStatus.COMPLETED
                    ? (t(
                          'policy.history.reverseRecreateSidesheet.reversePayment'
                      ) as string)
                    : undefined,
            reversalTransactionId: isPayment
                ? transactionId
                : transaction.parentId,
            status,
            submittedAmount:
                isCanceled || isPending ? paymentAmount : requestedAmount,
            transactionId,
            transactionValue: isPending ? paymentAmount : appliedAmount,
        };
    } catch (error) {
        console.error('getAutopayPremiumSideSheetValues error', error);

        return {};
    }
};

export const getInitialPremiumSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): TransactionSideSheetValues => {
    const {
        effectiveDate,
        payors,
        processDate,
        status,
        transactionAmounts,
        transactionId,
        transactionType,
    } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } =
        transactionAmounts ?? {};
    const isPending = status === TransactionStatus.PENDING;
    const isCanceled = status === TransactionStatus.CANCELED;

    const amount =
        isCanceled || transactionType === TransactionTypeSchemaEnum.PAYMENT_INITIAL_PREMIUM
            ? paymentAmount
            : appliedAmount;

    const paymentMethod = getPaymentMethod(
        policy,
        payors as TransactionPayor[],
        t
    );

    return {
        appliedAmount: isPending ? status : appliedAmount,
        effectiveDate: convertKebabedDateString(effectiveDate),
        paymentMethod,
        processDate: convertKebabedDateString(processDate),
        status,
        submittedAmount:
            isCanceled || isPending ? paymentAmount : requestedAmount,
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
        const {
            effectiveDate,
            payors,
            processDate,
            status,
            transactionAmounts,
            transactionId,
            transactionType,
        } = transaction ?? {};
        const { appliedAmount, paymentAmount, requestedAmount } =
            transactionAmounts ?? {};

        const isPending = status === ('Pending' as TransactionStatus);
        const isCanceled = status === ('Canceled' as TransactionStatus);
        const isPayment =
            transactionType === TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM;

        const amount = isCanceled || isPayment ? paymentAmount : appliedAmount;

        const reverseRecreateEnabled =
            featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED];

        return {
            appliedAmount: isPending ? status : appliedAmount,
            cancelCta: isPending
                ? (t('policy.history.sidesheet.cancelPayment') as string)
                : undefined,
            effectiveDate: convertKebabedDateString(effectiveDate),
            paymentMethod: getPaymentMethod(
                policy,
                payors as TransactionPayor[],
                t
            ),
            processDate: convertKebabedDateString(processDate),
            reverseCta:
                reverseRecreateEnabled &&
                transaction.status === TransactionStatus.COMPLETED
                    ? (t(
                          'policy.history.reverseRecreateSidesheet.reversePayment'
                      ) as string)
                    : undefined,
            // Payment One Time Premium and One Time Premium are different - we'll need the parentId for Premiums
            reversalTransactionId: isPayment
                ? transactionId
                : transaction.parentId,
            status,
            submittedAmount:
                isCanceled || isPending ? paymentAmount : requestedAmount,
            transactionId,
            transactionType: isPending
                ? TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM
                : TransactionTypeSchemaEnum.ONE_TIME_PREMIUM,
            transactionValue: amount || requestedAmount,
        };
    } catch (error) {
        console.error('getOneTimePremiumSideSheetValues');

        return {};
    }
};

const getTransactionType = async (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): Promise<string> => {
    const { parentId, version } = transaction;
    const [policyForFrequency, parentTransaction] = version
        ? await Promise.all([
              fetchVersionedPolicy(
                  policy.policyNumber as string,
                  policy.product?.planCode as string,
                  version
              ),
              getPolicyTransaction(
                  policy.product?.planCode as string,
                  policy.policyNumber as string,
                  parentId as string
              ),
          ])
        : [policy, transaction];

    const frequency =
        policyForFrequency?.systematicPrograms?.find(
            (program) => program.arrangementId === parentTransaction?.parentId
        )?.frequency ?? '';

    return toSentenceCase(
        i18n
            ?.t('policy.history.sidesheet.autopay', {
                frequency: t(
                    `systematicProgram.frequency.${frequency?.toLowerCase()}`,
                    frequency?.toLowerCase() ?? ''
                ),
            })
            .trim()
    );
};
