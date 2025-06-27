import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    DEFAULT_EXTENDED_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';

interface CancelAutopayDetailsProps {
    effectiveDate: string;
}

export const CancelAutopayDetails = ({
    effectiveDate,
}: CancelAutopayDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.cancelAutopay',
    });

    return (
        <div className="flex flex-col">
            <Label
                label={t('effectiveDate')}
                variant={LabelVariant.FieldLabel}
            />
            <Typography variant={TypographyVariant.BodySm}>
                {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                    DEFAULT_EXTENDED_DATE_FORMAT
                )}
            </Typography>
        </div>
    );
};
