import { useTranslation } from 'react-i18next';

import { useRidersLabelMap } from '@deps/components/illustrations/components/details/content/use-riders-label-map';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePrintContext } from '@deps/contexts/printContext';
import { NumberOrRange, QuickQuoteFormState } from '@deps/types/quickQuote';
import { RiderDataItem } from '@deps/utils/quick-quotes-rules/types';

import { QuickQuoteRiderRowHeader } from './rider-row-header';
import { useQuickQuoteParams } from '../../params-context';
import { QuickQuoteResultTableRow } from '../base/result-table-row';
import styles from '../content.module.css';
import { useQuickQuoteResults } from '../results-context';

type QuickQuoteRiderRowProps = {
    riderName: keyof QuickQuoteFormState['riders'];
};

export const QuickQuoteRiderRow = (props: QuickQuoteRiderRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();
    const params = useQuickQuoteParams();
    const { riderName } = props;
    const { isPrinting } = usePrintContext();
    const isActive = !!params.riders[riderName];
    const riderLabel = useRidersLabelMap()[riderName];

    if (!results) {
        return null;
    }

    const data = results.map(
        (result): RiderDataItem => ({
            period: 'mo.',
            value: result.data.riders?.[riderName]?.range as NumberOrRange,
            notAvailabilityReasons:
                result.data.riders?.[riderName]?.notAvailabilityReasonField,
        })
    );

    const rowHeader = isPrinting ? (
        <Typography variant={TypographyVariant.FieldLabel}>
            {riderLabel}
        </Typography>
    ) : (
        <QuickQuoteRiderRowHeader riderName={riderName} />
    );

    return (
        <QuickQuoteResultTableRow
            rowHeader={rowHeader}
            data={isActive ? data : []}
        >
            {!isActive && (
                <div className={styles.notAvailableReasonCell}>
                    <Typography
                        className={styles.notAvailableText}
                        variant={TypographyVariant.BodySm}
                    >
                        {t(
                            'clientCase.quickQuoteResults.riders.disabledPlaceholder'
                        )}
                    </Typography>
                </div>
            )}
        </QuickQuoteResultTableRow>
    );
};
