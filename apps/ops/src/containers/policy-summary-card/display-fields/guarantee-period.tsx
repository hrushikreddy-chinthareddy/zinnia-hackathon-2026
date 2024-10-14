import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface GuaranteePeriodProps {
    guaranteePeriod?: string;
}

const GuaranteePeriod = ({ guaranteePeriod }: GuaranteePeriodProps) => {
    const { t } = useTranslation([TranslationFiles.COLDEFS]);

    return (
        <div>
            <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.guaranteePeriod')} />
            <Content details={guaranteePeriod || DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default GuaranteePeriod;
