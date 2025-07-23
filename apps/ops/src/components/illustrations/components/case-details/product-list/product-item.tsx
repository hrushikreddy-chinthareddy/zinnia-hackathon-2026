import { Button, Divider, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { IllustrationSummary } from '@deps/types/illustrations';
import { Product, ProductTypeLabel } from '@deps/types/product';

import CarrierIcon from './carrier-icon';
import styles from './product-item.module.css';
import IllustrationItem from '../illustration-item/illustration-item';

interface IllustrationProductItemProps {
    product: Product;
    illustrations?: IllustrationSummary[];
    onNewIllustration?: (planCode: string) => void;
}

const IllustrationProductItem = ({
    product,
    illustrations,
    onNewIllustration,
}: IllustrationProductItemProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustrationsCount = (illustrations ?? []).length;
    const router = useRouter();
    const { illustrationId } = router.query;

    return (
        <li className={styles.productWrapper}>
            <div className={styles.product}>
                <CarrierIcon carrierCode={product.carrier} />
                <Badge
                    label={
                        ProductTypeLabel.get(product.productType) ??
                        DEFAULT_ERROR_STRING
                    }
                    variant={BadgeVariant.Brand}
                />
                <span
                    className={clsx(
                        !illustrationsCount && 'typography-content-body',
                        !!illustrationsCount && 'typography-titles-subtitle'
                    )}
                >
                    {product.productMarketingName}
                </span>
                <Button
                    mode="link"
                    data-testid="add-illustration-btn"
                    aria-label={
                        t(
                            'clientCase.productList.addIllustrationButton'
                        ) as string
                    }
                    type="button"
                    size="small"
                    onClick={() => onNewIllustration?.(product.planCode)}
                    className={styles.addIllustration}
                >
                    <Icon type={IconType.ADD} />
                </Button>
            </div>

            {illustrations && illustrations.length ? (
                <ul className={styles.illustrationsList}>
                    {illustrations.map((illustration, pIdx) => (
                        <div key={illustration.id}>
                            <IllustrationItem
                                product={product}
                                illustration={illustration}
                                isSelected={illustration.id === illustrationId}
                            />
                            {pIdx < illustrations.length - 1 && (
                                <Divider
                                    color="default"
                                    direction="horizontal"
                                />
                            )}
                        </div>
                    ))}
                </ul>
            ) : (
                <Divider color="default" direction="horizontal" />
            )}
        </li>
    );
};

export default IllustrationProductItem;
