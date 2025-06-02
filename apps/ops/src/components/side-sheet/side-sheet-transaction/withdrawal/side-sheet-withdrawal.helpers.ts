import {
    AddressType,
    AllocationOption,
    AmountType,
    DisbursementType,
    FullSurrenderQuoteResponse,
    Policy,
    TaxWithholdingType,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { forcePositiveNumber, numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString, toSentenceCase } from '@deps/helpers/string.helpers';
import { getRequestedWithheldTaxesDisplay, getTaxWithheldByType } from '@deps/helpers/tax-withholdings.helpers';
import { getOwnersTaxJurisdictionState } from '@deps/helpers/transactions/taxes.helpers';
import { Charge, PayeeOrBeneficiary } from '@deps/models/policy-sor-touchups/Transaction';
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
    payeeOrBeneficiaries?: PayeeOrBeneficiary[] | undefined
): PayeePaymentDetails[] => {
    const results: PayeePaymentDetails[] = [];

    const partyIds: string[] = payeeOrBeneficiaries?.map(item => item.partyId).filter((id): id is string => id !== undefined) || [];
    const bankIds: string[] = payeeOrBeneficiaries?.map(item => item.bankId).filter((id): id is string => id !== undefined) || [];

    partyIds.forEach(partyId => {
        const party = policy.parties?.find(party => party.partyId === partyId);
        const payeeOrBeneficiary = payeeOrBeneficiaries?.find(party => party.partyId === partyId);

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
                disbursementAmount: Math.abs(payeeOrBeneficiary?.disbursementAmount || 0),
                allocationPercentage: payeeOrBeneficiary?.allocationPercentage,
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
        totalChargeAmount,
        effectiveDate,
        processDate,
        status,
        requestedWithdrawalAmount,
        fundDisbursementType,
        transactionType,
        actualWithdrawalAmount,
    } = values;

    if (transactionType === TransactionType.FULL_SURRENDER) {
        return [
            {
                label: t('policy.history.withdrawalSidesheet.surrenderAmount') as string,
                caption: t('policy.history.withdrawalSidesheet.disbursementType', {
                    disbursementType: toSentenceCase(disbursementType),
                }) as string,
                value: numberFormatify(requestedWithdrawalAmount),
            },
            {
                label: t('policy.history.withdrawalSidesheet.totalCharges') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalCharges') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.totalChargesTooltip') as string,
                value: numberFormatify(forcePositiveNumber(totalChargeAmount)),
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
                value: status === TransactionStatus.COMPLETED ? processDate : DEFAULT_ERROR_STRING,
            },
            {
                label: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.fundDisbursementType') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip') as string,
                value: fundDisbursementType,
            },
        ];
    } else if (
        transactionType === TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME ||
        transactionType === TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME
    ) {
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
                label: t('policy.history.withdrawalSidesheet.totalCharges') as string,
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalCharges') as string,
                tooltipBody: t('policy.history.withdrawalSidesheet.totalChargesTooltip') as string,
                value: numberFormatify(forcePositiveNumber(totalChargeAmount)),
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
                value: status === TransactionStatus.COMPLETED ? processDate : DEFAULT_ERROR_STRING,
            },
        ];
    }

    return [];
};

const getRequestedWithdrawalAmount = (
    amount: number | undefined,
    status: TransactionStatus | undefined,
    quote?: WithdrawalQuoteResponse | FullSurrenderQuoteResponse
): number => {
    let requestedAmount: number | undefined = 0;

    if (status === TransactionStatus.PENDING && quote?.transactionAmounts) {
        requestedAmount = TransactionType.FULL_SURRENDER
            ? quote?.transactionAmounts?.requestedAmount
            : quote?.transactionAmounts?.appliedAmount;
    } else {
        requestedAmount = amount;
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

    if (transaction.transactionType === TransactionType.FULL_SURRENDER) {
        if (quote?.transactionAmounts?.requestedAmount) {
            withdrawalAmount = quote?.transactionAmounts?.requestedAmount;
        } else {
            withdrawalAmount = amount || 0;
        }
    } else if (
        transaction.transactionType === TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME ||
        transaction.transactionType === TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME
    ) {
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
    const federalTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.FEDERAL)?.[0]?.withheldAmount || 0;
    const stateTaxWithheld =
        taxWithheldAmounts?.filter(item => item.taxWithholdingType === TaxWithholdingType.STATE)?.[0]?.withheldAmount || 0;

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
    const { appliedAmount, disbursementType, requestedAmount, totalChargeAmount } = transactionAmounts ?? {};
    const amount = transactionType === TransactionType.FULL_SURRENDER ? requestedAmount : appliedAmount;
    const actualWithdrawalAmount = getActualWithdrawalAmount(appliedAmount, disbursementType, transaction, quote);

    return {
        requestedWithdrawalAmount: getRequestedWithdrawalAmount(amount, status, quote),
        actualWithdrawalAmount,
        totalChargeAmount,
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
    const { disbursementType, requestedAmount, disbursementPaymentForm } = transactionAmounts ?? {};

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
            disbursementPaymentForm,
            requestedAmount: Number(requestedAmount),
        },
    };
    const requestBody = {
        ...baseRequestBody,
        payeeOrBeneficiary: [
            {
                allocationPercentage: payeeOrBeneficiaries?.[0]?.allocationPercentage,
                bankId,
                partyId: payeeOrBeneficiaries?.[0]?.partyId,
                paymentForm: payeeOrBeneficiaries?.[0]?.paymentForm,
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
    quote?: WithdrawalQuoteResponse
): WithdrawalDetails[] => {
    const { charges, federalTaxWithheld, state, stateTaxWithheld, totalChargesWithoutTaxes } = getWithdrawalChargesValues(
        policy,
        transaction,
        quote
    );

    return [
        ...(charges?.map(charge => ({
            amount: numberFormatify(charge.chargeAmount) as string,
            label: t(`policy.history.withdrawalSidesheet.${charge.chargeType}`, charge.chargeType as string) as string,
        })) || []),
        {
            amount: !charges ? numberFormatify(totalChargesWithoutTaxes) : numberFormatify(0),
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
    ];
};

export const getWithdrawalSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): WithdrawalSideSheetValues => {
    const { payeeOrBeneficiaries, status, transactionType } = transaction;

    let detailsValues = getWithdrawalDetailsValues(transaction, t);

    return {
        actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
        cancelCta:
            transaction?.status === TransactionStatus.PENDING && transactionType === TransactionType.FULL_SURRENDER
                ? (t('policy.history.sidesheet.cancelSurrender') as string)
                : undefined,
        disbursementType: detailsValues.disbursementType,
        taxWithholdings: getTaxWithholdings(policy, transaction, t),
        withdrawalDetails: getWithdrawalDetails(detailsValues, t),
        withdrawalCharges: getWithdrawalCharges(policy, transaction, t),
        payeePaymentDetails: getPayeePaymentDetails(policy, t, payeeOrBeneficiaries),
        transactionType,
        getAsyncSideSheetValues: async () => {
            if (status !== TransactionStatus.PENDING) {
                return {};
            }
            const quote = await callWithdrawalQuote(policy, transaction);

            detailsValues = getWithdrawalDetailsValues(transaction, t, quote);

            return {
                actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
                payeePaymentDetails: getPayeePaymentDetails(policy, t, payeeOrBeneficiaries),
                withdrawalCharges: getWithdrawalCharges(policy, transaction, t, quote),
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
                value: status === TransactionStatus.COMPLETED ? processDate : DEFAULT_ERROR_STRING,
            },
        ],
        payeePaymentDetails: getPayeePaymentDetails(policy, t, transaction.payeeOrBeneficiaries),
    };
};

const getChargesWithoutTaxes = (charges?: Charge[]): number => {
    if (!charges) return 0;

    return charges.reduce((acc, charge) => {
        const amount = charge.chargeAmount;
        return acc + (typeof amount === 'number' ? amount : 0);
    }, 0);
};
