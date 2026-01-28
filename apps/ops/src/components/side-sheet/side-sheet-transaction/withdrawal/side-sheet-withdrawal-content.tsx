import { Tag, TagVariant } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';
import { Key } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import PayeeSummaryCardRow from '@deps/containers/payee-summary-card/payee-summary-card-row/payee-summary-card-row';
import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { withdrawalDetailsTransactions } from '@deps/helpers/transaction-types.helpers';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@deps/utils/strings';
import { Policy, Transaction } from '@zinnia/api-types/types/sor';

import { WithdrawalSideSheetValues } from './types';

type SideSheetWithdrawalContentProps = {
    loading?: boolean;
    values: WithdrawalSideSheetValues;
    policy: Policy;
    t: TFunction;
};

const getPartyFullName = (policy: Policy, partyId: string) => {
    const party = policy?.parties?.find((p) => p.partyId === partyId);
    if (!party) return DEFAULT_ERROR_STRING;

    const first = party.firstName?.toLocaleUpperCase() || '';
    const last = party.lastName?.toLocaleUpperCase() || '';
    return `${first} ${last}`.trim() || DEFAULT_ERROR_STRING;
};

const getPayeeAddress = (policy: Policy, addressId: string) => {
    const address = policy?.parties
        ?.flatMap((p) => p.addresses || [])
        .find((addr) => addr.addressId === addressId);

    if (!address) return DEFAULT_ERROR_STRING;

    return `${address.addressLine1} ${address?.addressLine2 || ''} ${
        address?.addressLine3 || ''
    } ${address?.city || ''} ${address?.state || ''} ${address?.zipCode || ''}`;
};

const SideSheetWithdrawalContent = ({
    values,
    policy,
    t,
}: SideSheetWithdrawalContentProps) => {
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

    if (transactionType === Transaction.transactionType.FULL_SURRENDER) {
        transactionTypeLabel = t('historyEventCard.surrender');
    } else if (
        withdrawalDetailsTransactions.includes(
            transactionType as Transaction.transactionType
        )
    ) {
        transactionTypeLabel = t('historyEventCard.withdrawal');
    } else if (
        transactionType == Transaction.transactionType.FREE_LOOK_CANCELLATION
    ) {
        transactionTypeLabel = t('enums.FreeLookCancellation');
    }

    return (
        <>
            <section>
                {/* TODO: Update each labels used to be headings to meet a11y HTML semantics when wrapped by a parent <section>.
                Suggest using h2 or h3 depending on the main page content's structure */}
                <Typography variant={TypographyVariant.H4}>
                    {t('policy.history.withdrawalSidesheet.detailsTitle', {
                        transactionType: toTitleCase(transactionTypeLabel),
                    })}
                </Typography>
                <div className="mt-4 grid w-full grid-cols-2 gap-8">
                    {withdrawalDetails?.map((field: any, index: number) => (
                        <div className="flex flex-col" key={index}>
                            <FieldData
                                key={index}
                                label={field.label}
                                tooltipTitle={field.tooltipTitle}
                                tooltipBody={field.tooltipBody}
                            >
                                {field.value || DEFAULT_ERROR_STRING}
                            </FieldData>
                            {field.caption && (
                                <Typography variant={TypographyVariant.Caption}>
                                    {field.caption}
                                </Typography>
                            )}
                        </div>
                    ))}
                </div>
            </section>
            <hr className="my-6 h-0.5 bg-gray-200" />
            {taxWithholdings && (
                <>
                    <section>
                        <Typography variant={TypographyVariant.H4}>
                            {t(
                                'policy.history.withdrawalSidesheet.taxWithholdingTitle'
                            )}
                        </Typography>
                        <div className="mt-4 grid w-full grid-cols-2 gap-8">
                            {taxWithholdings.map(
                                (field: any, index: number) => (
                                    <FieldData
                                        key={index}
                                        label={field.label}
                                        tooltipTitle={field.tooltipTitle}
                                        tooltipBody={field.tooltipBody}
                                        sentenceCase={field.sentenceCase}
                                    >
                                        {field.value || DEFAULT_ERROR_STRING}
                                    </FieldData>
                                )
                            )}
                        </div>
                    </section>
                    <hr className="my-6 h-0.5 bg-gray-200" />
                </>
            )}
            {transactionType !==
                Transaction.transactionType.FREE_LOOK_CANCELLATION && (
                <>
                    <section>
                        <div className="mb-4 flex items-center gap-4">
                            <Typography variant={TypographyVariant.H4}>
                                {t(
                                    'policy.history.withdrawalSidesheet.paymentDetailsTitle'
                                )}
                            </Typography>
                            <Tag
                                variant={TagVariant.White}
                                text={toSentenceCase(disbursementType)}
                            />
                        </div>
                        <div>
                            <PayeeSummaryCardRow
                                amount={numberFormatify(actualWithdrawalAmount)}
                                label={t(
                                    'policy.history.withdrawalSidesheet.actualTransactionAmount',
                                    {
                                        transactionType:
                                            transactionTypeLabel?.toLowerCase(),
                                    }
                                )}
                            />
                            <hr className="my-4 h-0.5 border-none bg-gray-100" />

                            {withdrawalCharges?.map(
                                (charge: any, index: number) =>
                                    charge.label && (
                                        <PayeeSummaryCardRow
                                            key={index}
                                            amount={charge.amount}
                                            label={charge.label}
                                            isSidesheetSumTotalRow={
                                                charge.isSidesheetSumTotalRow
                                            }
                                        />
                                    )
                            )}
                        </div>
                    </section>
                    <hr className="my-6 h-0.5 bg-gray-200" />
                </>
            )}

            <section>
                <Typography variant={TypographyVariant.H4}>
                    {t('policy.history.withdrawalSidesheet.payeeDetailsTitle')}
                </Typography>
                <div className="mt-4">
                    <table role="table" className="w-full rounded-lg">
                        <caption className="hidden">
                            Payee details table of withdrawal transaction
                            stating recipient and allocation details.
                        </caption>
                        <thead>
                            <tr role="row" className="flex">
                                <th className="w-[60%] rounded-tl-lg border-b border-l border-t border-gray-200 bg-gray-50 px-3 py-2 text-left">
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t(
                                            'policy.history.withdrawalSidesheet.payee'
                                        )}
                                    </Typography>
                                </th>
                                <th className="w-[30%] border-b border-t border-gray-200 bg-gray-50 px-3 py-2 text-right">
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t(
                                            'policy.history.withdrawalSidesheet.percentage'
                                        )}
                                    </Typography>
                                </th>
                                <th className="w-[30%] rounded-tr-lg border-b border-r border-t border-gray-200 bg-gray-50 px-3 py-2 text-right">
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t(
                                            'policy.history.withdrawalSidesheet.amount'
                                        )}
                                    </Typography>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {payeePaymentDetails?.map((payee, index: Key) => (
                                <tr key={index} role="row" className="flex">
                                    <td className="flex w-[60%] flex-col rounded-bl-lg border-b border-l border-gray-200 px-3 py-2 text-left">
                                        <Typography
                                            variant={
                                                TypographyVariant.BodySmBold
                                            }
                                        >
                                            <PiiWrapper>
                                                {getPartyFullName(
                                                    policy,
                                                    payee.partyId
                                                )}
                                            </PiiWrapper>
                                        </Typography>

                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            <PiiWrapper>
                                                {payee.bankDetails.branchName}
                                            </PiiWrapper>
                                        </Typography>

                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            <PiiWrapper>
                                                {payee.paymentForm === 'CHECK'
                                                    ? t(
                                                          'policy.history.withdrawalSidesheet.check'
                                                      )
                                                    : t(
                                                          'policy.history.withdrawalSidesheet.checkingEndingIn',
                                                          {
                                                              accountNumber:
                                                                  payee.bankDetails.accountNumber?.slice(
                                                                      -4
                                                                  ),
                                                          }
                                                      )}
                                            </PiiWrapper>
                                        </Typography>

                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            <PiiWrapper>
                                                {payee.paymentForm ===
                                                    'CHECK' &&
                                                    getPayeeAddress(
                                                        policy,
                                                        payee.addressId || ''
                                                    )}
                                            </PiiWrapper>
                                        </Typography>
                                    </td>

                                    <td className="w-[30%] content-center border-b border-gray-200 px-3 py-2 text-right">
                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            {percentFormatify(
                                                payee.allocationPercentage,
                                                { isInteger: true }
                                            )}
                                        </Typography>
                                    </td>

                                    <td className="w-[30%] content-center rounded-br-lg border-b border-r border-gray-200 px-3 py-2 text-right">
                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            {numberFormatify(
                                                payee.disbursementAmount ||
                                                    DEFAULT_ERROR_STRING
                                            )}
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
