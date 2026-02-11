import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { QuickQuoteResultTableFieldName } from '@deps/types/quickQuote';

import styles from '../content.module.css';

type QuickQuoteResultTableErrorCellProps = {
    termLength: number;
    fieldName: QuickQuoteResultTableFieldName;
};

export const QuickQuoteResultTableErrorCell = ({
    termLength,
    fieldName,
}: QuickQuoteResultTableErrorCellProps) => {
    const { t } = useTranslation();

    const errorText =
        fieldName === QuickQuoteResultTableFieldName.BASE_PREMIUM_RANGE
            ? t('allFields.illustrationsQuickQuoteBasePremiumRangeError', {
                  years: termLength,
              })
            : fieldName === QuickQuoteResultTableFieldName.TOTAL_PREMIUM_RANGE
            ? t('allFields.illustrationsQuickQuoteTotalPremiumRangeError', {
                  years: termLength,
              })
            : t('allFields.illustrationsQuickQuoteGenericError', {
                  years: termLength,
              });

    return (
        <div className={clsx(styles.contentErrorCell, styles.errorText)}>
            <AssistiveText
                text={errorText}
                variant={AssistiveTextVariant.Error}
            />
        </div>
    );
};
