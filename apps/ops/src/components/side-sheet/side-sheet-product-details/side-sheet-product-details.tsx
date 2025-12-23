import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import styles from './side-sheet-product-details.module.css';

interface SideSheetProductDetailsProps {
    globalValues: GlobalValues;
}

const SideSheetProductDetails = ({
    globalValues,
}: SideSheetProductDetailsProps) => {
    const { t } = useTranslation();

    return (
        <div className={styles.contentBody}>
            <Typography
                className={styles.headerSection}
                variant={TypographyVariant.H2}
            >
                {t('allFields.dashboardProductDetails') ?? ''}
            </Typography>
            <div className={styles.entryRow}>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.carrierName')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            getCarrierNameByClientId(
                                globalValues.carrierId ?? ''
                            ) ||
                            globalValues.carrierId ||
                            DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.productMarketingName')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            globalValues.marketingName || DEFAULT_ERROR_STRING
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
            <div className={styles.entryRow}>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.productName')}
                        tooltipTitle={t('allFields.productName')}
                        tooltipBody={t('allFields.productNameTooltip') ?? ''}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={globalValues.planName || ''}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.productType')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={
                            mapProductTypeToTranslation(
                                globalValues.productType,
                                t
                            ).label ?? ''
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
            <div className={styles.entryRow}>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.productCode')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={globalValues.glPlanCode || ''}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div className={styles.entryField}>
                    <Label
                        label={t('allFields.planCode')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={globalValues.planCode || ''}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </div>
    );
};

export default SideSheetProductDetails;
