import { TransactionStatus } from '@xd/api-types/dist/generated-types/sor';
import { Loader } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import FieldData from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import { TransactionSideSheetValues } from '../types';

export interface SideSheetFinancialTransactionContentProps {
    loading?: boolean;
    values: TransactionSideSheetValues;
    t: TFunction;
}

const SideSheetFinancialTransactionContent = ({
    loading,
    values,
    t,
}: SideSheetFinancialTransactionContentProps) => {
    const {
        appliedAmount,
        paymentMethod,
        processDate,
        submittedAmount,
        status,
        transactionType,
    } = values;

    return (
        <div className="mt-8 border-t-2 border-gray-200 pt-8">
            {status === TransactionStatus.CANCELED && (
                <Typography variant={TypographyVariant.H4} className="mb-8">
                    {t('policy.history.sidesheet.originalTransactionDetails')}
                </Typography>
            )}
            <div className="grid grid-cols-2 gap-8">
                <FieldData
                    label={t('policy.history.sidesheet.transactionType')}
                >
                    {loading ? (
                        // to do - add optional alt text?
                        // alt={t('policy.history.sidesheet.general.downloading')}
                        <Loader />
                    ) : (
                        transactionType
                    )}
                </FieldData>
                <FieldData
                    label={t('policy.history.sidesheet.processDate')}
                    tooltipBody={t(
                        'policy.history.sidesheet.processDateTooltip'
                    )}
                    tooltipTitle={t('policy.history.sidesheet.processDate')}
                >
                    {processDate}
                </FieldData>
                <FieldData
                    label={t('policy.history.sidesheet.submittedAmount')}
                    tooltipBody={t(
                        'policy.history.sidesheet.submittedAmountTooltip'
                    )}
                    tooltipTitle={t('policy.history.sidesheet.submittedAmount')}
                >
                    {numberFormatify(submittedAmount)}
                </FieldData>
                {status !== TransactionStatus.CANCELED && (
                    <FieldData
                        label={t('policy.history.sidesheet.appliedAmount')}
                        tooltipBody={t(
                            'policy.history.sidesheet.appliedAmountTooltip'
                        )}
                        tooltipTitle={t(
                            'policy.history.sidesheet.appliedAmount'
                        )}
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
