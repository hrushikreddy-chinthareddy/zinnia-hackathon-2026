import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { getOwnersTaxJurisdictionState } from '@deps/containers/financial-transactions/withdrawal/taxes/taxes.helpers';
import { forcePositiveNumber, negativeNumberFormatify, numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString, toSentenceCase } from '@deps/helpers/string.helper';
import { getRequestedWithheldTaxesDisplay, getTaxWithheldByType } from '@deps/helpers/tax-withholdings.helper';
import {
    AddressType,
    AllocationOption,
    AmountType,
    DisbursementType,
    FullSurrenderQuoteResponse,
    PartialWithdrawalOneTimeQuoteResponse,
    PaymentForm,
    Policy,
    TaxWithholdingType,
    Transaction,
    TransactionChargesItem,
    TransactionPayeeOrBeneficiariesItem,
    TransactionStatus,
    TransactionType,
} from '@deps/models/policy/sor-policy';
import { policyWithdrawalQuote } from '@deps/queries/api/policies';
import { DEFAULT_ERROR_STRING, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    WithdrawalChargesValues,
    WithdrawalDetails,
    WithdrawalDetailsValues,
    WithdrawalQuoteResponse,
    WithdrawalSideSheetValues,
} from './types';
import { PayeePaymentDetails } from '../types';

const getPayeePaymentDetails = (
    policy: Policy,
    t: TFunction,
    totalPayment: number | undefined,
    payeeOrBeneficiaries?: TransactionPayeeOrBeneficiariesItem[]
): PayeePaymentDetails[] => {
    const results: PayeePaymentDetails[] = [];

    const partyIds: string[] = payeeOrBeneficiaries?.map(item => item.partyId).filter((id): id is string => id !== undefined) || [];
    const bankIds: string[] = payeeOrBeneficiaries?.map(item => item.bankId).filter((id): id is string => id !== undefined) || [];

    partyIds.forEach(partyId => {
        const party = policy.parties?.find(party => party.partyId === partyId);

        if (party) {
            const address = party.addresses?.find(address => address.addressType === AddressType.RESIDENCE);
            const bankDetails = party.bankDetails?.find(bank => bankIds.includes(bank.bankId as string));

            results.push({
                partyId: party.partyId as string,
                state: address ? (address.state as string) : (t('policy.history.sidesheet.stateNotFound') as string),
                bankDetails: {
                    branchName: bankDetails?.branchName || '',
                    nameOnAccount: bankDetails?.nameOnAccount as string,
                    accountNumber: bankDetails?.accountNumber as string,
                },
                // Hardcoded total payment amount since we're only supporting one payee at this time
                disbursementAmount: Math.abs(totalPayment || 0),
                // Hardcoded for now since we're only showing one payee
                allocationPercentage: 100,
            });
        }
    });

    return results;
};

const getTaxWithholdings = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    quote?: WithdrawalQuoteResponse
): WithdrawalDetails[] => {
    const ownerTaxState = getOwnersTaxJurisdictionState(policy);

    const { taxWithholdingInstructions } = quote || transaction;

    return [
        {
            label: t('policy.history.withdrawalSidesheet.federalTax') as string,
            tooltipTitle: t('policy.history.withdrawalSidesheet.federalTax') as string,
            tooltipBody: t('policy.history.withdrawalSidesheet.federalTaxTooltip') as string,
            value: getRequestedWithheldTaxesDisplay(taxWithholdingInstructions, TaxWithholdingType.FEDERAL, DEFAULT_ERROR_STRING),
        },
        {
            label: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: ownerTaxState }) as string,
            tooltipTitle: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: ownerTaxState }) as string,
            tooltipBody: t('policy.history.withdrawalSidesheet.stateTaxTooltip') as string,
            value: getRequestedWithheldTaxesDisplay(taxWithholdingInstructions, TaxWithholdingType.STATE, DEFAULT_ERROR_STRING),
            sentenceCase: false,
        },
    ];
};

const getWithdrawalDetails = (values: WithdrawalDetailsValues, t: TFunction): WithdrawalDetails[] => {
    const {
        disbursementType,
        totalPayment,
        effectiveDate,
        processDate,
        status,
        requestedWithdrawalAmount,
        fundDisbursementType,
        transactionType,
        actualWithdrawalAmount,
    } = values;

    if (transactionType === TransactionType.FullSurrender) {
        return [
            {
                label: t('policy.history.withdrawalSidesheet.surrenderAmount') as string,
                caption: t('policy.history.withdrawalSidesheet.disbursementType', {
                    disbursementType: toSentenceCase(disbursementType),
                }) as string,
                value: numberFormatify(requestedWithdrawalAmount),
            },
            {
                label: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.totalPaymentTooltip') as string,
                value: numberFormatify(forcePositiveNumber(totalPayment)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.effectiveDateTooltip') as string,
                value: effectiveDate,
            },
            {
                label: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.processDateTooltip') as string,
                value: status === TransactionStatus.Completed ? processDate : DEFAULT_ERROR_STRING,
            },
            {
                label: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip') as string,
                value: fundDisbursementType,
            },
        ];
    } else if (transactionType === TransactionType.PartialWithdrawalOneTime) {
        return [
            {
                label: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmount') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmount') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmountTooltip') as string,
                caption: t('policy.history.withdrawalSidesheet.disbursementType', {
                    disbursementType: toSentenceCase(disbursementType),
                }) as string,
                value: numberFormatify(forcePositiveNumber(requestedWithdrawalAmount)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.actualWithdrawalAmount') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.actualWithdrawalAmount') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.actualWithdrawalAmountTooltip', {
                    disbursementType: disbursementType?.toLowerCase(),
                }) as string,
                value: numberFormatify(forcePositiveNumber(actualWithdrawalAmount)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.totalPaymentTooltip') as string,
                value: numberFormatify(forcePositiveNumber(totalPayment)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip') as string,
                value: fundDisbursementType,
            },
            {
                label: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.effectiveDateTooltip') as string,
                value: effectiveDate,
            },
            {
                label: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.processDateTooltip') as string,
                value: status === TransactionStatus.Completed ? processDate : DEFAULT_ERROR_STRING,
            },
        ];
    }

    return [];
};

const getRequestedWithdrawalAmount = (
    amount: number | undefined,
    status: TransactionStatus | undefined,
    quote?: WithdrawalQuoteResponse
): number => {
    let requestedAmount: number | undefined = 0;

    // if (status === TransactionStatus.Pending) {
    //     requestedAmount = TransactionType.FullSurrender
    //         ? quote?.transactionAmounts?.requestedAmount
    //         : quote?.transactionAmounts?.appliedAmount;
    // } else {

    //     requestedAmount = TransactionType.FullSurrender
    //         ? quote?.transactionAmounts?.requestedAmount
    //         : quote?.transactionAmounts?.appliedAmount;
    // }
    if (quote?.transactionAmounts) {
        requestedAmount = TransactionType.FullSurrender
            ? quote?.transactionAmounts?.requestedAmount
            : quote?.transactionAmounts?.appliedAmount;
    }

    return Math.abs(requestedAmount || 0);
};

const getActualWithdrawalAmount = (
    amount: number | undefined,
    disbursementType: DisbursementType | undefined,
    transaction: Transaction,
    quote?: WithdrawalQuoteResponse
): number => {
    let withdrawalAmount = 0;

    if (transaction.transactionType === TransactionType.FullSurrender) {
        if (quote?.transactionAmounts?.requestedAmount) {
            withdrawalAmount = quote?.transactionAmounts?.requestedAmount;
        } else {
            withdrawalAmount = amount || 0;
        }
    } else if (transaction.transactionType === TransactionType.PartialWithdrawalOneTime) {
        if (quote?.transactionAmounts?.appliedAmount) {
            withdrawalAmount = quote?.transactionAmounts?.appliedAmount;
        } else {
            withdrawalAmount = amount || 0;
        }
    }

    if (disbursementType === DisbursementType.GROSS) {
        return Math.abs(withdrawalAmount);
    }

    const taxWithheldAmounts = quote ? quote?.taxWithheldAmounts : transaction?.taxWithheldAmounts;

    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    const federalTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.FEDERAL)?.[0]?.withholdAmount || 0;
    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    const stateTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.STATE)?.[0]?.withholdAmount || 0;

    const totalChargesWithoutTaxes = transaction.charges
        ? transaction.charges.reduce((acc, charge) => {
              const amount = charge.chargeAmount;
              return acc + (typeof amount === 'number' ? amount : 0);
          }, 0)
        : 0;

    return Math.abs(withdrawalAmount + federalTaxWithheld + stateTaxWithheld + totalChargesWithoutTaxes);
};

const getWithdrawalDetailsValues = (transaction: Transaction, t: TFunction, quote?: WithdrawalQuoteResponse): WithdrawalDetailsValues => {
    const { effectiveDate, processDate, status, transactionAmounts, transactionType } = transaction;
    const { appliedAmount, disbursementType, requestedAmount } = transactionAmounts ?? {};
    const amount = transactionType === TransactionType.FullSurrender ? requestedAmount : appliedAmount;
    const actualWithdrawalAmount = getActualWithdrawalAmount(appliedAmount, disbursementType, transaction, quote);
    const totalPayment = getWithdrawalTotalPayment(transaction, quote);

    return {
        requestedWithdrawalAmount: getRequestedWithdrawalAmount(amount, status, quote),
        actualWithdrawalAmount,
        totalPayment,
        fundDisbursementType: t('policy.history.withdrawalSidesheet.proRata') as string,
        effectiveDate: convertKebabedDateString(effectiveDate),
        transactionType,
        disbursementType,
        processDate: convertKebabedDateString(processDate),
        status,
    };
};

const callWithdrawalQuote = async (policy: Policy, transaction: Transaction, bankId?: string): Promise<WithdrawalQuoteResponse> => {
    const { caseId, correlationId, payeeOrBeneficiaries, taxWithholdingInstructions, transactionAmounts, transactionType } =
        transaction ?? {};
    const { disbursementType, requestedAmount } = transactionAmounts ?? {};

    const baseRequestBody = {
        caseId: caseId,
        correlationId: correlationId,
        effectiveDate: dayjs(transaction?.effectiveDate, 'MMDDYYYY').format(ZAHARA_API_DATE_FORMAT),
        fundAllocation: {
            allocationOption: AllocationOption.DEFAULT,
        },
        reverseInitiator: false,
        taxWithholdingInstructions: taxWithholdingInstructions,
        transactionAmounts: {
            amountType: AmountType.AMOUNT,
            disbursementType: disbursementType,
            disbursementPaymentForm: PaymentForm.ACH,
            requestedAmount: Number(requestedAmount),
        },
    };
    const requestBody = {
        ...baseRequestBody,
        // TODO: update once we support multiple payees
        payeeOrBeneficiary: [
            {
                allocationPercentage: payeeOrBeneficiaries?.[0]?.allocationPercentage,
                bankId,
                partyId: payeeOrBeneficiaries?.[0]?.partyId,
                paymentForm: PaymentForm.ACH,
            },
        ],
    };

    return await policyWithdrawalQuote(policy.product?.planCode, policy.policyNumber, transactionType, requestBody);
};

const getWithdrawalChargesValues = (policy: Policy, transaction: Transaction, quote?: WithdrawalQuoteResponse): WithdrawalChargesValues => {
    const { charges } = transaction;

    const state = getOwnersTaxJurisdictionState(policy);

    return {
        charges,
        totalChargesWithoutTaxes: getChargesWithoutTaxes(charges),
        federalTaxWithheld: getTaxWithheldByType(transaction, TaxWithholdingType.FEDERAL, quote),
        stateTaxWithheld: getTaxWithheldByType(transaction, TaxWithholdingType.STATE, quote),
        state: state.toUpperCase(),
    };
};

const getWithdrawalCharges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    totalPayment: number | undefined,
    quote?: WithdrawalQuoteResponse
): WithdrawalDetails[] => {
    const { charges, federalTaxWithheld, state, stateTaxWithheld, totalChargesWithoutTaxes } = getWithdrawalChargesValues(
        policy,
        transaction,
        quote
    );

    return [
        ...(charges?.map(charge => ({
            amount: negativeNumberFormatify(charge.chargeAmount) as string,
            // TODO MG: charge type may be wrong here
            label: t(`policy.history.withdrawalSidesheet.${charge.chargeType}`) as string,
        })) || []),
        {
            amount: !charges ? negativeNumberFormatify(totalChargesWithoutTaxes) : numberFormatify(0),
            label: !charges ? (t(`policy.history.withdrawalSidesheet.WITHDRAWALCHARGE`) as string) : undefined,
        },
        {
            amount: federalTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.federalTax') as string,
        },
        {
            amount: stateTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: state }) as string,
        },
        {
            amount: numberFormatify(forcePositiveNumber(totalPayment)),
            label: t('policy.history.withdrawalSidesheet.totalPayment') as string,
            isSidesheetSumTotalRow: true,
        },
    ];
};

export const getWithdrawalSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): WithdrawalSideSheetValues => {
    const { payeeOrBeneficiaries, transactionType } = transaction;

    let detailsValues = getWithdrawalDetailsValues(transaction, t);

    return {
        // TODO MG: used for actual amount line in `Payment Details` above the charges
        actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
        cancelCta:
            transaction?.status === TransactionStatus.Pending && transactionType === TransactionType.FullSurrender
                ? (t('policy.history.sidesheet.cancelSurrender') as string)
                : undefined,
        taxWithholdings: getTaxWithholdings(policy, transaction, t),
        withdrawalDetails: getWithdrawalDetails(detailsValues, t),
        withdrawalCharges: getWithdrawalCharges(policy, transaction, t, detailsValues.totalPayment),
        payeePaymentDetails: getPayeePaymentDetails(policy, t, detailsValues.totalPayment, payeeOrBeneficiaries),
        transactionType,
        getAsyncSideSheetValues: async () => {
            const quote = await callWithdrawalQuote(policy, transaction);

            detailsValues = getWithdrawalDetailsValues(transaction, t, quote);

            return {
                actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
                totalPayment: detailsValues.totalPayment,
                payeePaymentDetails: getPayeePaymentDetails(policy, t, detailsValues.totalPayment, payeeOrBeneficiaries),
                withdrawalCharges: getWithdrawalCharges(policy, transaction, t, detailsValues.totalPayment, quote),
                withdrawalDetails: getWithdrawalDetails(detailsValues, t),
            };
        },
    };
};

export const getFreeLookCancellationSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): WithdrawalSideSheetValues => {
    const totalPayment = transaction.transactionAmounts?.appliedAmount
        ? transaction.transactionAmounts?.appliedAmount * -1
        : DEFAULT_ERROR_STRING;
    const effectiveDate = convertKebabedDateString(transaction.requestDate);
    const processDate = convertKebabedDateString(transaction.processDate);
    const status = transaction.status;

    return {
        transactionType: transaction.transactionType,
        withdrawalDetails: [
            {
                label: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalPayment') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.totalPaymentTooltip') as string,
                value: numberFormatify(totalPayment),
            },

            {
                label: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.effectiveDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.effectiveDateTooltip') as string,
                value: effectiveDate,
            },

            {
                label: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.processDate') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.processDateTooltip') as string,
                value: status === TransactionStatus.Completed ? processDate : DEFAULT_ERROR_STRING,
            },
        ],
        payeePaymentDetails: getPayeePaymentDetails(
            policy,
            t,
            transaction.transactionAmounts?.appliedAmount,
            transaction.payeeOrBeneficiaries
        ),
    };
};

const getChargesWithoutTaxes = (charges?: TransactionChargesItem[]): number => {
    if (!charges) return 0;

    return charges.reduce((acc, charge) => {
        const amount = charge.chargeAmount;
        return acc + (typeof amount === 'number' ? amount : 0);
    }, 0);
};

const getWithdrawalTotalPayment = (
    transaction: Transaction,
    quote?: FullSurrenderQuoteResponse | PartialWithdrawalOneTimeQuoteResponse
): number => {
    const { charges, status, transactionAmounts, transactionType } = transaction;
    const { appliedAmount, disbursementType } = transactionAmounts ?? {};

    const taxWithheldAmounts = quote ? quote?.taxWithheldAmounts : transaction?.taxWithheldAmounts;
    // TODO MG: helper function since this is the same logic in getActualWithdrawalAmount()
    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    const federalTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.FEDERAL)?.[0]?.withholdAmount || 0;
    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    const stateTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.STATE)?.[0]?.withholdAmount || 0;
    // TODO MG: this is always 0 for now so maybe hardcode it for now
    const totalChargesWithoutTaxes = getChargesWithoutTaxes(charges as TransactionChargesItem[]);

    let withdrawalAmount;

    // TODO MG: confirm shouldnt be requestedAmount
    if (quote?.transactionAmounts?.appliedAmount) {
        withdrawalAmount = quote?.transactionAmounts?.appliedAmount
            ? Math.abs(quote?.transactionAmounts?.appliedAmount)
            : quote?.transactionAmounts?.appliedAmount;
    } else {
        withdrawalAmount = appliedAmount || 0;
    }

    if (status === TransactionStatus.Pending && transactionType === TransactionType.FullSurrender) {
        return Number(quote?.payeeOrBeneficiary?.[0].disbursementAmount);
    }

    return disbursementType === DisbursementType.NET
        ? withdrawalAmount + totalChargesWithoutTaxes + federalTaxWithheld + stateTaxWithheld
        : withdrawalAmount - totalChargesWithoutTaxes - federalTaxWithheld - stateTaxWithheld;
};
