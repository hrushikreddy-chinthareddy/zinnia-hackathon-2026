import { toSentenceCase, toTitleCase } from '@zinnia/utils';
import { I18n, TFunction, i18n } from 'next-i18next';

import { getFullName } from '@deps/helpers/party-info-helper';
import { convertKebabedDateString, formatAccountNumber, isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { PeopleChangeTransactionTypes } from '@deps/helpers/transaction-types.helper';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helper';
import {
    BankAccount,
    Policy,
    PolicyAllOfPartiesItem,
    Reason,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@deps/models/policy/sor-policy';

import { GetBankAccount, PeopleChangeType } from './types';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const typeByTransactionType = {
    [TransactionType.AddressChange]: 'address',
    [TransactionType.EmailChange]: 'email',
    [TransactionType.PhoneNumberChange]: 'phoneNumber',
    [TransactionType.BankAccountChange]: 'bankAccount',
    [TransactionType.CommunicationPreferenceChange]: 'correspondencePreference',
};

const changeTypeKey = {
    [PeopleChangeType.Add]: 'newX',
    [PeopleChangeType.Remove]: 'xRemoval',
    [PeopleChangeType.Update]: 'xUpdate',
};

// TODO MG: move to payments helper?
export const getPaymentMethods = (policy: Policy, payors: Transaction['payors']): BankAccount[] => {
    if (!policy?.parties?.length || !payors?.length) return [];
    const accounts: BankAccount[] = [];
    // payors is an array.  Grabbing all payment methods associated with any payor here in favor of truncation afterwards.
    payors.forEach(payor => {
        const payorParty = policy.parties?.find(({ partyId }) => payor.partyId === partyId);
        const payorBank = payorParty?.bankDetails?.find(({ bankId }) => payor.bankId === bankId);
        payorBank && accounts.push(payorBank);
    });

    return accounts;
};

export const getBankAccount = ({ policy, payorsOrPayees }: GetBankAccount) => {
    if (!policy?.parties?.length || !payorsOrPayees?.length) return;

    const payorOrPayee = payorsOrPayees[0];
    const payorOrPayeeParty = policy.parties.find(party => party.partyId === payorOrPayee.partyId);
    const payorOrPayeeBank = payorOrPayeeParty?.bankDetails?.find(bank => bank.bankId === payorOrPayee.bankId);

    return payorOrPayeeBank;
};

// TODO MG: move to non financial helper file
// uses the transaction to determine the type of change that occured
export const getPeopleChangeType = (transaction: Transaction): PeopleChangeType | null => {
    const { partyPolicyChangeReferenceId, partyPolicyNewReferenceId } = transaction;
    if (partyPolicyChangeReferenceId && partyPolicyNewReferenceId) {
        return PeopleChangeType.Update;
    }
    if (partyPolicyNewReferenceId) {
        return PeopleChangeType.Add;
    }
    if (partyPolicyChangeReferenceId) {
        return PeopleChangeType.Remove;
    }
    return null;
};

export const getPeopleChangeEventTitle = (transaction: Transaction, t: TFunction): string => {
    if (!transaction?.transactionType) return DEFAULT_ERROR_STRING;

    const changeType = getPeopleChangeType(transaction);
    const typeKey = typeByTransactionType[transaction.transactionType as keyof typeof typeByTransactionType];

    if (!changeType) return t(`policy.history.sidesheet.${typeKey}`);

    return t(`policy.history.sidesheet.${changeTypeKey[getPeopleChangeType(transaction as Transaction) as PeopleChangeType]}`, {
        x: t(`policy.history.sidesheet.${typeKey}`),
    });
};

// uses the transaction to find the affected party in a policy for a people transaction
export const getChangedParty = (policy: Policy, transaction: Transaction): PolicyAllOfPartiesItem | null => {
    return policy?.parties?.find(p => p.partyId === transaction.partyId) ?? null;
};

export const getEventTitle = (transaction: Transaction, t: TFunction): string => {
    const { transactionType } = transaction;

    if (PeopleChangeTransactionTypes.includes(transactionType as TransactionType)) {
        return toSentenceCase(getPeopleChangeEventTitle(transaction, t));
    }

    return t(`historyEventCard.transactionTypes.${transactionType}`, transactionType || DEFAULT_ERROR_STRING);
};

export interface EventCardValues {
    amount?: number;
    caption: string;
    eventBody?: string;
    eventTitle?: string;
    isClickable: boolean;
    isCompleted: boolean;
    isPending: boolean;
}

export const getHistoryEventCardValues = (policy: Policy, transaction: Transaction): EventCardValues => {
    const { t } = i18n as I18n;
    const { systematicPrograms } = policy;
    const { effectiveDate, payors, payeeOrBeneficiaries, status, transactionAmounts, transactionType } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};
    const isPending = status === TransactionStatus.Pending;
    const isCompleted = status === TransactionStatus.Completed;

    const caption =
        status === ('Processing' as TransactionStatus) ? t('historyEventCard.processing') : convertKebabedDateString(effectiveDate);

    // Taking the first payment method offered by getPaymentMethods here.
    // If there are multiples, this is where they would be truncated.
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    const bankingBody = paymentMethod
        ? t('historyEventCard.bankingBody', {
              accountType: t(
                  `historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`,
                  paymentMethod.accountType ?? DEFAULT_ERROR_STRING
              ),
              lastFour: formatAccountNumber(paymentMethod.internationalBankAccountNumber ?? paymentMethod.accountNumber, true),
          })
        : null;

    let amount;
    let eventBody;

    let isClickable = false;
    const eventTitle = getEventTitle(transaction, t);

    switch (transactionType) {
        case TransactionType.PaymentInitialPremium:
        case TransactionType.InitialPremium:
            amount = transactionType === TransactionType.PaymentInitialPremium ? paymentAmount : appliedAmount;
            eventBody = bankingBody ?? '';
            isClickable = true;
            break;

        case TransactionType.PaymentOneTimePremium:
        case TransactionType.OneTimePremium:
            amount = transactionType === TransactionType.PaymentOneTimePremium ? paymentAmount : appliedAmount;
            eventBody = bankingBody ?? '';
            isClickable = true;
            break;

        case TransactionType.SubsequentPayment:
        case TransactionType.SubsequentPremium: {
            const systematicProgram = systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);

            amount = systematicProgram?.amount;
            eventBody = toTitleCase(systematicProgram?.frequency);

            if (bankingBody) eventBody += ` | ${bankingBody}`;
            isClickable = true;
            break;
        }

        case TransactionType.FullSurrender: {
            // TODO MG: can we use paymentMethod or do we have to pass in payeeOrBeneficiaries for withdrawals?
            // try to cache this so isnt being called so many times
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });
            eventBody = bankAccount ? eventBankingBody : '';

            amount = appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.PartialWithdrawalOneTime: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });
            eventBody = bankAccount ? eventBankingBody : '';
            amount = isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.PaymentLoanRepaymentOneTime:
        case TransactionType.LoanRepaymentOneTime: {
            amount = isPending || transactionType === TransactionType.PaymentLoanRepaymentOneTime ? paymentAmount : appliedAmount;
            eventBody = bankingBody ?? t('historyEventCard.oneTimePayment');
            break;
        }

        case TransactionType.PaymentSystematicLoanRepayment:
        case TransactionType.SystematicLoanRepayment: {
            amount = requestedAmount;
            eventBody = bankingBody ?? '';
            break;
        }

        case TransactionType.NewLoan: {
            amount = isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.Activation:
            break;

        case TransactionType.Anniversary:
            break;

        case TransactionType.DeathClaim:
            break;

        case TransactionType.Lapse:
            isClickable = true;
            break;

        case TransactionType.AddressChange:
        case TransactionType.EmailChange:
        case TransactionType.PhoneNumberChange:
        case TransactionType.BankAccountChange:
            eventBody = getFullName(getChangedParty(policy, transaction as Transaction) ?? undefined);

            isClickable = true;
            break;
        case TransactionType.FreeLookCancellation: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            eventBody = eventBankingBody;
            amount = transaction.transactionAmounts?.appliedAmount;
            isClickable = true;
            break;
        }

        default:
            if (!isNullEmptyOrUndefined(appliedAmount)) {
                amount = appliedAmount;
            } else if (!isNullEmptyOrUndefined(requestedAmount)) {
                amount = requestedAmount;
            }
            break;
    }

    return {
        amount,
        caption,
        eventBody,
        eventTitle,
        isClickable,
        isCompleted,
        isPending,
    };
};
