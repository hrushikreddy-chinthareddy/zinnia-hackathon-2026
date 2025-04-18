import { Tag, TagVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import { TFunction } from 'next-i18next';
import { Key } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import PayeeSummaryCardRow from '@deps/containers/payee-summary-card/payee-summary-card-row/payee-summary-card-row';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helper';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { TransactionType } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { WithdrawalSideSheetValues } from './types';

type SideSheetWithdrawalContentProps = {
    loading?: boolean;
    values: WithdrawalSideSheetValues;
    t: TFunction;
};

const SideSheetWithdrawalContent = ({ values, t }: SideSheetWithdrawalContentProps) => {
    const {
        disbursementType,
        transactionType,
        withdrawalDetails,
        taxWithholdings,
        actualWithdrawalAmount,
        withdrawalCharges,
        payeePaymentDetails,
    } = values || {};
    let transactionTypeLabel;

    if (transactionType === TransactionType.FullSurrender) {
        transactionTypeLabel = t('historyEventCard.surrender');
    } else if (transactionType === TransactionType.PartialWithdrawalOneTime) {
        transactionTypeLabel = t('historyEventCard.withdrawal');
    } else if (transactionType == TransactionType.FreeLookCancellation) {
        transactionTypeLabel = t('historyEventCard.transactionTypes.FreeLookCancellation');
    }

    return (
        <>
            <section>
                {/* TODO: Update each labels used to be headings to meet a11y HTML semantics when wrapped by a parent <section>.
                Suggest using h2 or h3 depending on the main page content's structure */}
                <Typography variant={TypographyVariant.H4}>
                    {t('policy.history.withdrawalSidesheet.detailsTitle', { transactionType: toTitleCase(transactionTypeLabel) })}
                </Typography>
                <div className="mt-4 grid w-full grid-cols-2 gap-8">
                    {withdrawalDetails?.map((field: any, index: number) => (
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
            {taxWithholdings && (
                <>
                    <section>
                        <Typography variant={TypographyVariant.H4}>
                            {t('policy.history.withdrawalSidesheet.taxWithholdingTitle')}
                        </Typography>
                        <div className="mt-4 grid w-full grid-cols-2 gap-8">
                            {taxWithholdings.map((field: any, index: number) => (
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
            {transactionType !== TransactionType.FreeLookCancellation && (
                <>
                    <section>
                        <div className="mb-4 flex items-center gap-4">
                            <Typography variant={TypographyVariant.H4}>
                                {t('policy.history.withdrawalSidesheet.paymentDetailsTitle')}
                            </Typography>
                            <Tag variant={TagVariant.White} text={toSentenceCase(disbursementType)} />
                        </div>
                        <div>
                            <PayeeSummaryCardRow
                                amount={numberFormatify(actualWithdrawalAmount)}
                                label={t('policy.history.withdrawalSidesheet.actualTransactionAmount', {
                                    transactionType: transactionTypeLabel?.toLowerCase(),
                                })}
                            />
                            <hr className="my-4 h-0.5 border-none bg-gray-100" />

                            {withdrawalCharges?.map(
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
                </>
            )}

            <section>
                <Typography variant={TypographyVariant.H4}>{t('policy.history.withdrawalSidesheet.payeeDetailsTitle')}</Typography>
                <div className="mt-4">
                    <table role="table" className="w-full rounded-lg">
                        {/* Hardcoded table caption
                        TODO MG: need transalations */}
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
                            {payeePaymentDetails?.map((payee, index: Key) => (
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
                                        <Typography variant={TypographyVariant.BodySm}>
                                            {percentFormatify(payee.allocationPercentage, { isInteger: true })}
                                        </Typography>
                                    </td>
                                    <td
                                        role="cell"
                                        className="w-[30%] content-center rounded-br-lg border-b-1 border-r-1 border-gray-200 px-3 py-2 text-right"
                                    >
                                        <Typography variant={TypographyVariant.BodySm}>
                                            {/* Defaulting to DEFAULT_ERROR_STRING for pending sidesheets waiting on Promise to be fulfilled*/}
                                            {numberFormatify(payee.disbursementAmount || DEFAULT_ERROR_STRING)}
                                        </Typography>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

export default SideSheetWithdrawalContent;
