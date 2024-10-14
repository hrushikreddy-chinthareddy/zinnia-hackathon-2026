import { Tag, TagVariant } from "@zinnia/bloom/components";
import { Key } from "react";

import FieldData from "@deps/components/fields/field-data/field-data";
import { PiiWrapper } from "@deps/components/pii/PiiWrapper";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import PayeeSummaryCardRow from "@deps/containers/payee-summary-card/payee-summary-card-row/payee-summary-card-row";
import { negativeNumberFormatify, numberFormatify, percentFormatify, forcePositiveNumber } from "@deps/helpers/numbers.helper";
import { toSentenceCase } from "@deps/helpers/string.helper";
import { DisbursementType, TransactionStatus, TransactionType } from "@deps/models/policy/sor-policy";
import { DEFAULT_ERROR_STRING } from "@deps/types/constants";

import { SideSheetFinancialTransactionViewModel } from "../types";

const SideSheetWithdrawalContent = ({ values, t }: SideSheetFinancialTransactionViewModel) => {
    const {
        actualAmount, charges, disbursementType, effectiveDate, federalTaxWithheld,
        federalTaxWithholding, netActualWithdrawalAmount, payees, processDate,
        quote, requestedAmount, state, stateTaxWithheld, stateTaxWithholding, status,
        totalChargesWithoutTaxes, totalPayment, transactionType
    } = values || {};

    let transactionTypeValue;
    let withdrawalDetailsArray;

    if (transactionType === TransactionType.FullSurrender) {
        transactionTypeValue = t('historyEventCard.surrender');
    } else if (transactionType === TransactionType.PartialWithdrawalOneTime) {
        transactionTypeValue = t('historyEventCard.withdrawal');
    }

    if (transactionType === TransactionType.FullSurrender) {
        withdrawalDetailsArray = [
            // Default to using actual withdrawal amount if requested withdrawal amount is null in API
            {
                label: t('policy.history.withdrawalSidesheet.surrenderAmount'),
                caption: t('policy.history.withdrawalSidesheet.disbursementType', {
                    disbursementType: toSentenceCase(disbursementType),
                }),
                value:
                    status === TransactionStatus.Pending
                        ? numberFormatify(forcePositiveNumber(quote?.transactionAmounts?.appliedAmount))
                        : numberFormatify(forcePositiveNumber(actualAmount)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.totalPayment'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalPayment'),
                tooltipBody: t('policy.history.withdrawalSidesheet.totalPaymentTooltip'),
                value: totalPayment,
            },
            {
                label: t('policy.history.withdrawalSidesheet.effectiveDate'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.effectiveDate'),
                tooltipBody: t('policy.history.withdrawalSidesheet.effectiveDateTooltip'),
                value: effectiveDate,
            },
            {
                label: t('policy.history.withdrawalSidesheet.processDate'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.processDate'),
                tooltipBody: t('policy.history.withdrawalSidesheet.processDateTooltip'),
                value: status === TransactionStatus.Completed ? processDate : DEFAULT_ERROR_STRING,
            },
            // Hardcoded to match Summary step in Withdrawal workflow
            {
                label: t('policy.history.withdrawalSidesheet.fundDisbursementType'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.fundDisbursementType'),
                tooltipBody: t('policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip'),
                value: t('policy.history.withdrawalSidesheet.proRata'),
            },
        ];
    } else if (transactionType === TransactionType.PartialWithdrawalOneTime) {
        withdrawalDetailsArray = [
            {
                label: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmount'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmount'),
                tooltipBody: t('policy.history.withdrawalSidesheet.requestedWithdrawalAmountTooltip'),
                caption: t('policy.history.withdrawalSidesheet.disbursementType', {
                    disbursementType: toSentenceCase(disbursementType),
                }),
                value: numberFormatify(forcePositiveNumber(requestedAmount || actualAmount)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.actualWithdrawalAmount'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.actualWithdrawalAmount'),
                tooltipBody: t('policy.history.withdrawalSidesheet.actualWithdrawalAmountTooltip', {
                    disbursementType: disbursementType?.toLowerCase(),
                }),
                value:
                    disbursementType === DisbursementType.NET
                        ? numberFormatify(netActualWithdrawalAmount)
                        : numberFormatify(forcePositiveNumber(actualAmount || requestedAmount)),
            },
            {
                label: t('policy.history.withdrawalSidesheet.totalPayment'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.totalPayment'),
                tooltipBody: t('policy.history.withdrawalSidesheet.totalPaymentTooltip'),
                value: totalPayment,
            },
            // Hardcoded to match Summary step in Withdrawal workflow
            {
                label: t('policy.history.withdrawalSidesheet.fundDisbursementType'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.fundDisbursementType'),
                tooltipBody: t('policy.history.withdrawalSidesheet.fundDisbursementTypeTooltip'),
                value: t('policy.history.withdrawalSidesheet.proRata'),
            },
            {
                label: t('policy.history.withdrawalSidesheet.effectiveDate'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.effectiveDate'),
                tooltipBody: t('policy.history.withdrawalSidesheet.effectiveDateTooltip'),
                value: effectiveDate,
            },
            {
                label: t('policy.history.withdrawalSidesheet.processDate'),
                tooltipTitle: t('policy.history.withdrawalSidesheet.processDate'),
                tooltipBody: t('policy.history.withdrawalSidesheet.processDateTooltip'),
                value: status === TransactionStatus.Completed ? processDate : DEFAULT_ERROR_STRING,
            },
        ];
    }

    // Tax Withholding
    const taxWithholdingArray = [
        {
            label: t('policy.history.withdrawalSidesheet.federalTax'),
            tooltipTitle: t('policy.history.withdrawalSidesheet.federalTax'),
            tooltipBody: t('policy.history.withdrawalSidesheet.federalTaxTooltip'),
            value: federalTaxWithholding
        },
        {
            label: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: state }),
            tooltipTitle: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: state }),
            tooltipBody: t('policy.history.withdrawalSidesheet.stateTaxTooltip'),
            value: stateTaxWithholding,
            sentenceCase: false,
        },
    ];

    // Payment Details (only the charges and total payment)
    const chargesArray = [
        ...(charges?.map(charge => ({
            amount: negativeNumberFormatify(charge.chargeAmount),
            label: t(`policy.history.withdrawalSidesheet.${charge.chargeType}`) as string,
        })) || []),

        {
            amount: !charges
                ? negativeNumberFormatify(totalChargesWithoutTaxes)
                : numberFormatify(0),
            label: !charges
                ? t(`policy.history.withdrawalSidesheet.WITHDRAWALCHARGE`) as string
                : undefined,
        },

        {
            amount: federalTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.federalTax') as string,
        },

        {
            amount: stateTaxWithheld,
            label: t('policy.history.withdrawalSidesheet.stateTax', { stateAbbreviation: state?.toUpperCase() }) as string,
        },
        {
            amount: numberFormatify(totalPayment),
            label: t('policy.history.withdrawalSidesheet.totalPayment') as string,
            isSidesheetSumTotalRow: true,
        },
    ];

    return (
        <>
            <section>
                {/* TODO: Update each labels used to be headings to meet a11y HTML semantics when wrapped by a parent <section>.
                Suggest using h2 or h3 depending on the main page content's structure */}
                <Typography variant={TypographyVariant.H4}>
                    {t('policy.history.withdrawalSidesheet.detailsTitle', { transactionType: transactionTypeValue })}
                </Typography>
                <div className="mt-4 grid w-full grid-cols-2 gap-8">
                    {withdrawalDetailsArray?.map((field: any, index: number) => (
                        <div className="flex flex-col" key={index}>
                            <FieldData key={index} label={field.label} tooltipTitle={field.tooltipTitle} tooltipBody={field.tooltipBody}>
                                {field.value || DEFAULT_ERROR_STRING}
                            </FieldData>
                            {field.caption && <Typography variant={TypographyVariant.Caption}>{field.caption}</Typography>}
                        </div>
                    ))}
                </div>
            </section>
            <hr className="my-6 h-0.5 bg-gray-200" />
            {taxWithholdingArray && (
                <>
                    <section>
                        <Typography variant={TypographyVariant.H4}>
                            {t('policy.history.withdrawalSidesheet.taxWithholdingTitle')}
                        </Typography>
                        <div className="mt-4 grid w-full grid-cols-2 gap-8">
                            {taxWithholdingArray.map((field: any, index: number) => (
                                <FieldData
                                    key={index}
                                    label={field.label}
                                    tooltipTitle={field.tooltipTitle}
                                    tooltipBody={field.tooltipBody}
                                    sentenceCase={field.sentenceCase}
                                >
                                    {field.value || DEFAULT_ERROR_STRING}
                                </FieldData>
                            ))}
                        </div>
                    </section>
                    <hr className="my-6 h-0.5 bg-gray-200" />
                </>
            )}
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <Typography variant={TypographyVariant.H4}>{t('policy.history.withdrawalSidesheet.paymentDetailsTitle')}</Typography>
                    <Tag variant={TagVariant.White} text={toSentenceCase(disbursementType)} />
                </div>
                <div>
                    <PayeeSummaryCardRow
                        amount={
                            disbursementType === DisbursementType.NET
                                ? numberFormatify(netActualWithdrawalAmount)
                                : numberFormatify(
                                    forcePositiveNumber(
                                        actualAmount ||
                                            requestedAmount ||
                                                quote?.transactionAmounts?.appliedAmount
                                    )
                                  ) || DEFAULT_ERROR_STRING
                        }
                        label={t('policy.history.withdrawalSidesheet.actualTransactionAmount', {
                            transactionType: transactionTypeValue?.toLowerCase(),
                        })}
                    />
                    <hr className="my-4 h-0.5 border-none bg-gray-100" />

                    {chargesArray?.map(
                        (charge: any, index: number) =>
                            charge.label && (
                                <PayeeSummaryCardRow
                                    key={index}
                                    amount={charge.amount}
                                    label={charge.label}
                                    isSidesheetSumTotalRow={charge.isSidesheetSumTotalRow}
                                />
                            )
                    )}
                </div>
            </section>
            <hr className="my-6 h-0.5 bg-gray-200" />
            <section>
                <Typography variant={TypographyVariant.H4}>{t('policy.history.withdrawalSidesheet.payeeDetailsTitle')}</Typography>
                <div className="mt-4">
                    {/* ="contents" */}
                    <table role="table" className="w-full rounded-lg">
                        {/* Hardcoded table caption
                        TODO: This will need to be updated/cleared through Amelia for a11y purposes */}
                        <caption className="hidden">
                            Payee details table of withdrawal transaction stating whom received the percentage and dollar amount of the
                            withdrawn amount.
                        </caption>
                        <thead>
                            <tr role="row" className="flex">
                                <th
                                    scope="col"
                                    className="w-[60%] rounded-tl-lg border-b-1 border-l-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-left"
                                >
                                    <Typography variant={TypographyVariant.BodySmBold}>
                                        {t('policy.history.withdrawalSidesheet.payee')}
                                    </Typography>
                                </th>
                                <th scope="col" className="w-[30%] border-b-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right">
                                    <Typography variant={TypographyVariant.BodySmBold}>
                                        {t('policy.history.withdrawalSidesheet.percentage')}
                                    </Typography>
                                </th>
                                <th
                                    scope="col"
                                    className="w-[30%] rounded-tr-lg border-b-1 border-r-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right"
                                >
                                    <Typography variant={TypographyVariant.BodySmBold}>
                                        {t('policy.history.withdrawalSidesheet.amount')}
                                    </Typography>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {payees?.map(
                                (
                                    payee: { bankDetails: { nameOnAccount: string; branchName: string; accountNumber: string } },
                                    index: Key
                                ) => (
                                    <tr role="row" key={index} className="flex">
                                        <td
                                            role="cell"
                                            className="flex w-[60%] flex-col rounded-bl-lg border-b-1 border-l-1 border-gray-200 px-3 py-2 text-left"
                                        >
                                            <Typography variant={TypographyVariant.BodySmBold}>
                                                <PiiWrapper>{payee.bankDetails.nameOnAccount}</PiiWrapper>
                                            </Typography>
                                            <Typography variant={TypographyVariant.BodySm}>
                                                <PiiWrapper>{payee.bankDetails.branchName}</PiiWrapper>
                                            </Typography>
                                            <Typography variant={TypographyVariant.BodySm}>
                                                <PiiWrapper>
                                                    {t('policy.history.withdrawalSidesheet.checkingEndingIn', {
                                                        accountNumber: payee.bankDetails.accountNumber?.substring(
                                                            payee.bankDetails.accountNumber.length - 4
                                                        ),
                                                    })}
                                                </PiiWrapper>
                                            </Typography>
                                        </td>
                                        <td role="cell" className="w-[30%] content-center border-b-1 border-gray-200 px-3 py-2 text-right">
                                            {/* TODO: update percentage to match portion each payee receives when there's multiple payees in the future 
                                        For now, just show 100% hardcoded since we're only supporting one payee at this time */}
                                            <Typography variant={TypographyVariant.BodySm}>{percentFormatify(1)}</Typography>
                                        </td>
                                        <td
                                            role="cell"
                                            className="w-[30%] content-center rounded-br-lg border-b-1 border-r-1 border-gray-200 px-3 py-2 text-right"
                                        >
                                            {/* TODO: update dollar amount to match portion each payee receives when there's multiple payees in the future 
                                        For now, pass in the total payment amount since we're only supporting one payee at this time */}
                                            <Typography variant={TypographyVariant.BodySm}>
                                                {/* Defaulting to DEFAULT_ERROR_STRING for pending sidesheets waiting on Promise to be fulfilled*/}
                                                {numberFormatify(
                                                    totalPayment ||
                                                        quote?.payeeOrBeneficiary?.[0].disbursementAmount ||
                                                        DEFAULT_ERROR_STRING
                                                )}
                                            </Typography>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

export default SideSheetWithdrawalContent;
