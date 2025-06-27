import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

interface MaturityDateProps {
    maturityDate?: string;
}

const MaturityDate = ({ maturityDate }: MaturityDateProps) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.maturityDate')}
            />
            <Content
                details={convertKebabedDateString(maturityDate)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

export default MaturityDate;
