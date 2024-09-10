import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { Key, useEffect, useState } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helper';
import { getBankAccountType } from '@deps/helpers/party-info-helper';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { AccountType } from '@deps/models/policy/sor-policy';
import loadingImage from '@deps/styles/images/loader.png';

export type NewLoanTransactionSidesheetValues = {
    loanAmount?: number;
    processedAmount?: number;
    effectiveDate: string;
    processDate: string;
    submittedAmount?: number;
    loanInterestType?: string;
    fundDisbursementType?: string;
    payees: PayeeParty[];
    status?: string;
    getAsyncSideSheetValues?: () => Promise<InterestRateValue>;
} & InterestRateValue;
export type PayeeParty = {
    partyId: string;
    allocationPercentage: number | undefined;
    disbursementAmount: number | undefined;
    bankDetails: {
        branchName: string;
        nameOnAccount: string;
        accountNumber: string;
        accountType: AccountType;
    };
};
type SideSheetNewLoanTransactionProps = {
    values: NewLoanTransactionSidesheetValues;
};
type InterestRateValue = {
    interestRate?: number;
};
export default function SideSheetNewLoanTransaction({ values }: SideSheetNewLoanTransactionProps) {
    const { t } = useTranslation(undefined);
    const [sidesheetValues, setSidesheetValues] = useState(values);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getValues = async () => {
            setLoading(true);

            const asyncValues = values.getAsyncSideSheetValues ? await values.getAsyncSideSheetValues() : {};
            setSidesheetValues(vals => {
                return { ...vals, ...asyncValues };
            });
            setLoading(false);
        };
        !loading && getValues();
    }, [values.getAsyncSideSheetValues]);

    return (
        <div className="p-8">
            <Typography className="mb-4" variant={TypographyVariant.H4}>
                {t('policy.history.newloanSidesheet.loanDetails')}
            </Typography>
            <div className="grid grid-cols-2 gap-8">
                <FieldData
                    label={t('policy.history.newloanSidesheet.loanAmount')}
                    tooltipTitle={t('policy.history.newloanSidesheet.loanAmount')}
                >
                    {numberFormatify(sidesheetValues?.loanAmount)}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.processedAmount')}
                    tooltipBody={t('policy.history.newloanSidesheet.processedAmountTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.processedAmount')}
                >
                    {numberFormatify(sidesheetValues?.processedAmount)}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.loanInterestRate')}
                    tooltipBody={t('policy.history.newloanSidesheet.loanInterestRateTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.loanInterestRate')}
                >
                    {loading ? (
                        <Image
                            alt={t('policy.history.sidesheet.general.downloading')}
                            className="transform-origin-center duration-2000 animate-spin ease-linear"
                            height={20}
                            src={loadingImage}
                            width={20}
                        />
                    ) : (
                        percentFormatify(sidesheetValues?.interestRate, { isInteger: true })
                    )}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.loanInterestRateType')}
                    tooltipBody={t('policy.history.newloanSidesheet.loanInterestRateTypeTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.loanInterestRateType')}
                >
                    {toSentenceCase(sidesheetValues?.loanInterestType)}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.effectiveDate')}
                    tooltipBody={t('policy.history.newloanSidesheet.effectiveDateTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.effectiveDate')}
                >
                    {sidesheetValues?.effectiveDate}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.processDate')}
                    tooltipBody={t('policy.history.newloanSidesheet.processDateTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.processDate')}
                >
                    {sidesheetValues?.processDate}
                </FieldData>
                <FieldData
                    label={t('policy.history.newloanSidesheet.fundDisbursementType')}
                    tooltipBody={t('policy.history.newloanSidesheet.fundDisbursementTypeTooltip')}
                    tooltipTitle={t('policy.history.newloanSidesheet.fundDisbursementType')}
                >
                    {sidesheetValues?.fundDisbursementType}
                </FieldData>
            </div>

            {!!sidesheetValues.payees.length && (
                <>
                    <hr className="my-6 h-0.5 bg-gray-200" />
                    <section>
                        <Typography variant={TypographyVariant.H4}>
                            {t('policy.history.newloanSidesheet.payeeDetails.payeeDetails')}
                        </Typography>
                        <div className="mt-4">
                            <table role="table" className="w-full rounded-lg">
                                {/* Hardcoded table caption
                        TODO: This will need to be updated/cleared through Amelia for a11y purposes 
                        I have kept the comments in the aboe 2 lines and caption tage below just in case, as it was kept in alysia's pr who is using the same payeee details data, I have used the payee.allocation percentage and disbursement amount*/}
                                <caption className="hidden">
                                    Payee details table of withdrawal transaction stating whom received the percentage and dollar amount of
                                    the withdrawn amount.
                                </caption>
                                <thead>
                                    <tr role="row" className="flex">
                                        <th
                                            scope="col"
                                            className="w-[60%] rounded-tl-lg border-b-1 border-l-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-left"
                                        >
                                            <Typography variant={TypographyVariant.BodySmBold}>
                                                {t('policy.history.newloanSidesheet.payeeDetails.payee')}
                                            </Typography>
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-[30%] border-b-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right"
                                        >
                                            <Typography variant={TypographyVariant.BodySmBold}>
                                                {t('policy.history.newloanSidesheet.payeeDetails.percentage')}
                                            </Typography>
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-[30%] rounded-tr-lg border-b-1 border-r-1 border-t-1 border-gray-200 bg-gray-50 px-3 py-2 text-right"
                                        >
                                            <Typography variant={TypographyVariant.BodySmBold}>
                                                {t('policy.history.newloanSidesheet.payeeDetails.amount')}
                                            </Typography>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sidesheetValues.payees?.map((payee, index: Key) => (
                                        <tr
                                            role="row"
                                            key={index}
                                            className={`flex ${
                                                index === sidesheetValues.payees.length - 1 ? 'rounded-bl-lg rounded-br-lg' : ''
                                            }`}
                                        >
                                            <td
                                                role="cell"
                                                className={`flex w-[60%] flex-col border-b-1 border-l-1 border-gray-200 px-3 py-2 text-left ${
                                                    index === sidesheetValues.payees.length - 1 ? 'rounded-bl-lg' : ''
                                                }`}
                                            >
                                                <Typography variant={TypographyVariant.BodySmBold}>
                                                    <PiiWrapper>{payee.bankDetails.nameOnAccount}</PiiWrapper>
                                                </Typography>
                                                <Typography variant={TypographyVariant.BodySm}>
                                                    <PiiWrapper>{payee.bankDetails.branchName}</PiiWrapper>
                                                </Typography>
                                                <Typography variant={TypographyVariant.BodySm}>
                                                    <PiiWrapper>
                                                        {`${getBankAccountType(
                                                            payee.bankDetails.accountType,
                                                            t
                                                        )} ending in ${payee.bankDetails.accountNumber?.substring(
                                                            payee.bankDetails.accountNumber.length - 4
                                                        )}`}
                                                    </PiiWrapper>
                                                </Typography>
                                            </td>
                                            <td
                                                role="cell"
                                                className={`w-[30%] content-center border-b-1 border-gray-200 px-3 py-2 text-right`}
                                            >
                                                <Typography variant={TypographyVariant.BodySm}>
                                                    {percentFormatify(payee.allocationPercentage, { isInteger: true })}
                                                </Typography>
                                            </td>
                                            <td
                                                role="cell"
                                                className={`w-[30%] content-center border-b-1 border-r-1 border-gray-200 px-3 py-2 text-right ${
                                                    index === sidesheetValues.payees.length - 1 ? 'rounded-br-lg' : ''
                                                }`}
                                            >
                                                <Typography variant={TypographyVariant.BodySm}>
                                                    {numberFormatify(payee.disbursementAmount)}
                                                </Typography>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
