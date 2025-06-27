import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

interface BaseDeathBenefitProps {
    baseDeathBenefit?: number;
}

const BaseDeathBenefit = ({ baseDeathBenefit }: BaseDeathBenefitProps) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.baseDeathBenefit')}
                tooltipTitle={t('colDefs:policySummary.baseDeathBenefit')}
                tooltipBody={t('colDefs:policySummary.baseDeathBenefitTooltip')}
            />
            <Content
                details={numberFormatify(baseDeathBenefit)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

export default BaseDeathBenefit;
