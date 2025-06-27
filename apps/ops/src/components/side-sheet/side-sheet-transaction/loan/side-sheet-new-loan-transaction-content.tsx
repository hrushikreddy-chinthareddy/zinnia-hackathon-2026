import { Loader } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';
import { Key } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import { toSentenceCase } from '@deps/helpers/string.helpers';

import { NewLoanTransactionSideSheetValues } from './types';

type SideSheetNewLoanContentProps = {
    loading?: boolean;
    values: NewLoanTransactionSideSheetValues;
    t: TFunction;
};

const SideSheetNewLoanTransactionContent = ({
    loading,
    values,
    t,
}: SideSheetNewLoanContentProps) => {
    const {
        effectiveDate,
        fundDisbursementType,
        interestRate,
        loanAmount,
        loanInterestType,
        payeePaymentDetails,
        processedAmount,
        processDate,
    } = values;

    return (
        <div className="mt-8">
            <Typography className="mb-4" variant={TypographyVariant.H4}>
                {t('policy.history.newLoanSideSheet.loanDetails')}
            </Typography>
            <div className="grid grid-cols-2 gap-8">
                <FieldData
                    label={t('policy.history.newLoanSideSheet.loanAmount')}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.loanAmount'
                    )}
                >
                    {numberFormatify(loanAmount)}
                </FieldData>
                <FieldData
                    label={t('policy.history.newLoanSideSheet.processedAmount')}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.processedAmountTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.processedAmount'
                    )}
                >
                    {numberFormatify(processedAmount)}
                </FieldData>
                <FieldData
                    label={t(
                        'policy.history.newLoanSideSheet.loanInterestRate'
                    )}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.loanInterestRateTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.loanInterestRate'
                    )}
                >
                    {loading ? (
                        // to do - add optional alt text?
                        // alt={t('policy.history.sidesheet.general.downloading')}
                        <Loader />
                    ) : (
                        percentFormatify(interestRate, { isInteger: true })
                    )}
                </FieldData>
                <FieldData
                    label={t(
                        'policy.history.newLoanSideSheet.loanInterestRateType'
                    )}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.loanInterestRateTypeTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.loanInterestRateType'
                    )}
                >
                    {toSentenceCase(loanInterestType)}
                </FieldData>
                <FieldData
                    label={t('policy.history.newLoanSideSheet.effectiveDate')}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.effectiveDateTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.effectiveDate'
                    )}
                >
                    {effectiveDate}
                </FieldData>
                <FieldData
                    label={t('policy.history.newLoanSideSheet.processDate')}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.processDateTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.processDate'
                    )}
                >
                    {processDate}
                </FieldData>
                <FieldData
                    label={t(
                        'policy.history.newLoanSideSheet.fundDisbursementType'
                    )}
                    tooltipBody={t(
                        'policy.history.newLoanSideSheet.fundDisbursementTypeTooltip'
                    )}
                    tooltipTitle={t(
                        'policy.history.newLoanSideSheet.fundDisbursementType'
                    )}
                >
                    {fundDisbursementType}
                </FieldData>
            </div>

            {!!payeePaymentDetails.length && (
                <>
                    <hr className="my-6 h-0.5 bg-gray-200" />
                    <section>
                        <Typography variant={TypographyVariant.H4}>
                            {t(
                                'policy.history.newLoanSideSheet.payeeDetails.payeeDetails'
                            )}
                        </Typography>
                        <div className="mt-4">
                            <table role="table" className="w-full rounded-lg">
                                {/* Hardcoded table caption
                                    TODO: This will need to be updated/cleared through Amelia for a11y purposes
                                    I have kept the comments in the aboe 2 lines and caption tage below just in case, as it was kept in alysia's pr who is using the same payeee details data, I have used the payee.allocation percentage and disbursement amount*/}
                                <caption className="hidden">
                                    Payee details table of withdrawal
                                    transaction stating whom received the
                                    percentage and dollar amount of the
                                    withdrawn amount.
                                </caption>
                                <thead>
                                    <tr role="row" className="flex">
                                        <th
                                            scope="col"
                                            className="w-[60%] rounded-tl-lg border-b-1 border-l-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-left"
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySmBold
                                                }
                                            >
                                                {t(
                                                    'policy.history.newLoanSideSheet.payeeDetails.payee'
                                                )}
                                            </Typography>
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-[30%] border-b-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right"
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySmBold
                                                }
                                            >
                                                {t(
                                                    'policy.history.newLoanSideSheet.payeeDetails.percentage'
                                                )}
                                            </Typography>
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-[30%] rounded-tr-lg border-b-1 border-r-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right"
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySmBold
                                                }
                                            >
                                                {t(
                                                    'policy.history.newLoanSideSheet.payeeDetails.amount'
                                                )}
                                            </Typography>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payeePaymentDetails?.map(
                                        (payee, index: Key) => (
                                            <tr
                                                role="row"
                                                key={index}
                                                className={`flex ${
                                                    index ===
                                                    payeePaymentDetails.length -
                                                        1
                                                        ? 'rounded-bl-lg rounded-br-lg'
                                                        : ''
                                                }`}
                                            >
                                                <td
                                                    role="cell"
                                                    className={`flex w-[60%] flex-col border-b-1 border-l-1 border-gray-200 px-3 py-2 text-left ${
                                                        index ===
                                                        payeePaymentDetails.length -
                                                            1
                                                            ? 'rounded-bl-lg'
                                                            : ''
                                                    }`}
                                                >
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.BodySmBold
                                                        }
                                                    >
                                                        <PiiWrapper>
                                                            {
                                                                payee
                                                                    .bankDetails
                                                                    .nameOnAccount
                                                            }
                                                        </PiiWrapper>
                                                    </Typography>
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.BodySm
                                                        }
                                                    >
                                                        <PiiWrapper>
                                                            {
                                                                payee
                                                                    .bankDetails
                                                                    .branchName
                                                            }
                                                        </PiiWrapper>
                                                    </Typography>
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.BodySm
                                                        }
                                                    >
                                                        <PiiWrapper>
                                                            {`${getBankAccountType(
                                                                payee
                                                                    .bankDetails
                                                                    .accountType,
                                                                t
                                                            )} ending in ${payee.bankDetails.accountNumber?.substring(
                                                                payee
                                                                    .bankDetails
                                                                    .accountNumber
                                                                    .length - 4
                                                            )}`}
                                                        </PiiWrapper>
                                                    </Typography>
                                                </td>
                                                <td
                                                    role="cell"
                                                    className={`w-[30%] content-center border-b-1 border-gray-200 px-3 py-2 text-right`}
                                                >
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.BodySm
                                                        }
                                                    >
                                                        {percentFormatify(
                                                            payee.allocationPercentage,
                                                            { isInteger: true }
                                                        )}
                                                    </Typography>
                                                </td>
                                                <td
                                                    role="cell"
                                                    className={`w-[30%] content-center border-b-1 border-r-1 border-gray-200 px-3 py-2 text-right ${
                                                        index ===
                                                        payeePaymentDetails.length -
                                                            1
                                                            ? 'rounded-br-lg'
                                                            : ''
                                                    }`}
                                                >
                                                    <Typography
                                                        variant={
                                                            TypographyVariant.BodySm
                                                        }
                                                    >
                                                        {numberFormatify(
                                                            payee.disbursementAmount
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
            )}
        </div>
    );
};

export default SideSheetNewLoanTransactionContent;
