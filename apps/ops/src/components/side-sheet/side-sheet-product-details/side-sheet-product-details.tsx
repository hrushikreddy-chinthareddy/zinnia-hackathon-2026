import { useTranslation } from 'next-i18next';

import DescriptionList from '@deps/components/description-list/description-list';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

interface SideSheetProductDetailsProps {
    globalValues: GlobalValues;
}

const SideSheetProductDetails = ({ globalValues }: SideSheetProductDetailsProps) => {
    const { t } = useTranslation();

    return (
        <div className="p-8">
            <Typography className="mb-8" variant={TypographyVariant.H2}>
                {t('dashboard.productDetails') as string}
            </Typography>
            <div className="flex gap-16">
                <DescriptionList
                    label={t('globalPolicyInfo.carrierName')}
                    // DEPU-2067 - On the short term, we're using hard-coded values stored on the UI.  Future-case will be for carrierName to come back with data
                    text={getCarrierNameByClientId(globalValues.carrierId as string) || globalValues.carrierId || DEFAULT_ERROR_STRING}
                    ariaLabel={t('globalPolicyInfo.carrierName') as string}
                    identifier="carrier-name-side-sheet"
                />
                <DescriptionList
                    label={t('globalPolicyInfo.productMarketingName')}
                    text={globalValues.marketingName || DEFAULT_ERROR_STRING}
                    ariaLabel={t('globalPolicyInfo.productMarketingName') as string}
                    identifier="product-marketing-name-side-sheet"
                />
            </div>
            <div className="flex gap-16">
                <DescriptionList
                    label={t('globalPolicyInfo.productName')}
                    text={globalValues.planName || ''}
                    tooltip={t('globalPolicyInfo.productNameTooltip') as string}
                    ariaLabel={t('globalPolicyInfo.productNameTooltip') as string}
                    identifier="product-name-side-sheet"
                />
                <DescriptionList
                    label={t('globalPolicyInfo.productType')}
                    text={mapProductTypeToTranslation(globalValues.productType, t).label as string}
                    ariaLabel={globalValues.productType}
                    identifier="product-type-side-sheet"
                />
            </div>
            <div className="flex gap-16">
                <DescriptionList
                    label={t('globalPolicyInfo.productCode')}
                    text={globalValues.glPlanCode || ''}
                    ariaLabel={t('globalPolicyInfo.productCodeTooltip') as string}
                    identifier="product-code-side-sheet"
                />
                <DescriptionList
                    label={t('globalPolicyInfo.planCode')}
                    text={globalValues.planCode || ''}
                    ariaLabel={t('globalPolicyInfo.planCodeTooltip') as string}
                    tooltipPlacement={PopoverPlacement.BottomLeft}
                    identifier="plan-code-side-sheet"
                />
            </div>
        </div>
    );
};

export default SideSheetProductDetails;
