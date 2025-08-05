import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import {
    BodyVariant,
    Button,
    Icon,
    IconType,
    Text,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getProductsByCarrier } from '@deps/queries/tanstack/clientCaseQueries/clientCaseQueries';
import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import IllustrationProductItem from './product-item';
import styles from './product-list.module.css';
import EappContainer from '../../eapp/eapp-container';

type ProductWithIllustration = Product & {
    illustrations: IllustrationSummary[];
};

interface IllustrationProductListProps {
    clientCase: IllustrationsClientCase;
    illustrations?: IllustrationSummary[];
    carrierProductId?: string;
    onNewIllustration?: (planCode: string) => void;
}
const IllustrationProductList = ({
    clientCase,
    illustrations = [],
    carrierProductId = '',
}: IllustrationProductListProps) => {
    const { handleSelectIllustration } = useSelectedIllustration();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const clientCaseId = clientCase.id;
    const [showEmptyProducts, setShowEmptyProducts] = useState(false);
    const sideSheet = useSideSheetContext();
    const router = useRouter();
    const { illustrationId } = router.query;

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
        if (planCode && clientCase) {
            sideSheet.changeSideSheetContent(
                'Add Illustration',
                <EappContainer planCode={planCode} clientCase={clientCase} />
            );
            sideSheet.handleOpen(true, '50%');
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
            let firstAvailableIllustration;

            if (illustrationId) {
                firstAvailableIllustration = illustrations.find(
                    (illustration) => illustration.id === illustrationId
                );
            } else {
                firstAvailableIllustration = illustrations[0];
            }
            const associatedProduct = products.find(
                (product) =>
                    product.carrierProductId ===
                    firstAvailableIllustration?.productId
            );

            if (associatedProduct && firstAvailableIllustration) {
                handleSelectIllustration(
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

    const productsWithIllustrations: ProductWithIllustration[] =
        availableProducts.map((product) => {
            const associatedIllustrations = illustrations.filter(
                (illustration) =>
                    illustration.productId === product.carrierProductId
            );
            return { ...product, illustrations: associatedIllustrations };
        });

    const productsWithIllustrationsCount = productsWithIllustrations.filter(
        (product) => !!product.illustrations.length
    ).length;
    const productsWithoutIllustrationsCount = productsWithIllustrations.filter(
        (product) => !product.illustrations.length
    ).length;

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
                {productsWithIllustrationsCount === 0 && (
                    <ul className={styles.productList}>
                        {!isError &&
                            availableProducts.map(
                                (product: Product, idx: number) => {
                                    return (
                                        <IllustrationProductItem
                                            key={idx}
                                            product={product}
                                            onNewIllustration={
                                                handleNewIllustration
                                            }
                                        />
                                    );
                                }
                            )}
                    </ul>
                )}

                <ul className={styles.productList}>
                    {!isError &&
                        productsWithIllustrations
                            .filter((product) => !!product.illustrations.length)
                            .map(
                                (
                                    product: ProductWithIllustration,
                                    idx: number
                                ) => {
                                    return (
                                        <IllustrationProductItem
                                            key={idx}
                                            product={product}
                                            illustrations={
                                                product.illustrations
                                            }
                                            eAppId={clientCase.eAppId}
                                            onNewIllustration={
                                                handleNewIllustration
                                            }
                                        />
                                    );
                                }
                            )}
                </ul>

                {!isError &&
                    productsWithIllustrationsCount > 0 &&
                    productsWithoutIllustrationsCount > 0 && (
                        <Button
                            key={'add-product-btn'}
                            mode="link"
                            data-testid="addproduct-link-btn"
                            aria-label={
                                t(
                                    'clientCase.illustrationDetails.addProductAriaLabel'
                                ) as string
                            }
                            type="button"
                            size="small"
                            className={clsx(styles.displayProducts)}
                            onClick={() =>
                                setShowEmptyProducts(!showEmptyProducts)
                            }
                        >
                            <Icon type={IconType.ADD}></Icon>
                            <span>
                                {t('clientCase.productList.seeProducts')}
                            </span>
                            <Icon
                                type={IconType.CHEVRON}
                                className={clsx(
                                    'text-semantic-warning',
                                    styles.chevron,
                                    showEmptyProducts && styles.arrowDown
                                )}
                            ></Icon>
                        </Button>
                    )}

                {showEmptyProducts && (
                    <ul className={styles.productList}>
                        {productsWithIllustrations
                            .filter((product) => !product.illustrations.length)
                            .map(
                                (
                                    product: ProductWithIllustration,
                                    idx: number
                                ) => {
                                    return (
                                        <IllustrationProductItem
                                            key={idx}
                                            product={product}
                                            onNewIllustration={
                                                handleNewIllustration
                                            }
                                        />
                                    );
                                }
                            )}
                    </ul>
                )}
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
