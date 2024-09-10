import { I18n, TFunction, i18n } from 'next-i18next';

import SideSheetFinancialTransaction, {
    FinancialTransactionSidesheetValues,
} from '@deps/components/side-sheet/transaction/sidesheet-financial-transaction';
import SideSheetNonFinancialTransaction from '@deps/components/side-sheet/transaction/sidesheet-non-financial-transaction';
import { getFullName } from '@deps/helpers/party-info-helper';
import { convertKebabedDateString, formatAccountNumber, toSentenceCase, toTitleCase } from '@deps/helpers/string.helper';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helper';
import {
    AccountType,
    BankAccount,
    DisbursementType,
    Policy,
    PolicyAllOfPartiesItem,
    Transaction,
    TransactionPayeeOrBeneficiariesItem,
    TransactionPayor,
    TransactionStatus,
    TransactionType,
} from '@deps/models/policy/sor-policy';
import { fetchVersionedPolicy, getPolicyTransaction } from '@deps/queries/api/policies';
import { getLoanInterestRate } from '@deps/queries/api/product-rate';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import SideSheetNewLoanTransaction, {
    NewLoanTransactionSidesheetValues,
    PayeeParty,
} from '../side-sheet/transaction/sidesheet-newloan-transaction';

interface GetBankAccount {
    policy: Policy;
    payorsOrPayees?: TransactionPayor[] | TransactionPayeeOrBeneficiariesItem[];
}

export enum PeopleChangeType {
    Update = 'update',
    Add = 'add',
    Remove = 'remove',
}

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

const getPeopleChangeEventTitle = (transaction: Transaction | undefined, t: TFunction): string => {
    if (!transaction?.transactionType) return DEFAULT_ERROR_STRING;
    const changeType = getPeopleChangeType(transaction);
    const typeKey = typeByTransactionType[transaction.transactionType as keyof typeof typeByTransactionType];
    if (!changeType) return toSentenceCase(t(`policy.history.sidesheet.${typeKey}`) as string);
    return toSentenceCase(
        t(`policy.history.sidesheet.${changeTypeKey[getPeopleChangeType(transaction as Transaction) as PeopleChangeType]}`, {
            x: t(`policy.history.sidesheet.${typeKey}`),
        }) as string
    );
};

// uses the transaction to find the affected party in a policy for a people transaction
export const getChangedParty = (policy: Policy, transaction: Transaction): PolicyAllOfPartiesItem | null => {
    return policy?.parties?.find(p => p.partyId === transaction.partyId) ?? null;
};

export const getEventCardValues = (policy: Policy, transaction: Transaction | undefined, refreshTransactions?: () => void) => {
    const { t } = i18n as I18n;

    const {
        effectiveDate,
        parentId,
        payeeOrBeneficiaries,
        payors,
        processDate,
        status,
        transactionAmounts,
        transactionId,
        transactionType,
        version,
    } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};

    const isPending = status === ('Pending' as TransactionStatus);

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
    let isClickable;
    let sideSheetTitle;
    let sideSheetValues;
    let sideSheetContent;

    switch (transactionType) {
        case TransactionType.PaymentInitialPremium:
        case TransactionType.InitialPremium:
            amount = transactionType === TransactionType.PaymentInitialPremium ? paymentAmount : appliedAmount;
            eventBody = t('historyEventCard.initialPayment');
            if (bankingBody) eventBody += ` | ${bankingBody}`;
            eventTitle = t('historyEventCard.premiumPayment');
            isClickable = true;
            sideSheetTitle = t('policy.history.sidesheet.premiumPaymentDetails');
            sideSheetValues = {
                appliedAmount: isPending ? status : appliedAmount,
                effectiveDate: convertKebabedDateString(effectiveDate),
                paymentMethod: bankingBody,
                processDate: convertKebabedDateString(processDate),
                status: transaction?.status,
                submittedAmount: amount,
                transactionId,
                transactionType: t('policy.history.sidesheet.initialPremium'),
                transactionValue: amount,
            } as FinancialTransactionSidesheetValues;
            sideSheetContent = (
                <SideSheetFinancialTransaction
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    refreshTransactions={refreshTransactions}
                    values={sideSheetValues}
                />
            );
            break;

        // One-time Premium Transactions
        case TransactionType.PaymentOneTimePremium:
        case TransactionType.OneTimePremium:
            amount = transactionType === TransactionType.PaymentOneTimePremium ? paymentAmount : appliedAmount;
            eventBody = t('historyEventCard.oneTimePayment');
            if (bankingBody) eventBody += ` | ${bankingBody}`;
            eventTitle = t('historyEventCard.premiumPayment');
            isClickable = true;
            sideSheetTitle = t('policy.history.sidesheet.premiumPaymentDetails');
            sideSheetValues = {
                appliedAmount: isPending ? status : appliedAmount,
                cancelCta: isPending ? t('policy.history.sidesheet.cancelPayment') : null,
                effectiveDate: convertKebabedDateString(effectiveDate),
                paymentMethod: bankingBody,
                processDate: convertKebabedDateString(processDate),
                submittedAmount: amount || requestedAmount,
                status: transaction?.status,
                transactionId,
                transactionType: t(
                    isPending ? 'policy.history.sidesheet.paymentOneTimePremium' : 'policy.history.sidesheet.oneTimePremium'
                ),
                transactionValue: amount || requestedAmount,
            } as FinancialTransactionSidesheetValues;
            sideSheetContent = (
                <SideSheetFinancialTransaction
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    refreshTransactions={refreshTransactions}
                    values={sideSheetValues}
                />
            );
            break;

        // Autopay Transactions
        case TransactionType.SubsequentPayment:
        case TransactionType.SubsequentPremium:
            amount = isPending ? paymentAmount : appliedAmount;
            eventBody = bankingBody ?? '';
            eventTitle = t('historyEventCard.premiumAutopay');
            isClickable = true;
            sideSheetTitle = t('policy.history.sidesheet.premiumAutopayDetails');
            sideSheetValues = {
                appliedAmount: isPending ? status : appliedAmount,
                effectiveDate: convertKebabedDateString(effectiveDate),
                paymentMethod: bankingBody,
                processDate: convertKebabedDateString(processDate),
                status: transaction?.status,
                submittedAmount: isPending ? paymentAmount : requestedAmount,
                transactionId,
                transactionValue: amount,
                getAsyncSideSheetValues: async () => {
                    try {
                        const [policyForFrequency, parentTransaction] = version
                            ? await Promise.all([
                                  fetchVersionedPolicy(policy.policyNumber as string, policy.product?.planCode as string, version),
                                  getPolicyTransaction(
                                      policy.product?.planCode as string,
                                      policy.policyNumber as string,
                                      parentId as string
                                  ),
                              ])
                            : [policy, transaction];

                        const frequency =
                            policyForFrequency?.systematicPrograms?.find(program => program.arrangementId === parentTransaction?.parentId)
                                ?.frequency ?? '';

                        return {
                            transactionType: toSentenceCase(
                                i18n
                                    ?.t('policy.history.sidesheet.autopay', {
                                        frequency: t(
                                            `systematicProgram.frequency.${frequency?.toLowerCase()}`,
                                            frequency?.toLowerCase() ?? ''
                                        ),
                                    })
                                    .trim()
                            ),
                        };
                    } catch (e) {
                        console.error('Error retrieving async values for history sidesheet', e);
                        return {};
                    }
                },
            } as FinancialTransactionSidesheetValues;
            sideSheetContent = (
                <SideSheetFinancialTransaction
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    refreshTransactions={refreshTransactions}
                    values={sideSheetValues}
                />
            );
            break;

        case TransactionType.FullSurrender: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });

            const eventBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            return {
                amount: appliedAmount,
                caption,
                eventBody: bankAccount ? eventBody : '',
                eventTitle: t('historyEventCard.surrender'),
                isClickable: false,
                isPending,
            };
        }

        case TransactionType.PartialWithdrawalOneTime: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });

            const eventBody = t('historyEventCard.toBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            return {
                // requestedAmount is a positive number, appliedAmount is a negative number
                amount: isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount,
                caption,
                eventBody: bankAccount ? eventBody : '',
                eventTitle: t('historyEventCard.withdrawal'),
                isClickable: false,
                isPending,
            };
        }

        case TransactionType.PaymentLoanRepaymentOneTime:
        case 'LoanRepaymentOneTime' as TransactionType: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payors });

            const eventBody = t('historyEventCard.oneTimeFromBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            return {
                amount: isPending ? paymentAmount : appliedAmount,
                caption,
                eventBody: bankAccount ? eventBody : t('historyEventCard.oneTimePayment'),
                eventTitle: t('historyEventCard.loanPayment'),
                isClickable: false,
                isPending,
            };
        }

        case TransactionType.PaymentSystematicLoanRepayment:
        case TransactionType.SystematicLoanRepayment: {
            const bankAccount = getBankAccount({ policy, payorsOrPayees: payors });

            const eventBody = t('historyEventCard.fromBanking', {
                accountType: mapAccountTypeToTranslation(bankAccount?.accountType, t).toLowerCase(),
                lastFour: formatAccountNumber(bankAccount?.internationalBankAccountNumber ?? bankAccount?.accountNumber, true),
            });

            return {
                amount: requestedAmount,
                caption,
                eventBody: bankAccount ? eventBody : '',
                eventTitle: t('historyEventCard.loanAutopay'),
                isClickable: false,
                isPending,
            };
        }

        case TransactionType.NewLoan: {
            amount = isPending ? (requestedAmount ? -requestedAmount : requestedAmount) : appliedAmount;
            eventTitle = t('historyEventCard.loan');
            isClickable = true;

            const partyIds: string[] = payeeOrBeneficiaries?.map(item => item.partyId).filter((id): id is string => id !== undefined) || [];
            const bankIds: string[] = payeeOrBeneficiaries?.map(item => item.bankId).filter((id): id is string => id !== undefined) || [];

            const findPartyStateAndBankDetails = (partyIds: string[], bankIds: string[]) => {
                const results: PayeeParty[] = [];

                partyIds.forEach(partyId => {
                    const party = policy.parties?.find(party => party.partyId === partyId);
                    if (party) {
                        const bankDetails = party.bankDetails?.find(bank => bankIds.includes(bank.bankId as string));
                        const payee = transaction?.payeeOrBeneficiaries?.filter(party => party.partyId === partyId)[0];
                        results.push({
                            partyId: party.partyId as string,
                            allocationPercentage: payee?.allocationPercentage,
                            disbursementAmount:
                                status === TransactionStatus.Pending ? transactionAmounts?.requestedAmount : payee?.disbursementAmount,
                            bankDetails: {
                                branchName: bankDetails?.branchName as string,
                                nameOnAccount: bankDetails?.nameOnAccount as string,
                                accountNumber: bankDetails?.accountNumber as string,
                                accountType: bankDetails?.accountType as AccountType,
                            },
                        });
                    }
                });

                return results;
            };

            const totalCharges = transaction?.charges
                ? transaction.charges.reduce((acc, charge) => {
                      const amount = charge.chargeAmount;
                      return acc + (typeof amount === 'number' ? amount : 0);
                  }, 0)
                : 0;

            const calculateProcessedAmount = () => {
                if (transaction?.status === TransactionStatus.Pending) {
                    return null;
                } else if (transactionAmounts?.disbursementType === DisbursementType.GROSS) {
                    return transactionAmounts?.requestedAmount;
                } else if (transactionAmounts?.disbursementType === DisbursementType.NET) {
                    return transactionAmounts?.requestedAmount || 0 + totalCharges;
                }
            };

            const calculateProcessDate = () => {
                if (transaction?.status === TransactionStatus.Pending) {
                    return DEFAULT_ERROR_STRING;
                }
                return convertKebabedDateString(processDate);
            };

            const payeeParties = findPartyStateAndBankDetails(partyIds, bankIds);
            sideSheetTitle = t('policy.history.newloanSidesheet.title');
            sideSheetValues = {
                loanAmount: transactionAmounts?.requestedAmount,
                processedAmount: calculateProcessedAmount(), 
                effectiveDate: convertKebabedDateString(effectiveDate),
                processDate: calculateProcessDate(),
                status: transaction?.status,
                payees: payeeParties,
                loanInterestType: transactionAmounts?.loanInterestType,
                fundDisbursementType: t('policy.history.newloanSidesheet.proRata'),
                getAsyncSideSheetValues: async () => {
                    try {
                        const loanInterestRate = await getLoanInterestRate(policy, policy?.policyDates?.issueDate);
                        return {
                            interestRate: loanInterestRate,
                        };
                    } catch (err) {
                        console.log('Error fetching interest rate', err);
                        return {};
                    }
                },
            } as NewLoanTransactionSidesheetValues;
            sideSheetContent = <SideSheetNewLoanTransaction values={sideSheetValues} />;
            break;
        }

        case TransactionType.Activation:
            eventTitle = t('historyEventCard.policyActivation');
            isClickable = false;
            break;
        case TransactionType.Anniversary:
            eventTitle = t('historyEventCard.policyAnniversary');
            isClickable = false;
            break;
        case TransactionType.DeathClaim:
            eventTitle = t('historyEventCard.deathClaim');
            isClickable = false;
            break;
        case TransactionType.Lapse:
            eventTitle = t('historyEventCard.policyLapsed');
            isClickable = true;
            sideSheetTitle = toTitleCase(eventTitle);
            sideSheetContent = <SideSheetNonFinancialTransaction policy={policy} transaction={transaction as Transaction} />;
            break;
        case TransactionType.AddressChange:
        case TransactionType.EmailChange:
        case TransactionType.PhoneNumberChange:
        case TransactionType.BankAccountChange:
            eventTitle = getPeopleChangeEventTitle(transaction, t);
            eventBody = getFullName(getChangedParty(policy, transaction as Transaction) ?? undefined);
            isClickable = true;
            sideSheetTitle = toTitleCase(eventTitle);
            sideSheetContent = <SideSheetNonFinancialTransaction policy={policy} transaction={transaction as Transaction} />;
            break;

        default:
            eventTitle = transactionType ?? DEFAULT_ERROR_STRING;
            isClickable = false;
            break;
    }

    return {
        amount,
        caption,
        eventBody,
        eventTitle,
        isClickable,
        isPending,
        sideSheetContent,
        sideSheetTitle,
    };
};
