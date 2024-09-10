import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useStaticNestedNavDrawerContext } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helper';
import { ProductType } from '@deps/models/policy/sor-policy';
import { ReactComponent as Newspaper } from '@deps/styles/elements/icons/brand/newspaper.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

const BASE_KEY = 'policy.detailCards.productDetails.';

export interface ProductDetailsCardData {
    carrierId?: string;
    glProductCode?: string;
    planCode?: string;
    productMarketingName?: string;
    productName?: string;
    productType?: ProductType;
}

interface ProductDetailsProps {
    productDetailsCardData: ProductDetailsCardData;
}
const ProductDetailsCard: React.FC<ProductDetailsProps> = ({ productDetailsCardData }) => {
    const { t } = useTranslation();
    const { isNavDrawerOpen } = useStaticNestedNavDrawerContext();
    return (
        <CardContainer fullWidth={false} containerClassNames="rounded-b">
            <div className="flex gap-2">
                <Newspaper className="mt-1 text-primary" role="presentation" width={'24px'} height={'24px'} />
                <div>
                    <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}productDetails`)}</Typography>
                </div>
            </div>
            <div
                className={`mt-4 grid grid-rows-6 gap-8 sm:grid-cols-2 sm:grid-rows-3 sm:gap-8 md:grid-flow-row md:grid-cols-3 md:grid-rows-none lg:ml-8 ${
                    isNavDrawerOpen ? '' : 'lg:flex'
                }`}
            >
                <div>
                    <Label label={t(`${BASE_KEY}carrierName`)} variant={LabelVariant.FieldLabel} />
                    <Content
                        details={
                            getCarrierNameByClientId(productDetailsCardData.carrierId as string) ||
                            productDetailsCardData.carrierId ||
                            DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}productMarketingName`)} variant={LabelVariant.FieldLabel} />
                    <Content
                        details={productDetailsCardData.productMarketingName ?? DEFAULT_ERROR_STRING}
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
                    <Content details={productDetailsCardData.productName ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}productType`)} variant={LabelVariant.FieldLabel} />
                    <Content
                        details={mapProductTypeToTranslation(productDetailsCardData.productType, t).label ?? DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}glProductCode`)} variant={LabelVariant.FieldLabel} />
                    <Content details={productDetailsCardData.glProductCode ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}planCode`)} variant={LabelVariant.FieldLabel} />
                    <Content details={productDetailsCardData.planCode ?? DEFAULT_ERROR_STRING} variant={ContentVariant.BodySm} />
                </div>
            </div>
        </CardContainer>
    );
};

export default ProductDetailsCard;
