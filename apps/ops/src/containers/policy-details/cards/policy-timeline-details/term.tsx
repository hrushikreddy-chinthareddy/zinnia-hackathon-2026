import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { ProductType } from '@zinnia/api-types/types/sor';

import DeliveryDate from '../display-fields/delivery-date';
import IssueDate from '../display-fields/issue-date';
import PolicyAge from '../display-fields/policy-age';
import { TermPolicyLength } from '../display-fields/policy-length-term';
import { PolicyTimelineCardData } from '../timeline-card.types';

interface EverlyIulProps {
    policyTimelineCardData: PolicyTimelineCardData;
    productType?: ProductType;
    policyFixedCostPeriod?: number;
}

const TermTimelineDetails = ({ policyTimelineCardData }: EverlyIulProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });

    const {
        freeLookCancelDate,
        issueDate,
        maturityDate,
        policyAge,
        fixedCostPeriod,
        deliveryDate,
    } = policyTimelineCardData;

    return (
        <div className="mt-4 grid grid-cols-2 gap-8 sm:flex sm:flex-wrap">
            <TermPolicyLength policyFixedCostPeriod={fixedCostPeriod} />
            <PolicyAge policyAge={policyAge} />
            <IssueDate issueDate={issueDate} />
            <DeliveryDate deliveryDate={deliveryDate} />
            {maturityDate && (
                <div>
                    <Label
                        label={t('maturityDate')}
                        tooltipBody={t('maturityDateTooltip')}
                        tooltipTitle={t('maturityDate')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={maturityDate}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            )}
            <div>
                <Label
                    label={t('freeLookExpiration')}
                    tooltipTitle={t('freeLookExpiration')}
                    variant={LabelVariant.FieldLabel}
                />
                <Content
                    details={convertKebabedDateString(freeLookCancelDate)}
                    variant={ContentVariant.BodySm}
                />
            </div>
        </div>
    );
};

export default TermTimelineDetails;
