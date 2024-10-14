import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helper';

interface FreeLookCancelDateProps {
    freeLookCancelDate?: string;
}

// TODO MG: this should be shared with the component in policy timelines
const FreeLookCancelDate = ({ freeLookCancelDate }: FreeLookCancelDateProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    return (
        <div>
            <Label variant={LabelVariant.FieldLabel} label={t('colDefs:policySummary.freeLookCancelDate')} />
            <Content details={convertKebabedDateString(freeLookCancelDate)} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default FreeLookCancelDate;
