import { I18n, TFunction, i18n } from 'next-i18next';

import { getFullName } from '@deps/helpers/party-info-helpers';
import {
    convertKebabedDateString,
    formatAccountNumber,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';
import { PeopleChangeTransactionTypes } from '@deps/helpers/transaction-types.helpers';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helpers';
import { Payor } from '@deps/models/policy-sor-touchups/Transaction';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { toSentenceCase, toTitleCase } from '@deps/utils/strings';
import {
    BankAccount,
    Policy,
    Party,
    Reason,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@zinnia/api-types/types/sor';

import { GetBankAccount, PeopleChangeType } from './types';

const typeByTransactionType = {
    [TransactionType.ADDRESS_CHANGE]: 'address',
    [TransactionType.EMAIL_CHANGE]: 'email',
    [TransactionType.PHONE_NUMBER_CHANGE]: 'phoneNumber',
    [TransactionType.BANK_ACCOUNT_CHANGE]: 'bankAccount',
    [TransactionType.COMMUNICATION_PREFERENCE_CHANGE]:
        'correspondencePreference',
};

const changeTypeKey = {
    [PeopleChangeType.Add]: 'newX',
    [PeopleChangeType.Remove]: 'xRemoval',
    [PeopleChangeType.Update]: 'xUpdate',
};

export const getPaymentMethods = (
    policy: Policy,
    payors: Payor[] | undefined
): BankAccount[] => {
    if (!policy?.parties?.length || !payors?.length) return [];
    const accounts: BankAccount[] = [];
    // payors is an array.  Grabbing all payment methods associated with any payor here in favor of truncation afterwards.
    payors.forEach((payor) => {
        const payorParty = policy.parties?.find(
            ({ partyId }) => payor.partyId === partyId
        );
        const payorBank = payorParty?.bankDetails?.find(
            ({ bankId }) => payor.bankId === bankId
        );
        payorBank && accounts.push(payorBank);
    });

    return accounts;
};

export const getBankAccount = ({ policy, payorsOrPayees }: GetBankAccount) => {
    if (!policy?.parties?.length || !payorsOrPayees?.length) return;

    const payorOrPayee = payorsOrPayees[0];
    const payorOrPayeeParty = policy.parties.find(
        (party) => party.partyId === payorOrPayee.partyId
    );
    const payorOrPayeeBank = payorOrPayeeParty?.bankDetails?.find(
        (bank) => bank.bankId === payorOrPayee.bankId
    );

    return payorOrPayeeBank;
};

// uses the transaction to determine the type of change that occured
export const getPeopleChangeType = (
    transaction: Transaction
): PeopleChangeType | null => {
    const { partyPolicyChangeReferenceId, partyPolicyNewReferenceId } =
        transaction;
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

export const getPeopleChangeEventTitle = (
    transaction: Transaction,
    t: TFunction
): string => {
    if (!transaction?.transactionType) return DEFAULT_ERROR_STRING;

    const changeType = getPeopleChangeType(transaction);
    const typeKey =
        typeByTransactionType[
            transaction.transactionType as keyof typeof typeByTransactionType
        ];

    if (!changeType) return t(`policy.history.sidesheet.${typeKey}`);

    return t(
        `policy.history.sidesheet.${
            changeTypeKey[
                getPeopleChangeType(
                    transaction as Transaction
                ) as PeopleChangeType
            ]
        }`,
        {
            x: t(`policy.history.sidesheet.${typeKey}`),
        }
    );
};

// uses the transaction to find the affected party in a policy for a people transaction
export const getChangedParty = (
    policy: Policy,
    transaction: Transaction
): Party | null => {
    return (
        policy?.parties?.find((p) => p.partyId === transaction.partyId) ?? null
    );
};

export const getEventTitle = (
    transaction: Transaction,
    t: TFunction
): string => {
    const { transactionType } = transaction;

    if (
        PeopleChangeTransactionTypes.includes(
            transactionType as TransactionType
        )
    ) {
        return toSentenceCase(getPeopleChangeEventTitle(transaction, t));
    }

    return t(
        `historyEventCard.transactionTypes.${transactionType}`,
        transactionType || DEFAULT_ERROR_STRING
    );
};

export interface EventCardValues {
    amount?: number;
    requestedAmount?: number;
    caption: string;
    eventBody?: string;
    eventTitle?: string;
    isClickable: boolean;
    isCompleted: boolean;
    isPending: boolean;
}

export const getHistoryEventCardValues = (
    policy: Policy,
    transaction: Transaction
): EventCardValues => {
    const { t } = i18n as I18n;
    const { systematicPrograms } = policy;
    const {
        effectiveDate,
        payors,
        payeeOrBeneficiaries,
        status,
        transactionAmounts,
        transactionType,
    } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } =
        transactionAmounts ?? {};
    const isPending = status === TransactionStatus.PENDING;
    const isCompleted = status === TransactionStatus.COMPLETED;

    const caption =
        status === ('Processing' as TransactionStatus)
            ? t('historyEventCard.processing')
            : convertKebabedDateString(effectiveDate);

    // Taking the first payment method offered by getPaymentMethods here.
    // If there are multiples, this is where they would be truncated.
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    const bankingBody = paymentMethod
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
        : null;

    let amount;
    let eventBody;

    let isClickable = false;
    const eventTitle = getEventTitle(transaction, t);

    switch (transactionType) {
        case TransactionType.PAYMENT_INITIAL_PREMIUM:
        case TransactionType.INITIAL_PREMIUM:
            amount =
                transactionType === TransactionType.PAYMENT_INITIAL_PREMIUM
                    ? paymentAmount
                    : appliedAmount;
            eventBody = bankingBody ?? '';
            isClickable = true;
            break;

        case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
        case TransactionType.ONE_TIME_PREMIUM:
            amount =
                transactionType === TransactionType.PAYMENT_ONE_TIME_PREMIUM
                    ? paymentAmount
                    : appliedAmount;
            eventBody = bankingBody ?? '';
            isClickable = true;
            break;

        case TransactionType.SUBSEQUENT_PREMIUM: {
            const systematicProgram = systematicPrograms?.find(
                (sp) => sp.reason === Reason.PREMIUM
            );

            amount = appliedAmount;
            eventBody = toTitleCase(systematicProgram?.frequency);

            if (bankingBody) eventBody += ` | ${bankingBody}`;
            isClickable = true;
            break;
        }

        case TransactionType.SUBSEQUENT_PAYMENT: {
            const systematicProgram = systematicPrograms?.find(
                (sp) => sp.reason === Reason.PREMIUM
            );

            amount = paymentAmount;
            eventBody = toTitleCase(systematicProgram?.frequency);

            if (bankingBody) eventBody += ` | ${bankingBody}`;
            isClickable = true;
            break;
        }

        case TransactionType.FULL_SURRENDER: {
            // try to cache this so isnt being called so many times
            const bankAccount = getBankAccount({
                policy,
                payorsOrPayees: payeeOrBeneficiaries,
            });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(
                    bankAccount?.accountType,
                    t
                ).toLowerCase(),
                lastFour: formatAccountNumber(
                    bankAccount?.internationalBankAccountNumber ??
                        bankAccount?.accountNumber,
                    true
                ),
            });
            eventBody = bankAccount ? eventBankingBody : '';

            amount = appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME:
        case TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME:
        case TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL:
        case TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP:
        case TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION:
        case TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP: {
            const bankAccount = getBankAccount({
                policy,
                payorsOrPayees: payeeOrBeneficiaries,
            });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(
                    bankAccount?.accountType,
                    t
                ).toLowerCase(),
                lastFour: formatAccountNumber(
                    bankAccount?.internationalBankAccountNumber ??
                        bankAccount?.accountNumber,
                    true
                ),
            });
            eventBody = bankAccount ? eventBankingBody : '';
            amount = isPending
                ? requestedAmount
                    ? -requestedAmount
                    : requestedAmount
                : appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.PAYMENT_LOAN_REPAYMENT_ONE_TIME:
        case TransactionType.LOAN_REPAYMENT_ONE_TIME: {
            amount =
                isPending ||
                transactionType ===
                    TransactionType.PAYMENT_LOAN_REPAYMENT_ONE_TIME
                    ? paymentAmount
                    : appliedAmount;
            eventBody = bankingBody ?? t('historyEventCard.oneTimePayment');
            break;
        }

        case TransactionType.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT:
        case TransactionType.SYSTEMATIC_LOAN_REPAYMENT: {
            amount = appliedAmount || requestedAmount;
            eventBody = bankingBody ?? '';
            break;
        }

        case TransactionType.NEW_LOAN: {
            amount = isPending
                ? requestedAmount
                    ? -requestedAmount
                    : requestedAmount
                : appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.ACTIVATION:
            break;

        case TransactionType.ANNIVERSARY:
            break;

        case TransactionType.DEATH_CLAIM:
            break;

        case TransactionType.LAPSE:
            isClickable = true;
            break;

        case TransactionType.ADDRESS_CHANGE:
        case TransactionType.EMAIL_CHANGE:
        case TransactionType.PHONE_NUMBER_CHANGE:
        case TransactionType.BANK_ACCOUNT_CHANGE:
            eventBody = getFullName(
                getChangedParty(policy, transaction as Transaction) ?? undefined
            );

            isClickable = true;
            break;
        case TransactionType.FREE_LOOK_CANCELLATION: {
            const bankAccount = getBankAccount({
                policy,
                payorsOrPayees: payeeOrBeneficiaries,
            });
            const eventBankingBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(
                    bankAccount?.accountType,
                    t
                ).toLowerCase(),
                lastFour: formatAccountNumber(
                    bankAccount?.internationalBankAccountNumber ??
                        bankAccount?.accountNumber,
                    true
                ),
            });

            eventBody = eventBankingBody;
            amount = transaction.transactionAmounts?.appliedAmount;
            isClickable = true;
            break;
        }

        case TransactionType.DISBURSEMENT: {
            // The applied amount for disbursements is tied to each beneficiary, so we have to loop through.
            // this is almost always only 1 (it may always only be 1, but let's be careful).
            const totalAppliedAmount = payeeOrBeneficiaries?.reduce(
                (acc, payeeOrBeneficiary) => {
                    return acc + (payeeOrBeneficiary.disbursementAmount || 0);
                },
                0
            );
            amount = totalAppliedAmount;
            break;
        }

        default:
            if (!isNullEmptyOrUndefined(appliedAmount)) {
                amount = appliedAmount;
            }
            break;
    }

    return {
        amount,
        requestedAmount,
        caption,
        eventBody,
        eventTitle,
        isClickable,
        isCompleted,
        isPending,
    };
};
