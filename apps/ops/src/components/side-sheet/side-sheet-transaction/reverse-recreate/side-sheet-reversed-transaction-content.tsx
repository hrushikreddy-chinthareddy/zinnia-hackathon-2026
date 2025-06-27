import { Loader } from '@zinnia/bloom/components';

import FieldData, {
    FieldDataProps,
} from '@deps/components/fields/field-data/field-data';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import { SideSheetReversedTransactionModel } from './types';

const SideSheetReversedTransactionContent = ({
    t,
    loading,
    values,
}: SideSheetReversedTransactionModel) => {
    const transactionFields: Record<string, FieldDataProps> = {
        transactionType: {
            label: t('policy.history.sidesheet.transactionType'),
            children: loading ? (
                // to do - add optional alt text?
                // alt={t('policy.history.sidesheet.general.downloading')}
                <Loader />
            ) : (
                values?.transactionType
            ),
        },
        newAppliedAmount: {
            label: t('policy.history.sidesheet.newAppliedAmount'),
            tooltipBody: t('policy.history.sidesheet.newAppliedAmountTooltip'),
            tooltipTitle: t('policy.history.sidesheet.newAppliedAmount'),
            children: loading ? (
                // to do - add optional alt text?
                // alt={t('policy.history.sidesheet.general.downloading')}
                <Loader />
            ) : (
                numberFormatify(`${values?.newAppliedAmount}`)
            ),
        },
        paymentMethod: {
            label: t('policy.history.sidesheet.paymentMethod'),
            children: <PiiWrapper>{values?.paymentMethod}</PiiWrapper>,
        },
    };

    const originalTransactionFields: Record<string, FieldDataProps> = {
        submittedAmount: {
            label: t('policy.history.sidesheet.submittedAmount'),
            tooltipBody: t(
                'policy.history.sidesheet.reverseRecreateSubmittedAmountTooltip'
            ),
            tooltipTitle: t('policy.history.sidesheet.submittedAmount'),
            children: numberFormatify(`${values?.submittedAmount}`),
        },
        appliedAmount: {
            label: t('policy.history.sidesheet.appliedAmount'),
            tooltipBody: t('policy.history.sidesheet.appliedAmountTooltip'),
            tooltipTitle: t('policy.history.sidesheet.appliedAmount'),
            children: numberFormatify(`${values?.appliedAmount}`),
        },
        // XG: Hide proceess date for now
        // processDate: {
        //     label: t('policy.history.sidesheet.processDate'),
        //     tooltipBody: t('policy.history.sidesheet.processDateTooltip'),
        //     tooltipTitle: t('policy.history.sidesheet.processDate'),
        //     children: values?.processDate,
        // },
    };

    const transactionContent = (
        <div className="grid grid-cols-2 gap-8">
            {Object.entries(transactionFields).map(([key, value]) => (
                <FieldData key={key} {...value} />
            ))}
        </div>
    );

    const originalTransactionContent = (
        <>
            <Typography variant={TypographyVariant.H4} className="mb-8">
                {t('policy.history.sidesheet.originalTransactionDetails')}
            </Typography>
            <div className="grid grid-cols-2 gap-8">
                {Object.entries(originalTransactionFields).map(
                    ([key, value]) => (
                        <FieldData key={key} {...value} />
                    )
                )}
            </div>
        </>
    );

    return [transactionContent, originalTransactionContent].map(
        (content, index) => (
            <div key={index} className="mt-8 border-t-2 border-gray-200 pt-8">
                {content}
            </div>
        )
    );
};

export default SideSheetReversedTransactionContent;
