import { TFunction } from 'next-i18next';

import { getPaymentMethods } from '@deps/components/history-event-card/history-event-card.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
    Transaction,
    TransactionPayor,
} from '@zinnia/api-types/types/sor';

import { getNewLoanSideSheetValues } from './loan/side-sheet-loan.helpers';
import {
    getAutopayPremiumSideSheetValues,
    getInitialPremiumSideSheetValues,
    getOneTimePremiumSideSheetValues,
} from './premiums/side-sheet-premiums.helpers';
import { TransactionSideSheetValues } from './types';
import {
    getFreeLookCancellationSideSheetValues,
    getWithdrawalSideSheetValues,
} from './withdrawal/side-sheet-withdrawal.helpers';
import { WithdrawalSideSheetValues } from './withdrawal/types';

export const getPaymentMethod = (
    policy: Policy,
    payors: TransactionPayor[],
    t: TFunction
): string => {
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    return paymentMethod
        ? t('historyEventCard.bankingBody', {
              accountType: t(
                  `historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`,
                  paymentMethod.accountType ?? DEFAULT_ERROR_STRING
              ),
              lastFour: formatAccountNumber(
                  paymentMethod.internationalBankAccountNumber ??
                      paymentMethod.accountNumber,
                  true
              ),
          })
        : DEFAULT_ERROR_STRING;
};

export const getFinancialTransactionSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    featureFlags?: FeatureFlags
): TransactionSideSheetValues | WithdrawalSideSheetValues => {
    const { transactionType } = transaction;

    switch (transactionType) {
        case TransactionTypeSchemaEnum.PAYMENT_INITIAL_PREMIUM:
        case TransactionTypeSchemaEnum.INITIAL_PREMIUM:
            return getInitialPremiumSideSheetValues(policy, transaction, t);
        case TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM:
        case TransactionTypeSchemaEnum.ONE_TIME_PREMIUM:
            return getOneTimePremiumSideSheetValues(
                policy,
                transaction,
                t,
                featureFlags || {}
            );
        case TransactionTypeSchemaEnum.SUBSEQUENT_PAYMENT:
        case TransactionTypeSchemaEnum.SUBSEQUENT_PREMIUM:
            return getAutopayPremiumSideSheetValues(
                policy,
                transaction,
                t,
                featureFlags || {}
            );
        case TransactionTypeSchemaEnum.FULL_SURRENDER:
        case TransactionTypeSchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME:
        case TransactionTypeSchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME:
        case TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL:
        case TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP:
        case TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION:
        case TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP:
            return getWithdrawalSideSheetValues(policy, transaction, t);
        case TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION:
            return getFreeLookCancellationSideSheetValues(
                policy,
                transaction,
                t
            );
        case TransactionTypeSchemaEnum.NEW_LOAN:
            return getNewLoanSideSheetValues(policy, transaction, t);
        default:
            return {};
    }
};
