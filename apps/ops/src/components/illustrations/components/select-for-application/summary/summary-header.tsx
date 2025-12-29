import { CarrierAvatar } from '@zinnia/bloom/components';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { getProductCarrierName } from '@deps/components/illustrations/helpers/get-product-carrier-name';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { Product, ProductTypeLabel, ProductTypes } from '@deps/types/product';

import styles from './summary.module.css';

type IllustrationSelectForApplicationSummaryHeaderProps = {
    product: Product;
    title?: string;
};

export default function IllustrationSelectForApplicationSummaryHeader({
    product,
    title,
}: IllustrationSelectForApplicationSummaryHeaderProps) {
    return (
        <div className={styles.headerSection}>
            <CarrierAvatar
                carrier={getProductCarrierName(product)}
                height={48}
                width={48}
            />
            <div>
                <div className={styles.headerSectionSubtitleRow}>
                    <Badge
                        variant={BadgeVariant.Brand}
                        label={
                            ProductTypeLabel.get(
                                product?.productType ?? ProductTypes.TERM
                            ) ?? DEFAULT_ERROR_STRING
                        }
                    />
                    <div className={styles.headerSectionProductType}>
                        {product?.productMarketingName ?? DEFAULT_ERROR_STRING}
                    </div>
                </div>
                <h2 className={styles.headerSectionTitle}>
                    {title ?? DEFAULT_ERROR_STRING}
                </h2>
            </div>
        </div>
    );
}
