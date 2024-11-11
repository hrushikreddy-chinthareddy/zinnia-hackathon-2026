import dayjs from 'dayjs';
import { i18n, TFunction } from 'next-i18next';

import { getPaymentMethods, getPeopleChangeEventTitle } from "@deps/components/history-event-card/history-event-card.helper";
import { convertToChipText } from "@deps/containers/people-sub-page/people-sub-page.helpers";
import { getFullName } from "@deps/helpers/party-info-helper";
import { orderObjectsByString } from "@deps/helpers/sort.helper";
import { convertKebabedDateString, formatAccountNumber, toSentenceCase, toTitleCase } from "@deps/helpers/string.helper";
import { Policy, Transaction, TransactionPayor, TransactionStatus, TransactionType } from "@deps/models/policy/sor-policy";
import { fetchVersionedPolicy, getPolicyTransaction } from "@deps/queries/api/policies";
import { DEFAULT_ERROR_STRING, ZAHARA_API_DATE_FORMAT } from "@deps/types/constants";
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { getInitialPremiumSideSheetValues, getOneTimePremiumSideSheetValues } from './premiums/side-sheet-premiums.helper';
import { NonFianancialTransactionSideSheetValues, ReverseTransactionSidesheetValues, TransactionSideSheetValues } from "./types";
import { getWithdrawalSideSheetValues } from './withdrawal/side-sheet-withdrawal.helper';
import { WithdrawalSideSheetValues } from './withdrawal/types';

export const getTransactionSideSheetTitle = (transaction: Transaction, t: TFunction): string => {
    const { transactionType } = transaction;

    switch (transactionType) {
        case TransactionType.PaymentInitialPremium:
        case TransactionType.InitialPremium:
            return t('policy.history.sidesheet.premiumPaymentDetails');

        case TransactionType.PaymentOneTimePremium:
        case TransactionType.OneTimePremium:
            return t('policy.history.sidesheet.premiumPaymentDetails');

        case TransactionType.FullSurrender:
            return t('historyEventCard.surrender');

        case TransactionType.PartialWithdrawalOneTime:
            return t('historyEventCard.withdrawal');

        case TransactionType.SubsequentPayment:
        case TransactionType.SubsequentPremium:
            return t('policy.history.sidesheet.premiumAutopayDetails');

        case TransactionType.NewLoan:
            return t('policy.history.newLoanSideSheet.title');

        case TransactionType.Lapse:
            return toTitleCase(t('historyEventCard.policyLapsed') as string);

        case TransactionType.AddressChange:
        case TransactionType.EmailChange:
        case TransactionType.PhoneNumberChange:
        case TransactionType.BankAccountChange:
            return toTitleCase(getPeopleChangeEventTitle(transaction, t));

        default:
            return DEFAULT_ERROR_STRING;
    }
};

export const getPaymentMethod = (policy: Policy, payors: TransactionPayor[], t: TFunction): string => {
    const [paymentMethod] = getPaymentMethods(policy, payors) ?? [];

    return paymentMethod
        ? t('historyEventCard.bankingBody', {
<<<<<<< HEAD
              accountType: t(`historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`),
              lastFour: formatAccountNumber(paymentMethod.internationalBankAccountNumber ?? paymentMethod.accountNumber, true),
          })
        : DEFAULT_ERROR_STRING;
};
=======
            accountType: t(`historyEventCard.bankAccountTypes.${paymentMethod.accountType?.toLowerCase()}`),
            lastFour: formatAccountNumber(paymentMethod.internationalBankAccountNumber ?? paymentMethod.accountNumber, true),
        }) : DEFAULT_ERROR_STRING;
}
>>>>>>> dev

const getTransactionType = async (policy: Policy, transaction: Transaction, t: TFunction): Promise<string> => {
    const { parentId, version } = transaction;
    const [policyForFrequency, parentTransaction] = version
        ? await Promise.all([
              fetchVersionedPolicy(policy.policyNumber as string, policy.product?.planCode as string, version),
              getPolicyTransaction(policy.product?.planCode as string, policy.policyNumber as string, parentId as string),
          ])
        : [policy, transaction];

    const frequency =
        policyForFrequency?.systematicPrograms?.find(program => program.arrangementId === parentTransaction?.parentId)?.frequency ?? '';

    return toSentenceCase(
        i18n
            ?.t('policy.history.sidesheet.autopay', {
                frequency: t(`systematicProgram.frequency.${frequency?.toLowerCase()}`, frequency?.toLowerCase() ?? ''),
            })
            .trim()
    );
};

// TODO MG: these can be consolidated a bit
// amount/submitted amount/transactionType seem to be the only different ones
const getAutopayPremiumSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    featureFlags: FeatureFlags
): TransactionSideSheetValues => {
    const { effectiveDate, payors, processDate, status, transactionAmounts, transactionId, transactionType } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts ?? {};

    try {
        const isPending = status === ('Pending' as TransactionStatus);
        const paymentMethod = getPaymentMethod(policy, payors as TransactionPayor[], t);
        const isPayment = transactionType === TransactionType.SubsequentPayment;
        const reverseRecreateEnabled = featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED];
    
        return {
            appliedAmount: isPending ? status : appliedAmount,
            effectiveDate: convertKebabedDateString(effectiveDate),
            getAsyncSideSheetValues: async () => {
                const transactionType = await getTransactionType(policy, transaction, t);
    
                return {
                    transactionType,
                };
            },
            paymentMethod,
            processDate: convertKebabedDateString(processDate),
            reverseCta:
                reverseRecreateEnabled && transaction.status === TransactionStatus.Completed
                    ? t('policy.history.reverseRecreateSidesheet.reversePayment') as string
                    : undefined,
            reversalTransactionId: isPayment ? transactionId : transaction.parentId,
            status,
            submittedAmount: isPending ? paymentAmount : requestedAmount,
            transactionId,
            transactionValue: isPending ? paymentAmount : appliedAmount,
        };
    } catch (error) {
        console.error('getAutopayPremiumSideSheetValues error', error);

<<<<<<< HEAD
    return transactionType === TransactionType.FullSurrender
        ? await validateFullSurrenderWithdrawal(
              policy.product?.planCode,
              policy.policyNumber,
              requestBody as FullSurrenderWithdrawalRequestQuery
          )
        : await validatePartialWithdrawalOneTime(
              policy.product?.planCode,
              policy.policyNumber,
              requestBody as PartialWithdrawalOneTimeRequestQuery
          );
};

const getWithdrawalTotalPayment = (
    transaction: Transaction,
    quote?: FullSurrenderQuoteResponse | PartialWithdrawalOneTimeQuoteResponse
): string | number => {
    let totalPayment: number | string = 0;

    const { charges, status, taxWithheldAmounts, transactionAmounts, transactionType } = transaction;
    const { appliedAmount, disbursementType, requestedAmount } = transactionAmounts ?? {};
    const federalTaxDollar =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.FEDERAL)?.[0].withheldAmount || 0;
    const stateTaxDollar =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.STATE)?.[0].withheldAmount || 0;
    const quoteFederalTaxAmounts = quote?.taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.FEDERAL);
    const quoteStateTaxAmounts = quote?.taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.STATE);

    const totalChargesWithoutTaxes = charges
        ? charges.reduce((acc, charge) => {
              const amount = charge.chargeAmount;
              return acc + (typeof amount === 'number' ? amount : 0);
          }, 0)
        : 0;
    const netActualWithdrawalAmount = Number(requestedAmount) + federalTaxDollar + stateTaxDollar + totalChargesWithoutTaxes;

    if (status === TransactionStatus.Pending) {
        if (transactionType === TransactionType.FullSurrender) {
            // defaulting to '--' while quote Promise is being fulfilled
            totalPayment = Number(quote?.payeeOrBeneficiary?.[0].disbursementAmount);
        }

        totalPayment =
            disbursementType === DisbursementType.NET
                ? netActualWithdrawalAmount -
                  (totalChargesWithoutTaxes || 0) -
                  // @ts-expect-error API is returning withholdAmount instead of withheldAmount
                  Number(quoteFederalTaxAmounts?.[0].withholdAmount || federalTaxDollar) -
                  // @ts-expect-error API is returning withholdAmount instead of withheldAmount
                  Number(quoteStateTaxAmounts?.[0].withholdAmount || stateTaxDollar)
                : Number(forcePositiveNumber(quote?.transactionAmounts?.appliedAmount || requestedAmount)) -
                  (totalChargesWithoutTaxes || 0) -
                  // @ts-expect-error API is returning withholdAmount instead of withheldAmount
                  Number(quoteFederalTaxAmounts?.[0].withholdAmount || federalTaxDollar) -
                  // @ts-expect-error API is returning withholdAmount instead of withheldAmount
                  Number(quoteStateTaxAmounts?.[0].withholdAmount || stateTaxDollar);
    } else if (status === TransactionStatus.Completed) {
        totalPayment =
            disbursementType === DisbursementType.NET
                ? netActualWithdrawalAmount - (totalChargesWithoutTaxes || 0) - Number(federalTaxDollar || 0) - Number(stateTaxDollar || 0)
                : Number(requestedAmount || forcePositiveNumber(appliedAmount)) -
                  Number(totalChargesWithoutTaxes || 0) -
                  Number(federalTaxDollar || 0) -
                  Number(stateTaxDollar || 0);
    }

    return numberFormatify(totalPayment);
};

const getWithdrawalSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): TransactionSideSheetValues => {
    const {
        charges,
        effectiveDate,
        payeeOrBeneficiaries,
        payors,
        processDate,
        status,
        taxWithheldAmounts,
        taxWithholdingInstructions,
        transactionAmounts,
        transactionId,
        transactionType,
    } = transaction;
    const { appliedAmount, disbursementType, requestedAmount } = transactionAmounts ?? {};
    const isPending = status === ('Pending' as TransactionStatus);
    const bankAccount = getBankAccount({ policy, payorsOrPayees: payeeOrBeneficiaries });
    const payeeParties = findWithdrawalPartyStateAndBankDetails(policy, payeeOrBeneficiaries);
    const paymentMethod = getPaymentMethod(policy, payors as TransactionPayor[], t);

    // Tax Withholding Display Rates and Amounts
    const federalTax = getRequestedWithheldTaxesDisplay(taxWithholdingInstructions || [], TaxWithholdingType.FEDERAL, 0);
    const stateTax = getRequestedWithheldTaxesDisplay(taxWithholdingInstructions || [], TaxWithholdingType.STATE, 0);
    const federalTaxWithheld = getReturnedWithheldTaxesDisplay(taxWithheldAmounts || [], TaxWithholdingType.FEDERAL, 0);
    const stateTaxWithheld = getReturnedWithheldTaxesDisplay(taxWithheldAmounts || [], TaxWithholdingType.STATE, 0);

    const totalChargesWithoutTaxes = charges
        ? charges.reduce((acc, charge) => {
              const amount = charge.chargeAmount;
              return acc + (typeof amount === 'number' ? amount : 0);
          }, 0)
        : 0;
    // TODO MG: dont hardcode party id
    const policyOwner = payeeParties?.find(payee => payee.partyId === 'Party_PI_1');
    const totalPayment = getWithdrawalTotalPayment(transaction);

    return {
        actualAmount: appliedAmount,
        bankDetails: bankAccount,
        cancelCta: isPending && transactionType === TransactionType.FullSurrender ? t('policy.history.sidesheet.cancelSurrender') : null,
        charges,
        disbursementType,
        effectiveDate: convertKebabedDateString(effectiveDate),
        federalTaxWithheld: federalTaxWithheld,
        federalTaxWithholding: federalTax,
        // TODO MG: translate
        fundDisbursementType: disbursementType === DisbursementType.NET ? 'Net' : 'Gross',
        getAsyncSideSheetValues: async () => {
            const validateResponse = await callWithdrawalValidate(policy, transaction, bankAccount?.bankId);

            return {
                quote: validateResponse.quoteResponse,
                totalPayment: getWithdrawalTotalPayment(transaction, validateResponse.quoteResponse),
            };
        },
        payee: policyOwner || ({} as PayeeParty),
        payees: payeeParties as unknown as PayeeParty[],
        paymentMethod,
        processDate: convertKebabedDateString(processDate),
        requestedAmount: numberFormatify(requestedAmount),
        status,
        state: policyOwner?.state || DEFAULT_ERROR_STRING,
        stateTaxWithheld: stateTaxWithheld,
        stateTaxWithholding: stateTax,
        taxWithheldAmounts: taxWithheldAmounts,
        taxWithholdingInstructions: taxWithholdingInstructions,
        totalPayment,
        transactionId: transactionId,
        transactionType,
        withdrawalCharge: numberFormatify(totalChargesWithoutTaxes),
    };
};

export const getNewLoanSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): NewLoanTransactionSideSheetValues => {
    const { effectiveDate, processDate, status, transactionAmounts } = transaction;
    const { requestedAmount, loanInterestType } = transactionAmounts ?? {};

    const payees = findLoansPartyStateAndBankDetails(policy, transaction);

    return {
        effectiveDate: convertKebabedDateString(effectiveDate),
        fundDisbursementType: t('policy.history.newLoanSideSheet.proRata') as string,
        getAsyncSideSheetValues: async () => {
            const interestRate = await getLoanInterestRate(new PolicyDetails(policy), policy?.policyDates?.issueDate);

            return {
                interestRate: interestRate as number,
            };
        },
        loanAmount: requestedAmount,
        loanInterestType: loanInterestType,
        payees,
        // TODO MG: use this for other funcs?
        processDate: calculateProcessDate(processDate as string, status),
        processedAmount: calculateProcessedAmount(transaction),
        status,
    };
=======
        return {};
    }
>>>>>>> dev
};

export const getReverseRecreateTransactionSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): ReverseTransactionSidesheetValues => {
    const { effectiveDate, payors, status, transactionId, transactionType, originalTransactionId } = transaction ?? {};
    const { appliedAmount, paymentAmount, requestedAmount } = transaction.transactionAmounts ?? {};

    const isPending = transaction.status === TransactionStatus.Pending;
    const amount = transactionType === TransactionType.PaymentOneTimePremium ? paymentAmount : appliedAmount;

    const paymentMethod = getPaymentMethod(policy, payors as TransactionPayor[], t);

    const getOriginalTransactionValues = async () => {
        const { policyNumber, product } = policy;
        const originalTransactionValues = await getPolicyTransaction(`${product?.planCode}`, `${policyNumber}`, `${originalTransactionId}`);

        if (!originalTransactionValues) {
            return {};
        }

        // XG: remove process date for now
        // the processDate for this transaction is not necessarily the same as the processDate
        // of this transaction's `reverseInitiator`
        const { status, transactionType, transactionAmounts, /* processDate, */ reversalDate } = originalTransactionValues;

        if (transactionAmounts === undefined) {
            return {};
        }
        const { appliedAmount, paymentAmount, requestedAmount } = transactionAmounts;

        const isPending = status === TransactionStatus.Pending;

        const amount = transactionType === TransactionType.PaymentOneTimePremium ? paymentAmount : appliedAmount;

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
            isPending ? t('policy.history.sidesheet.paymentOneTimePremium') : t('policy.history.sidesheet.oneTimePremium')
        }`,
        newAppliedAmount: amount || requestedAmount,
        paymentMethod: paymentMethod,
        getAsyncSideSheetValues: getOriginalTransactionValues,
        transactionValue: amount || requestedAmount,
    };
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
            return getWithdrawalSideSheetValues(policy, transaction, t);
        default:
            return {};
    }
};

export const getNonFinancialTransactionSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): NonFianancialTransactionSideSheetValues => {
    const { effectiveDate, partyId } = transaction;
    const party = policy.parties?.find(p => p.partyId === partyId);
    const roleTags = orderObjectsByString(
        (policy?.partyRoles || [])?.filter(partyRole => {
            if (partyRole.partyId !== partyId) return false;
            const today = dayjs();

            if (partyRole.endDate) {
                const endDate = dayjs(partyRole.endDate, ZAHARA_API_DATE_FORMAT);
                if (today.isAfter(endDate)) return false;
            }
            return true;
        }),
        (t('colDefs:people.orderedRoles', { returnObjects: true }) as string[]).map(role => role.toUpperCase()),
        'partyRole'
    ).map(partyRole => convertToChipText(partyRole.partyRole, t));

    return {
        effectiveDate: convertKebabedDateString(effectiveDate),
        name: getFullName(party),
        roleTags,
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
    const reverseInitiatorIds = reverseInitiators.map(({ transactionId }: Transaction) => transactionId);

    // if there is no originalTransactionId or reversedTransactionIds, then it is not a reversed transaction
    if (!originalTransactionId?.length || !reverseInitiatorIds?.length) return false;

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
    const parentTransaction = await getPolicyTransaction(planCode, policyNumber, parentId).catch(() => null);

    if (parentTransaction) return replacesReverseInitiator(parentTransaction, reverseInitiators, policy);

    // if none of the above we can be confident
    // this transaction doesn't replace a reverseInitiator
    return false;
};
