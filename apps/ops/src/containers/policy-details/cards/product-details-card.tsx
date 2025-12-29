import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

const BASE_KEY = 'policy.detailCards.productDetails.';

export default function ProductDetailsCard({
    policy,
}: BasePolicyComponentArgs) {
    const { t } = useTranslation();

    return (
        <CardContainer fullWidth={false} containerClassNames="rounded-b">
            <Typography variant={TypographyVariant.H2}>
                {t(`${BASE_KEY}productDetails`)}
            </Typography>
            <div className={`mt-4 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap`}>
                <div>
                    <Label
                        label={t(`${BASE_KEY}carrierName`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            getCarrierNameByClientId(
                                policy.carrierId as string
                            ) ||
                            policy.carrierId ||
                            DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}productMarketingName`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={policy.marketingName ?? DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}productName`)}
                        tooltipBody={t(`${BASE_KEY}productNameTooltip`)}
                        tooltipTitle={t(`${BASE_KEY}productName`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            policy?.policy?.product?.planName ??
                            DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}productType`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            mapProductTypeToTranslation(policy.productType, t)
                                .label || DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}glProductCode`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            policy?.policy?.product?.generalLedgerPlanCode ??
                            DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label
                        label={t(`${BASE_KEY}planCode`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={policy.planCode ?? DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </CardContainer>
    );
}
