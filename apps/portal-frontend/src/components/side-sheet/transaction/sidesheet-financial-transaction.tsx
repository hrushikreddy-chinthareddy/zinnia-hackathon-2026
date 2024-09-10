import { Button } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { Content, ContentVariant } from '@deps/components/content/content';
import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Statuses } from '@deps/models/case/case';
import loadingImage from '@deps/styles/images/loader.png';

import SidesheetCancelPending from './sidesheet-cancel-pending';

const SidesheetViews = {
    cancel: 'cancel',
    default: 'default',
};

enum TransactionStatus {
    Canceled = 'Canceled',
}

export type FinancialTransactionSidesheetValues = {
    appliedAmount?: number;
    cancelCta?: string | null;
    effectiveDate: string;
    paymentMethod: string;
    processDate: string;
    submittedAmount?: number;
    transactionId: string;
    transactionType?: string;
    transactionValue?: string;
    status?: string;
    // A way to get one of the above values that isn't immediately available on the transaction
    getAsyncSideSheetValues?: () => Promise<Partial<Omit<FinancialTransactionSidesheetValues, 'asyncValuesGetter'>>>;
};

type SideSheetFinancialTransactionProps = {
    planCode: string | undefined;
    policyNumber: string | undefined;
    refreshTransactions?: () => void;
    values: FinancialTransactionSidesheetValues;
};
export default function SideSheetFinancialTransaction({
    planCode,
    policyNumber,
    refreshTransactions = () => {},
    values,
}: SideSheetFinancialTransactionProps) {
    const { t } = useTranslation(undefined);
    const { getAsyncSideSheetValues } = values ?? {};

    const [sidesheetValues, setSidesheetValues] = useState<FinancialTransactionSidesheetValues>(values);
    const [loading, setLoading] = useState(false);
    const [asyncValues, setAsyncValues] = useState<any | null>(null);
    const [view, setView] = useState(SidesheetViews.default);
    const { handleOpen } = useSideSheetContext();

    useEffect(() => {
        const getValues = async () => {
            setLoading(true);
            const asyncValues = getAsyncSideSheetValues ? await getAsyncSideSheetValues() : {};
            setAsyncValues(asyncValues);
            setSidesheetValues(vals => {
                return { ...vals, ...asyncValues };
            });
            setLoading(false);
        };
        !loading && !asyncValues && getAsyncSideSheetValues && getValues();
    }, [getAsyncSideSheetValues, asyncValues, setAsyncValues, loading, setLoading, setSidesheetValues]);

    switch (view) {
        case SidesheetViews.cancel:
            return (
                <SidesheetCancelPending
                    amount={sidesheetValues.transactionValue as string}
                    cancel={() => setView(SidesheetViews.default)}
                    closeSidesheet={() => {
                        refreshTransactions();
                        handleOpen(false);
                    }}
                    policyNumber={policyNumber}
                    planCode={planCode}
                    transactionId={sidesheetValues.transactionId}
                    transactionType={sidesheetValues.transactionType as string}
                />
            );
        case SidesheetViews.default:
        default:
            return (
                <div className="p-8">
                    <div className="flex flex-col gap-4 pb-8">
                        <div className="flex flex-col">
                            <Content details={numberFormatify(sidesheetValues?.transactionValue)} variant={ContentVariant.Value} />
                            <Content
                                className="text-gray-600"
                                details={t('policy.history.sidesheet.effective', { date: sidesheetValues?.effectiveDate }) as string}
                                variant={ContentVariant.Caption}
                            />
                            {values.cancelCta && (
                                <Button
                                    onClick={() => {
                                        setView(SidesheetViews.cancel);
                                    }}
                                    mode="link"
                                    size="small"
                                    className="mt-4 !p-0"
                                >
                                    {values.cancelCta}
                                </Button>
                            )}
                            {values.status === TransactionStatus.Canceled && (
                                <ChipStatus
                                    classNames="mt-4"
                                    status={'Canceled' as Statuses}
                                    statusText={t('status.canceledOn', { date: sidesheetValues?.processDate }) as string}
                                />
                            )}
                        </div>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-8">
                        {sidesheetValues?.status === 'Canceled' && (
                            <Typography variant={TypographyVariant.H4} className="mb-8">
                                {t('policy.history.sidesheet.originalTransactionDetails')}
                            </Typography>
                        )}
                        <div className="grid grid-cols-2 gap-8">
                            <FieldData label={t('policy.history.sidesheet.transactionType')}>
                                {loading ? (
                                    <Image
                                        alt={t('policy.history.sidesheet.general.downloading')}
                                        className="transform-origin-center duration-2000 animate-spin ease-linear"
                                        height={20}
                                        src={loadingImage}
                                        width={20}
                                    />
                                ) : (
                                    sidesheetValues?.transactionType
                                )}
                            </FieldData>
                            <FieldData
                                label={t('policy.history.sidesheet.processDate')}
                                tooltipBody={t('policy.history.sidesheet.processDateTooltip')}
                                tooltipTitle={t('policy.history.sidesheet.processDate')}
                            >
                                {sidesheetValues?.processDate}
                            </FieldData>
                            <FieldData
                                label={t('policy.history.sidesheet.submittedAmount')}
                                tooltipBody={t('policy.history.sidesheet.submittedAmountTooltip')}
                                tooltipTitle={t('policy.history.sidesheet.submittedAmount')}
                            >
                                {numberFormatify(sidesheetValues?.submittedAmount)}
                            </FieldData>
                            {sidesheetValues?.status !== TransactionStatus.Canceled && (
                                <FieldData
                                    label={t('policy.history.sidesheet.appliedAmount')}
                                    tooltipBody={t('policy.history.sidesheet.appliedAmountTooltip')}
                                    tooltipTitle={t('policy.history.sidesheet.appliedAmount')}
                                >
                                    {numberFormatify(sidesheetValues?.appliedAmount)}
                                </FieldData>
                            )}
                            <FieldData label={t('policy.history.sidesheet.paymentMethod')}>
                                <PiiWrapper>{sidesheetValues?.paymentMethod}</PiiWrapper>
                            </FieldData>
                        </div>
                    </div>
                </div>
            );
    }
}
