import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

interface CostBasisProps {
    costBasis?: number;
}

const CostBasis = ({ costBasis }: CostBasisProps) => {
    const { t } = useTranslation([TranslationFiles.COLDEFS]);

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.costBasis')}
            />
            <Content
                details={numberFormatify(costBasis)}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

export default CostBasis;
