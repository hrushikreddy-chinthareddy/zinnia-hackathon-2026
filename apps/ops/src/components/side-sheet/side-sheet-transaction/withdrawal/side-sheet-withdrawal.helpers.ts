import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import {
    forcePositiveNumber,
    numberFormatify,
} from '@deps/helpers/numbers.helpers';
import {
    convertKebabedDateString,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import {
    getRequestedWithheldTaxesDisplay,
    getTaxWithheldByType,
} from '@deps/helpers/tax-withholdings.helpers';
import { withdrawalDetailsTransactions } from '@deps/helpers/transaction-types.helpers';
import { getOwnersTaxJurisdictionState } from '@deps/helpers/transactions/taxes.helpers';
import {
    Charge,
    PayeeOrBeneficiary,
} from '@deps/models/policy-sor-touchups/Transaction';
import { policyWithdrawalQuote } from '@deps/queries/api/policies';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    AllocationOption,
    AmountType,
    DisbursementType,
    FullSurrenderOrSystematicProgramQuoteResponse,
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
    TaxWithholdingType,
    Transaction,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

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

    const partyIds: string[] =
        payeeOrBeneficiaries
            ?.map((item) => item.partyId)
            .filter((id): id is string => id !== undefined) || [];

    partyIds.forEach((partyId) => {
        const party = policy.parties?.find(
            (party) => party.partyId === partyId
        );
        const payeeOrBeneficiary = payeeOrBeneficiaries?.find(
            (party) => party.partyId === partyId
        );

        if (party) {
            const address = party.addresses?.find(
                (address) => address.addressId === payeeOrBeneficiary?.addressId
            );

            const bankDetails = party.bankDetails?.find(
                (bank) => bank.bankId === payeeOrBeneficiary?.bankId
            );

            results.push({
                partyId: party.partyId as string,
                state:
                    address?.state ||
                    (t('policy.history.sidesheet.stateNotFound') as string),
                paymentForm: payeeOrBeneficiary?.paymentForm,
                addressId: payeeOrBeneficiary?.addressId,
                bankId: payeeOrBeneficiary?.bankId,
                allocationPercentage: payeeOrBeneficiary?.allocationPercentage,
                disbursementAmount: Math.abs(
                    payeeOrBeneficiary?.disbursementAmount || 0
                ),
                bankDetails: {
                    branchName: bankDetails?.branchName || '',
                    nameOnAccount: bankDetails?.nameOnAccount || '',
                    accountNumber: bankDetails?.accountNumber || '',
                    accountType: bankDetails?.accountType,
                },
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
            tooltipTitle: t(
                'policy.history.withdrawalSidesheet.federalTax'
            ) as string,
            tooltipBody: t(
                'policy.history.withdrawalSidesheet.federalTaxTooltip'
            ) as string,
            value: getRequestedWithheldTaxesDisplay(
                taxWithholdingInstructions,
                TaxWithholdingType.FEDERAL,
                DEFAULT_ERROR_STRING
            ),
        },
        {
            label: t('policy.history.withdrawalSidesheet.stateTax', {
                stateAbbreviation: ownerTaxState,
            }) as string,
            tooltipTitle: t('policy.history.withdrawalSidesheet.stateTax', {
                stateAbbreviation: ownerTaxState,
            }) as string,
            tooltipBody: t(
                'policy.history.withdrawalSidesheet.stateTaxTooltip'
            ) as string,
            value: getRequestedWithheldTaxesDisplay(
                taxWithholdingInstructions,
                TaxWithholdingType.STATE,
                DEFAULT_ERROR_STRING
            ),
            sentenceCase: false,
        },
    ];
};

const getWithdrawalDetails = (
    values: WithdrawalDetailsValues,
    t: TFunction
): WithdrawalDetails[] => {
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
        reversalDate,
    } = values;

    if (transactionType === TransactionTypeSchemaEnum.FULL_SURRENDER) {
        return [
            {
                label: t(
                    'policy.history.withdrawalSidesheet.surrenderAmount'
                ) as string,
                caption: t(
                    'policy.history.withdrawalSidesheet.disbursementType',
                    {
                        disbursementType: toSentenceCase(disbursementType),
                    }
                ) as string,
                value: numberFormatify(requestedWithdrawalAmount),
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.totalCharges'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.totalCharges'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.totalChargesTooltip'
                ) as string,
                value: numberFormatify(forcePositiveNumber(totalChargeAmount)),
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.effectiveDateTooltip'
                ) as string,
                value: effectiveDate,
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.processDateTooltip'
                ) as string,
                value:
                    status === TransactionStatus.COMPLETED
                        ? processDate
                        : DEFAULT_ERROR_STRING,
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementType'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementType'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip'
                ) as string,
                value: fundDisbursementType,
            },
        ];
    } else if (
        withdrawalDetailsTransactions.includes(
            transactionType as TransactionTypeSchemaEnum
        ) &&
        (disbursementType === DisbursementType.GROSS ||
            disbursementType === DisbursementType.NET)
    ) {
        const withdrawalDetails: WithdrawalDetails[] = [
            {
                label: t(
                    'policy.history.withdrawalSidesheet.requestedWithdrawalAmount'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.requestedWithdrawalAmount'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.requestedWithdrawalAmountTooltip'
                ) as string,
                caption: t(
                    'policy.history.withdrawalSidesheet.disbursementType',
                    {
                        disbursementType: toSentenceCase(disbursementType),
                    }
                ) as string,
                value: numberFormatify(
                    forcePositiveNumber(requestedWithdrawalAmount)
                ),
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.actualWithdrawalAmount'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.actualWithdrawalAmount'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.actualWithdrawalAmountTooltip',
                    {
                        disbursementType: disbursementType?.toLowerCase(),
                    }
                ) as string,
                value: numberFormatify(
                    forcePositiveNumber(actualWithdrawalAmount)
                ),
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.totalCharges'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.totalCharges'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.totalChargesTooltip'
                ) as string,
                value: numberFormatify(forcePositiveNumber(totalChargeAmount)),
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementType'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementType'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip'
                ) as string,
                value: fundDisbursementType,
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.effectiveDateTooltip'
                ) as string,
                value: effectiveDate,
            },
            {
                label: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.processDateTooltip'
                ) as string,
                value:
                    status === TransactionStatus.COMPLETED ||
                    status === TransactionStatus.REVERSED
                        ? processDate
                        : DEFAULT_ERROR_STRING,
            },
        ];
        if (status === TransactionStatus.REVERSED) {
            withdrawalDetails.push({
                label: t(
                    'policy.history.withdrawalSidesheet.reversalDate'
                ) as string,
                value: reversalDate,
            });
        }
        return withdrawalDetails;
    }
    return [];
};

const getRequestedWithdrawalAmount = (
    transaction: Transaction,
    amount: number | undefined,
    status: TransactionStatus | undefined,
    quote?:
        | WithdrawalQuoteResponse
        | FullSurrenderOrSystematicProgramQuoteResponse
): number => {
    let requestedAmount: number | undefined = 0;

    if (status === TransactionStatus.PENDING && quote?.transactionAmounts) {
        // TODO: This was very likely a bug, but run by MG to confirm
        requestedAmount =
            transaction.transactionType ===
            TransactionTypeSchemaEnum.FULL_SURRENDER
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

    if (
        transaction.transactionType === TransactionTypeSchemaEnum.FULL_SURRENDER
    ) {
        if (quote?.transactionAmounts?.requestedAmount) {
            withdrawalAmount = quote?.transactionAmounts?.requestedAmount;
        } else {
            withdrawalAmount = amount || 0;
        }
    } else if (
        withdrawalDetailsTransactions.includes(
            transaction.transactionType as TransactionTypeSchemaEnum
        )
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

    const taxWithheldAmounts = quote
        ? quote?.taxWithheldAmounts
        : transaction?.taxWithheldAmounts;
    const federalTaxWithheld =
        taxWithheldAmounts?.filter(
            (item) => item.taxWithholdingType === TaxWithholdingType.FEDERAL
        )?.[0]?.withheldAmount || 0;
    const stateTaxWithheld =
        taxWithheldAmounts?.filter(
            (item) => item.taxWithholdingType === TaxWithholdingType.STATE
        )?.[0]?.withheldAmount || 0;

    const totalChargesWithoutTaxes = transaction.charges
        ? transaction.charges.reduce((acc, charge) => {
              const amount = charge.chargeAmount;
              return acc + (typeof amount === 'number' ? amount : 0);
          }, 0)
        : 0;

    return Math.abs(
        withdrawalAmount +
            federalTaxWithheld +
            stateTaxWithheld +
            totalChargesWithoutTaxes
    );
};

const getWithdrawalDetailsValues = (
    transaction: Transaction,
    t: TFunction,
    quote?: WithdrawalQuoteResponse
): WithdrawalDetailsValues => {
    const {
        effectiveDate,
        processDate,
        status,
        transactionAmounts,
        transactionType,
        reversalDate,
    } = transaction;
    const { appliedAmount, disbursementType, totalChargeAmount } =
        transactionAmounts ?? {};
    const amount = appliedAmount;
    const actualWithdrawalAmount = getActualWithdrawalAmount(
        appliedAmount,
        disbursementType,
        transaction,
        quote
    );

    return {
        requestedWithdrawalAmount: getRequestedWithdrawalAmount(
            transaction,
            amount,
            status,
            quote
        ),
        actualWithdrawalAmount,
        totalChargeAmount,
        fundDisbursementType: t(
            'policy.history.withdrawalSidesheet.proRata'
        ) as string,
        effectiveDate: convertKebabedDateString(effectiveDate),
        transactionType,
        disbursementType,
        processDate: convertKebabedDateString(processDate),
        reversalDate: convertKebabedDateString(reversalDate),
        status,
    };
};

const callWithdrawalQuote = async (
    policy: Policy,
    transaction: Transaction,
    bankId?: string
): Promise<WithdrawalQuoteResponse> => {
    const {
        caseId,
        correlationId,
        payeeOrBeneficiaries,
        taxWithholdingInstructions,
        transactionAmounts,
        transactionType,
    } = transaction ?? {};
    const { disbursementType, requestedAmount, disbursementPaymentForm } =
        transactionAmounts ?? {};

    const baseRequestBody = {
        caseId: caseId,
        correlationId: correlationId,
        effectiveDate: dayjs(transaction?.effectiveDate, 'MMDDYYYY').format(
            ZAHARA_API_DATE_FORMAT
        ),
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
                allocationPercentage:
                    payeeOrBeneficiaries?.[0]?.allocationPercentage,
                bankId,
                partyId: payeeOrBeneficiaries?.[0]?.partyId,
                paymentForm: payeeOrBeneficiaries?.[0]?.paymentForm,
            },
        ],
    };

    return await policyWithdrawalQuote(
        policy.product?.planCode,
        policy.policyNumber,
        transactionType,
        requestBody
    );
};

const getWithdrawalChargesValues = (
    policy: Policy,
    transaction: Transaction,
    quote?: WithdrawalQuoteResponse
): WithdrawalChargesValues => {
    const { charges } = transaction;

    const state = getOwnersTaxJurisdictionState(policy);

    return {
        charges,
        totalChargesWithoutTaxes: getChargesWithoutTaxes(charges),
        federalTaxWithheld: getTaxWithheldByType(
            transaction,
            TaxWithholdingType.FEDERAL,
            quote
        ),
        stateTaxWithheld: getTaxWithheldByType(
            transaction,
            TaxWithholdingType.STATE,
            quote
        ),
        state: state.toUpperCase(),
    };
};

const getWithdrawalCharges = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction,
    quote?: WithdrawalQuoteResponse
): WithdrawalDetails[] => {
    const {
        charges,
        federalTaxWithheld,
        state,
        stateTaxWithheld,
        totalChargesWithoutTaxes,
    } = getWithdrawalChargesValues(policy, transaction, quote);

    return [
        ...(charges?.map((charge) => ({
            amount: numberFormatify(charge.chargeAmount) as string,
            label: t(
                `policy.history.withdrawalSidesheet.${charge.chargeType}`,
                charge.chargeType as string
            ) as string,
        })) || []),
        {
            amount: !charges
                ? numberFormatify(totalChargesWithoutTaxes)
                : numberFormatify(0),
            label: !charges
                ? (t(
                      `policy.history.withdrawalSidesheet.WITHDRAWALCHARGE`
                  ) as string)
                : undefined,
        },
        {
            amount: federalTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.federalTax') as string,
        },
        {
            amount: stateTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.stateTax', {
                stateAbbreviation: state,
            }) as string,
        },
    ];
};

export const getWithdrawalSideSheetValues = (
    policy: Policy,
    transaction: Transaction,
    t: TFunction
): WithdrawalSideSheetValues => {
    const { payeeOrBeneficiaries, status, transactionType } = transaction;

    let detailsValues = getWithdrawalDetailsValues(transaction, t);

    return {
        actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
        cancelCta:
            transaction?.status === TransactionStatus.PENDING &&
            transactionType === TransactionTypeSchemaEnum.FULL_SURRENDER
                ? (t('policy.history.sidesheet.cancelSurrender') as string)
                : undefined,
        disbursementType: detailsValues.disbursementType,
        taxWithholdings: getTaxWithholdings(policy, transaction, t),
        withdrawalDetails: getWithdrawalDetails(detailsValues, t),
        withdrawalCharges: getWithdrawalCharges(policy, transaction, t),
        payeePaymentDetails: getPayeePaymentDetails(
            policy,
            t,
            payeeOrBeneficiaries
        ),
        transactionType,
        getAsyncSideSheetValues: async () => {
            if (status !== TransactionStatus.PENDING) {
                return {};
            }
            const quote = await callWithdrawalQuote(policy, transaction);

            detailsValues = getWithdrawalDetailsValues(transaction, t, quote);

            return {
                actualWithdrawalAmount: detailsValues.actualWithdrawalAmount,
                payeePaymentDetails: getPayeePaymentDetails(
                    policy,
                    t,
                    payeeOrBeneficiaries
                ),
                withdrawalCharges: getWithdrawalCharges(
                    policy,
                    transaction,
                    t,
                    quote
                ),
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
                label: t('withdrawals.summary.totalPayment') as string,
                tooltipTitle: t('withdrawals.summary.totalPayment') as string,
                tooltipBody: t(
                    'withdrawals.summary.totalPaymentTooltip'
                ) as string,
                value: numberFormatify(totalPayment),
            },

            {
                label: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.effectiveDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.effectiveDateTooltip'
                ) as string,
                value: effectiveDate,
            },

            {
                label: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipTitle: t(
                    'policy.history.withdrawalSidesheet.processDate'
                ) as string,
                tooltipBody: t(
                    'policy.history.withdrawalSidesheet.processDateTooltip'
                ) as string,
                value:
                    status === TransactionStatus.COMPLETED
                        ? processDate
                        : DEFAULT_ERROR_STRING,
            },
        ],
        payeePaymentDetails: getPayeePaymentDetails(
            policy,
            t,
            transaction.payeeOrBeneficiaries
        ),
    };
};

const getChargesWithoutTaxes = (charges?: Charge[]): number => {
    if (!charges) return 0;

    return charges.reduce((acc, charge) => {
        const amount = charge.chargeAmount;
        return acc + (typeof amount === 'number' ? amount : 0);
    }, 0);
};
