import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { ProductType } from '@deps/models/policy/sor-policy';
import { ReactComponent as Calendar } from '@deps/styles/elements/icons/content/calendar.svg';

import EverlyIul from './policy-timeline-details/everly-iul';
import EverlyUl from './policy-timeline-details/everly-ul';
import { mapPolicyTimelineValues } from '../policy-details.helper';

const BASE_KEY = 'policy.detailCards.policyTimeline.';
export interface PolicyTimelineCardData {
    issueDate: string;
    fixedCostPeriod?: number;
    fixedCostPeriodLeft?: number;
    freeLookCancelDate?: string;
    maturityDate: string | null;
    policyAge: string;
    policyLength: string;
    policyYearsLeft: string | null;
}

function PolicyTimelineCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const policyTimelineCardData = mapPolicyTimelineValues(policy, t);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <Calendar className="mt-1 text-primary" role="presentation" width={'24px'} height={'24px'} />
                <Typography variant={TypographyVariant.H2}>{t('policy.detailCards.policyTimeline.policyTimeline')}</Typography>
            </div>
            {policy.productType === ProductType.INDEXEDUNIVERSALLIFE ? (
                <EverlyIul policyTimelineCardData={policyTimelineCardData} productType={policy.productType} />
            ) : (
                <EverlyUl policyTimelineCardData={policyTimelineCardData} productType={policy.productType} />
            )}
        </CardContainer>
    );
}

function ContractTimelineCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const { maturityDate, issueDate, policyAge } = mapPolicyTimelineValues(policy, t);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <Calendar className="mt-1 text-primary" role="presentation" width={'24px'} height={'24px'} />
                <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}contractTimeline`)}</Typography>
            </div>
            <div className="mt-4 grid grid-cols-[repeat(2,max-content)] gap-8 sm:grid-cols-[repeat(3,max-content)] lg:ml-8">
                <div>
                    <Label label={t(`${BASE_KEY}ageOfContract`)} variant={LabelVariant.FieldLabel} />
                    <Content details={policyAge} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}issueDate`)} variant={LabelVariant.FieldLabel} />
                    <Content details={issueDate} variant={ContentVariant.BodySm} />
                </div>
                {maturityDate && (
                    <div>
                        <Label label={t(`${BASE_KEY}maturityDate`)} variant={LabelVariant.FieldLabel} />
                        <Content details={maturityDate} variant={ContentVariant.BodySm} />
                    </div>
                )}
            </div>
        </CardContainer>
    );
}

export default function TimelineCard({ policy }: BasePolicyComponentArgs) {
    if (policy.isAnnuity) {
        return <ContractTimelineCard policy={policy} />;
    }
    return <PolicyTimelineCard policy={policy} />;
}
