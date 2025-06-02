import { Policy, Transaction, Transaction_Payor, TransactionType } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { getPaymentMethods } from '@deps/components/history-event-card/history-event-card.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { getNewLoanSideSheetValues } from './loan/side-sheet-loan.helpers';
import {
    getAutopayPremiumSideSheetValues,
    getInitialPremiumSideSheetValues,
    getOneTimePremiumSideSheetValues,
} from './premiums/side-sheet-premiums.helpers';
import { TransactionSideSheetValues } from './types';
import { getFreeLookCancellationSideSheetValues, getWithdrawalSideSheetValues } from './withdrawal/side-sheet-withdrawal.helpers';
import { WithdrawalSideSheetValues } from './withdrawal/types';

export const getPaymentMethod = (policy: Policy, payors: Transaction_Payor[], t: TFunction): string => {
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    return paymentMethod
        ? t('historyEventCard.bankingBody', {
              accountType: t(
                  `historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`,
                  paymentMethod.accountType ?? DEFAULT_ERROR_STRING
              ),
              lastFour: formatAccountNumber(paymentMethod.internationalBankAccountNumber ?? paymentMethod.accountNumber, true),
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
        case TransactionType.PAYMENT_INITIAL_PREMIUM:
        case TransactionType.INITIAL_PREMIUM:
            return getInitialPremiumSideSheetValues(policy, transaction, t);
        case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
        case TransactionType.ONE_TIME_PREMIUM:
            return getOneTimePremiumSideSheetValues(policy, transaction, t, featureFlags || {});
        case TransactionType.SUBSEQUENT_PAYMENT:
        case TransactionType.SUBSEQUENT_PREMIUM:
            return getAutopayPremiumSideSheetValues(policy, transaction, t, featureFlags || {});
        case TransactionType.FULL_SURRENDER:
        case TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME:
        case TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME:
            return getWithdrawalSideSheetValues(policy, transaction, t);
        case TransactionType.FREE_LOOK_CANCELLATION:
            return getFreeLookCancellationSideSheetValues(policy, transaction, t);
        case TransactionType.NEW_LOAN:
            return getNewLoanSideSheetValues(policy, transaction, t);
        default:
            return {};
    }
};
