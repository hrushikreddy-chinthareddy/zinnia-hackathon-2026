import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { getSalesChannelCardData } from '../policy-details.helper';

const BASE_KEY = 'policy.detailCards.salesChannel.';

export interface SalesChannelCardData {
    issueState: string;
    salesChannel: string;
}

export default function SalesChannelCard({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation();
    const salesChannelCardData = getSalesChannelCardData(policy, t);
    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}salesChannel`)}</Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                <div>
                    <Label label={t(`${BASE_KEY}issueState`)} variant={LabelVariant.FieldLabel} />
                    <Content pii={true} details={salesChannelCardData.issueState ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}salesChannel`)} variant={LabelVariant.FieldLabel} />
                    <Content details={salesChannelCardData.salesChannel ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
            </div>
        </CardContainer>
    );
}
