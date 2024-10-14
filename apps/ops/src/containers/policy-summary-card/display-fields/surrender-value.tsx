import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helper';

interface SurrenderValueProps {
    surrenderValue?: number;
}

// TODO MG: this should be shared with the component in policy timelines
const SurrenderValue = ({ surrenderValue }: SurrenderValueProps) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.surrenderValue')}
                tooltipTitle={t('colDefs:policySummary.surrenderValue')}
                tooltipBody={t('colDefs:policySummary.surrenderValueTooltip')}
            />
            <Content details={numberFormatify(surrenderValue)} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default SurrenderValue;
