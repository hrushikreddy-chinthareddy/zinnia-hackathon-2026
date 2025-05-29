import { TFunction } from 'next-i18next';

import { getPaymentMethods } from '@deps/components/history-event-card/history-event-card.helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { Policy, Transaction, TransactionPayor, TransactionType } from '@deps/models/policy/sor-policy';
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

export const getPaymentMethod = (policy: Policy, payors: TransactionPayor[], t: TFunction): string => {
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
        case TransactionType.PaymentInitialPremium:
        case TransactionType.InitialPremium:
            return getInitialPremiumSideSheetValues(policy, transaction, t);
        case TransactionType.PaymentOneTimePremium:
        case TransactionType.OneTimePremium:
            return getOneTimePremiumSideSheetValues(policy, transaction, t, featureFlags || {});
        case TransactionType.SubsequentPayment:
        case TransactionType.SubsequentPremium:
            return getAutopayPremiumSideSheetValues(policy, transaction, t, featureFlags || {});
        case TransactionType.FullSurrender:
        case TransactionType.PartialWithdrawalOneTime:
        case TransactionType.RequiredMinimumDistributionOneTime:
            return getWithdrawalSideSheetValues(policy, transaction, t);
        case TransactionType.FreeLookCancellation:
            return getFreeLookCancellationSideSheetValues(policy, transaction, t);
        case TransactionType.NewLoan:
            return getNewLoanSideSheetValues(policy, transaction, t);
        default:
            return {};
    }
};
