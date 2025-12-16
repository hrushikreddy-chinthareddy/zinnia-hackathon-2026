import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';

interface DeliveryDateProps {
    deliveryDate?: string;
}

const DeliveryDate = ({ deliveryDate }: DeliveryDateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });

    return (
        <div>
            <Label
                label={t('deliveryDate')}
                variant={LabelVariant.FieldLabel}
            />
            <Content details={deliveryDate} variant={ContentVariant.BodySm} />
        </div>
    );
};

export default DeliveryDate;
