import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import {
    BodyVariant,
    Button,
    Divider,
    Icon,
    IconType,
    Text,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { getProductsByCarrier } from '@deps/queries/tanstack/clientCaseQueries/clientCaseQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
import { Product, ProductTypeLabel } from '@deps/types/product';

import CarrierIcon from './carrier-icon';
import styles from './product-list.module.css';
import IllustrationItem from '../illustration-item/illustration-item';

interface IllustrationProductListProps {
    clientCase: IllustrationsClientCase;
    illustrations?: IllustrationSummary[];
    carrierProductId?: string;
    onNewIllustration?: (planCode: string) => void;
    onSelectIllustration?: (
        product: Product,
        illustration: IllustrationSummary
    ) => void;
}
const IllustrationProductList = ({
    clientCase,
    illustrations = [],
    carrierProductId = '',
    onNewIllustration,
    onSelectIllustration,
}: IllustrationProductListProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const clientCaseId = clientCase.id;

    const {
        data: products = [],
        isLoading,
        isError,
        isFetching,
    } = useQuery({
        queryKey: ['productList', clientCaseId],
        queryFn: () => {
            return getProductsByCarrier('', 'FNWL', '');
        },
        select: (data) => data.data || [],
        enabled: true,
    });

    const handleNewIllustration = (planCode: string) => {
        if (planCode) {
            onNewIllustration?.(planCode);
        } else {
            console.log('PlanCode is missing.');
        }
    };

    useEffect(() => {
        if (!isError && products.length > 0 && carrierProductId) {
            const preselectedProduct = products.find(
                (product) => product.planCode === carrierProductId
            );
            if (preselectedProduct) {
                handleNewIllustration(preselectedProduct.planCode);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

    useEffect(() => {
        if (illustrations.length > 0) {
            const firstAvailableIllustration = illustrations[0];
            const associatedProduct = products.find(
                (product) =>
                    product.carrierProductId ===
                    firstAvailableIllustration.productId
            );
            if (associatedProduct) {
                onSelectIllustration?.(
                    associatedProduct,
                    firstAvailableIllustration
                );
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [illustrations, products]);

    const availableProducts = products.filter(
        (product) => product.availableToSell
    );

    return (
        <article className={styles.productSelection}>
            {!illustrations.length && (
                <header
                    className={clsx(
                        styles.selectionTitle,
                        'typography-titles-subtitle'
                    )}
                >
                    {t('clientCase.productList.selectProduct')}
                </header>
            )}
            <Skeleton loading={isLoading || isFetching}>
                <ul className={styles.productList}>
                    {!isError &&
                        availableProducts.map(
                            (product: Product, idx: number) => {
                                const illustrationsCount = illustrations.filter(
                                    (ill) =>
                                        ill.productId ===
                                        product.carrierProductId
                                ).length;
                                const productIllustrations =
                                    illustrations.filter(
                                        (ill) =>
                                            ill.productId ===
                                            product.carrierProductId
                                    );

                                return (
                                    <li
                                        key={idx}
                                        className={styles.productWrapper}
                                    >
                                        <div className={styles.product}>
                                            <CarrierIcon
                                                carrierCode={product.carrier}
                                            />
                                            <Badge
                                                label={
                                                    ProductTypeLabel.get(
                                                        product.productType
                                                    ) ?? DEFAULT_ERROR_STRING
                                                }
                                                variant={BadgeVariant.Brand}
                                            />
                                            <span
                                                className={clsx(
                                                    !illustrationsCount &&
                                                        'typography-content-body',
                                                    !!illustrationsCount &&
                                                        'typography-titles-subtitle'
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
                                                onClick={() =>
                                                    handleNewIllustration(
                                                        product.planCode
                                                    )
                                                }
                                                className={
                                                    styles.addIllustration
                                                }
                                            >
                                                <Icon type={IconType.ADD} />
                                            </Button>
                                        </div>

                                        {productIllustrations.length ? (
                                            <ul
                                                className={
                                                    styles.illustrationsList
                                                }
                                            >
                                                {productIllustrations.map(
                                                    (illustration, pIdx) => (
                                                        <div
                                                            key={
                                                                illustration.id
                                                            }
                                                        >
                                                            <IllustrationItem
                                                                product={
                                                                    product
                                                                }
                                                                illustration={
                                                                    illustration
                                                                }
                                                                onIllustrationSelected={() =>
                                                                    onSelectIllustration?.(
                                                                        product,
                                                                        illustration
                                                                    )
                                                                }
                                                            />
                                                            {pIdx <
                                                                productIllustrations.length -
                                                                    1 && (
                                                                <Divider
                                                                    color="default"
                                                                    direction="horizontal"
                                                                />
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <Divider
                                                color="default"
                                                direction="horizontal"
                                            />
                                        )}
                                    </li>
                                );
                            }
                        )}
                </ul>
            </Skeleton>
            {(isError || !products) && (
                <div className={styles.noProducts}>
                    <Icon
                        type={IconType.HEX_EXCLAMATION}
                        alt={
                            t(
                                'clientCase.productList.noProductsIconAlt'
                            ) as string
                        }
                        height={50}
                        width={50}
                        className={styles.icon}
                    />
                    <Text as={BodyVariant.p} className="">
                        {
                            t(
                                'clientCase.productList.noProductsAvailable'
                            ) as string
                        }
                    </Text>
                </div>
            )}
        </article>
    );
};

export default IllustrationProductList;
