import { I18n, TFunction, i18n } from 'next-i18next';

import { getFullName } from '@deps/helpers/party-info-helper';
import { convertKebabedDateString, formatAccountNumber, isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helper';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helper';
import {
    BankAccount,
    Policy,
    PolicyAllOfPartiesItem,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { GetBankAccount, PeopleChangeType } from './types';

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

    const { effectiveDate, payeeOrBeneficiaries, payors, status, transactionAmounts, transactionType } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};

    const isPending = status === ('Pending' as TransactionStatus);
    const isCompleted = status === ('Completed' as TransactionStatus);

    const caption =
        status === ('Processing' as TransactionStatus) ? t('historyEventCard.processing') : convertKebabedDateString(effectiveDate);

    // Taking the first payment method offered by getPaymentMethods here.
    // If there are multiples, this is where they would be truncated.
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    const bankingBody = paymentMethod
        ? t('historyEventCard.bankingBody', {
              accountType: t(`historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`),
              lastFour: formatAccountNumber(paymentMethod.internationalBankAccountNumber ?? paymentMethod.accountNumber, true),
          })
        : null;

    let amount;
    let eventBody;
    let eventTitle;
    let isClickable = false;

    switch (transactionType) {
        case TransactionType.PaymentInitialPremium:
        case TransactionType.InitialPremium:
            amount = transactionType === TransactionType.PaymentInitialPremium ? paymentAmount : appliedAmount;
            eventBody = t('historyEventCard.initialPayment');

            if (bankingBody) eventBody += ` | ${bankingBody}`;

            eventTitle = t('historyEventCard.premiumPayment');
            isClickable = true;
            break;

        case TransactionType.PaymentOneTimePremium:
        case TransactionType.OneTimePremium:
            amount = transactionType === TransactionType.PaymentOneTimePremium ? paymentAmount : appliedAmount;
            eventBody = t('historyEventCard.oneTimePayment');

            if (bankingBody) eventBody += ` | ${bankingBody}`;

            eventTitle = t('historyEventCard.premiumPayment');
            isClickable = true;
            break;

        // Autopay Transactions
        case TransactionType.SubsequentPayment:
        case TransactionType.SubsequentPremium:
            amount = isPending ? paymentAmount : appliedAmount;
            eventBody = bankingBody ?? '';
            eventTitle = t('historyEventCard.premiumAutopay');
            isClickable = true;
            break;

        case TransactionType.FullSurrender:
        case TransactionType.PartialWithdrawalOneTime: {
            const isFullSurrender = transaction?.transactionType === TransactionType.FullSurrender;

            amount = isFullSurrender ? appliedAmount : isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount;

            if (isFullSurrender) {
                eventTitle = t('historyEventCard.surrender');
            } else if (transaction?.transactionType === TransactionType.PartialWithdrawalOneTime) {
                eventTitle = t('historyEventCard.withdrawal');
            }
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });
            eventBody = bankAccount ? eventBankingBody : '';
            isClickable = true;
            break;
        }

        case TransactionType.PaymentLoanRepaymentOneTime:
        case 'LoanRepaymentOneTime' as TransactionType: {
            amount = isPending ? paymentAmount : appliedAmount;

            // TODO MG: dry this up into a single function
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payors });
            const bankingEventBody = t('historyEventCard.oneTimeFromBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            eventBody = bankAccount ? bankingEventBody : t('historyEventCard.oneTimePayment');
            eventTitle = t('historyEventCard.loanPayment');
            break;
        }

        case TransactionType.PaymentSystematicLoanRepayment:
        case TransactionType.SystematicLoanRepayment: {
            amount = requestedAmount;

            const bankAccount = getBankAccount({ policy, payorsOrPayees: payors });

            eventBody = t('historyEventCard.fromBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });
            (eventBody = bankAccount ? eventBody : ''), (eventTitle = t('historyEventCard.loanAutopay'));
            break;
        }

        case TransactionType.NewLoan: {
            amount = isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount;
            eventTitle = t('historyEventCard.loan');
            isClickable = true;
            break;
        }

        case TransactionType.Activation:
            eventTitle = t('historyEventCard.policyActivation');
            break;

        case TransactionType.Anniversary:
            eventTitle = t('historyEventCard.policyAnniversary');
            break;

        case TransactionType.DeathClaim:
            eventTitle = t('historyEventCard.deathClaim');
            break;

        case TransactionType.Lapse:
            eventTitle = t('historyEventCard.policyLapsed');
            isClickable = true;
            break;

        case TransactionType.AddressChange:
        case TransactionType.EmailChange:
        case TransactionType.PhoneNumberChange:
        case TransactionType.BankAccountChange:
            eventBody = getFullName(getChangedParty(policy, transaction as Transaction) ?? undefined);
            eventTitle = toSentenceCase(getPeopleChangeEventTitle(transaction, t));
            isClickable = true;
            break;

        default:
            eventTitle = t(`historyEventCard.transactionTypes.${transactionType}`, transactionType ?? DEFAULT_ERROR_STRING);
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
