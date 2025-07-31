import { ProductType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import { mapPolicyTimelineValues } from '../policy-details.helpers';
import EverlyIul from './policy-timeline-details/everly-iul';
import EverlyUl from './policy-timeline-details/everly-ul';
import TermTimelineDetails from './policy-timeline-details/term';

const BASE_KEY = 'policy.detailCards.policyTimeline.';

export function LifeTimelineCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const policyTimelineCardData = mapPolicyTimelineValues(policy, t);

    const getTimelineCard = () => {
        switch (policy.productType) {
            case ProductType.INDEXEDUNIVERSALLIFE:
                return (
                    <EverlyIul
                        policyTimelineCardData={policyTimelineCardData}
                        productType={policy.productType}
                    />
                );
            case ProductType.TERM:
                return (
                    <TermTimelineDetails
                        policyTimelineCardData={policyTimelineCardData}
                    />
                );
            default:
                return (
                    <EverlyUl
                        policyTimelineCardData={policyTimelineCardData}
                        productType={policy.productType}
                    />
                );
        }
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t('policy.detailCards.policyTimeline.policyTimeline')}
            </Typography>
            {getTimelineCard()}
        </CardContainer>
    );
}

export function AnnuityTimelineCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const { maturityDate, issueDate, policyAge, freeLookCancelDate } =
        mapPolicyTimelineValues(policy, t);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t(`${BASE_KEY}contractTimeline`)}
            </Typography>
            <div className="mt-4 grid grid-cols-[repeat(2,max-content)] gap-8 sm:grid-cols-[repeat(4,max-content)]">
                <div>
                    <Label
                        label={t(`${BASE_KEY}contractYear`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={policyAge}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}issueDate`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={issueDate}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                {maturityDate && (
                    <div>
                        <Label
                            label={t(`${BASE_KEY}maturityDate`)}
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
                        label={t(`${BASE_KEY}freeLookExpiration`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={convertKebabedDateString(freeLookCancelDate)}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </CardContainer>
    );
}

export default function TimelineCard({ policy }: BasePolicyComponentArgs) {
    if (policy.isAnnuity) {
        return <AnnuityTimelineCard policy={policy} />;
    }
    return <LifeTimelineCard policy={policy} />;
}
