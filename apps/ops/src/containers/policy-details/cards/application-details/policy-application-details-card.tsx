import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { getApplicationDetailsData } from '../../policy-details.helpers';
const BASE_KEY = 'policy.detailCards.applicationDetails.';
export function PolicyApplicationDetailsCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const applicationDetailsData = getApplicationDetailsData(policy, t);
    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}applicationDetails`)}</Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                <div>
                    <Label label={t(`${BASE_KEY}issueState`)} variant={LabelVariant.FieldLabel} />
                    <Content
                        pii={true}
                        details={applicationDetailsData.issueState ?? DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}salesChannel`)} variant={LabelVariant.FieldLabel} />
                    <Content details={applicationDetailsData.salesChannel ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}applicationSource`)} variant={LabelVariant.FieldLabel} />
                    <Content details={applicationDetailsData.applicationSource} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}applicationSourceDetails`)} variant={LabelVariant.FieldLabel} />
                    <Content details={applicationDetailsData.applicationSourceDetails} variant={ContentVariant.BodySm} />
                </div>
                {applicationDetailsData.multiPolicyDiscount && (
                    <div>
                        <Label label={t(`${BASE_KEY}multiPolicyDiscount`)} variant={LabelVariant.FieldLabel} />
                        <Content
                            details={applicationDetailsData.multiPolicyDiscount ?? DEFAULT_ERROR_STRING}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                )}
                <div>
                    <Label
                        label={t(`${BASE_KEY}originalPolicyNumber`)}
                        variant={LabelVariant.FieldLabel}
                        tooltipBody={t(`${BASE_KEY}originalPolicyNumberTooltip`)}
                        tooltipTitle={t(`${BASE_KEY}originalPolicyNumber`)}
                    />
                    <Content details={applicationDetailsData.originalPolicyNumber} variant={ContentVariant.BodySm} />
                </div>
            </div>
        </CardContainer>
    );
}
