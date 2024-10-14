import Image from 'next/image';

import FieldData from "@deps/components/fields/field-data/field-data";
import { PiiWrapper } from "@deps/components/pii/PiiWrapper";
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { numberFormatify } from "@deps/helpers/numbers.helper";
import { TransactionStatus } from "@deps/models/policy/sor-policy";
import loadingImage from '@deps/styles/images/loader.png';

import { SideSheetFinancialTransactionViewModel } from './types';

const SideSheetFinancialTransactionContent = ({
    t,
    loading,
    values
}: SideSheetFinancialTransactionViewModel) => {
    // TODO MG: closing side sheet hits this
    const { appliedAmount, paymentMethod, processDate, submittedAmount, status, transactionType } = values || {};

    return (
        <div className="mt-8 border-t-2 border-gray-200 pt-8">
            {status === TransactionStatus.Canceled && (
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
                        transactionType
                    )}
                </FieldData>
                <FieldData
                    label={t('policy.history.sidesheet.processDate')}
                    tooltipBody={t('policy.history.sidesheet.processDateTooltip')}
                    tooltipTitle={t('policy.history.sidesheet.processDate')}
                >
                    {processDate}
                </FieldData>
                <FieldData
                    label={t('policy.history.sidesheet.submittedAmount')}
                    tooltipBody={t('policy.history.sidesheet.submittedAmountTooltip')}
                    tooltipTitle={t('policy.history.sidesheet.submittedAmount')}
                >
                    {numberFormatify(submittedAmount)}
                </FieldData>
                {status !== TransactionStatus.Canceled && (
                    <FieldData
                        label={t('policy.history.sidesheet.appliedAmount')}
                        tooltipBody={t('policy.history.sidesheet.appliedAmountTooltip')}
                        tooltipTitle={t('policy.history.sidesheet.appliedAmount')}
                    >
                        {numberFormatify(appliedAmount)}
                    </FieldData>
                )}
                <FieldData label={t('policy.history.sidesheet.paymentMethod')}>
                    <PiiWrapper>{paymentMethod}</PiiWrapper>
                </FieldData>
            </div>
        </div>
    );
};

export default SideSheetFinancialTransactionContent;
