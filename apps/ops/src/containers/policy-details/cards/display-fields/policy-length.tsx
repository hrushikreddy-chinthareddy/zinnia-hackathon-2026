import { ProductType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';

interface PolicyLengthProps {
    productType?: ProductType;
    policyLength: string;
    policyYearsLeft: string | null;
}

const PolicyLength = ({ productType, policyLength, policyYearsLeft }: PolicyLengthProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });
    const displayLifetimeCopy =
        !!productType &&
        (productType === ProductType.UNIVERSALLIFE ||
            productType === ProductType.INDEXEDUNIVERSALLIFE ||
            productType === ProductType.VARIABLEUNIVERSALLIFE);

    return (
        <div>
            <Label
                label={t('policyLength')}
                tooltipBody={t('policyLengthTooltip')}
                tooltipTitle={t('policyLength')}
                variant={LabelVariant.FieldLabel}
            />
            <Content details={displayLifetimeCopy ? `${t('lifetime')}` : policyLength} variant={ContentVariant.BodySm} />
            {policyYearsLeft && !displayLifetimeCopy && (
                <Content className="text-gray-600" details={policyYearsLeft} variant={ContentVariant.Caption} />
            )}
        </div>
    );
};

export default PolicyLength;
