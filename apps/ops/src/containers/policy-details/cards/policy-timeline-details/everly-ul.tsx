import { ProductType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import IssueDate from '../display-fields/issue-date';
import PolicyAge from '../display-fields/policy-age';
import PolicyLength from '../display-fields/policy-length';
import { PolicyTimelineCardData } from '../timeline-card';

interface EverlyUlPolicyProps {
    policyTimelineCardData: PolicyTimelineCardData;
    productType?: ProductType;
}

const EverlyUl = ({
    policyTimelineCardData,
    productType,
}: EverlyUlPolicyProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });
    const {
        issueDate,
        maturityDate,
        policyAge,
        policyLength,
        policyYearsLeft,
        freeLookCancelDate,
    } = policyTimelineCardData;

    return (
        <div className="mt-4 grid grid-cols-2 gap-8 sm:flex sm:flex-wrap">
            <PolicyLength
                productType={productType}
                policyLength={policyLength}
                policyYearsLeft={policyYearsLeft}
            />
            <PolicyAge policyAge={policyAge} />
            <IssueDate issueDate={issueDate} />
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

export default EverlyUl;
