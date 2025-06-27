import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';

interface PolicyAgeProps {
    policyAge?: string;
}

const PolicyAge = ({ policyAge }: PolicyAgeProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });

    return (
        <div>
            <Label label={t('ageOfPolicy')} variant={LabelVariant.FieldLabel} />
            <Content details={policyAge} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default PolicyAge;
