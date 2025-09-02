import {
    BodyVariant,
    Button,
    Icon,
    IconType,
    Loader,
    Text,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { getNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';
import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import IllustrationProductItem from './product-item';
import styles from './product-list.module.css';

export function isJuvenile(dateOfBirth?: string): boolean {
    const dob = new Date(dateOfBirth || '');

    if (!dob || dob.toString() === 'Invalid Date') {
        return false; // no DOB provided, cannot determine age
    }

    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
            today.getDate() >= dob.getDate());

    const exactAge = hasHadBirthdayThisYear ? age : age - 1;

    return exactAge < 18;
}

export function findAvailableProducts(
    products: Product[],
    insuredDateOfBirth?: string
): Product[] {
    return products.filter(
        (product) =>
            product.availableToSell &&
            !(product.productType === 'TERM' && isJuvenile(insuredDateOfBirth))
    );
}

async function filterProductsByPlanCodeFromEapp(
    products: Product[],
    eAppId: string | undefined
): Promise<Product[]> {
    if (!eAppId) return products;

    const nbReq = await getNewBusinessEApp(eAppId);
    if (!nbReq.data?.policy?.planCode) return products;

    const planCode = nbReq.data?.policy?.planCode;
    return products.filter((product) => product.planCode === planCode);
}

type ProductWithIllustration = Product & {
    illustrations: IllustrationSummary[];
};

interface IllustrationProductListProps {
    clientCase: IllustrationsClientCase;
    illustrations?: IllustrationSummary[];
    carrierProductId?: string;
    products?: Product[];
    isError?: boolean;
    onNewIllustration?: (planCode: string) => void;
}
const IllustrationProductList = ({
    clientCase,
    illustrations = [],
    carrierProductId = '',
    products = [],
    isError = false,
}: IllustrationProductListProps) => {
    const { selectedIllustration, handleSelectIllustration } =
        useSelectedIllustration();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [showEmptyProducts, setShowEmptyProducts] = useState(false);
    const [isProcessingProducts, setIsProcessingProducts] = useState(true);

    const router = useRouter();
    const { illustrationId } = router.query;

    const navigateToIllustration = useCallback(
        (id: string) => {
            router.push(`${router.asPath}/${id}`);
        },
        [router]
    );

    // Handle illustration selection from URL
    useEffect(() => {
        if (!illustrationId || !illustrations.length) return;

        const targetIllustration = illustrations.find(
            (ill) => ill.id === illustrationId
        );
        const associatedProduct = products.find(
            (product) =>
                product.carrierProductId === targetIllustration?.productId
        );

        if (
            targetIllustration &&
            associatedProduct &&
            selectedIllustration?.illustration?.id !== illustrationId
        ) {
            handleSelectIllustration(associatedProduct, targetIllustration);
        }
    }, [
        illustrationId,
        illustrations,
        products,
        selectedIllustration?.illustration?.id,
        handleSelectIllustration,
    ]);

    const availableProducts = useMemo(() => {
        return findAvailableProducts(
            products,
            String(clientCase.insuredDetails?.dateOfBirth || '')
        );
    }, [products, clientCase.insuredDetails?.dateOfBirth]);

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    useEffect(() => {
        let cancelled = false;
        const filter = async () => {
            setIsProcessingProducts(true);
            let filtered = availableProducts;
            if (clientCase.eAppId) {
                filtered = await filterProductsByPlanCodeFromEapp(
                    availableProducts,
                    clientCase.eAppId
                );
            }
            if (!cancelled) {
                setFilteredProducts(filtered);
                setIsProcessingProducts(false);
            }
        };
        filter();
        return () => {
            cancelled = true;
        };
    }, [availableProducts, clientCase.eAppId]);

    const productsWithIllustrationsData: ProductWithIllustration[] =
        filteredProducts.map((product) => {
            const associatedIllustrations = illustrations.filter(
                (illustration) =>
                    illustration.productId === product.carrierProductId
            );
            return { ...product, illustrations: associatedIllustrations };
        });
    // .filter((product) => !!product.illustrations.length);

    const productsWithIllustrations = productsWithIllustrationsData.filter(
        (product) => !!product.illustrations.length
    );
    const productsWithoutIllustrations = productsWithIllustrationsData.filter(
        (product) => !product.illustrations.length
    );
    const productsWithIllustrationsCount = productsWithIllustrations.length;
    const productsWithoutIllustrationsCount =
        productsWithoutIllustrations.length;

    // Auto-select first illustration when none is selected and route to it
    useEffect(() => {
        if (
            !productsWithIllustrations?.[0]?.illustrations?.length ||
            illustrationId
        ) {
            return;
        }

        const firstIllustration = productsWithIllustrations[0].illustrations[0];
        if (firstIllustration) {
            navigateToIllustration(firstIllustration.id);
        }
    }, [productsWithIllustrations, illustrationId, navigateToIllustration]);

    const preselectedProduct = products.find(
        (product) => product.planCode === carrierProductId
    );

    // Show loader while processing products
    if (isProcessingProducts) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '2rem',
                }}
            >
                <Loader />
            </div>
        );
    }

    return (
        <article className={styles.productSelection}>
            {productsWithIllustrationsCount === 0 && (
                <header
                    className={clsx(
                        styles.selectionTitle,
                        'typography-titles-subtitle'
                    )}
                >
                    {t('clientCase.productList.selectProduct')}
                </header>
            )}
            {productsWithIllustrationsCount === 0 && (
                <ul className={styles.productList}>
                    {!isError &&
                        filteredProducts.map(
                            (product: Product, idx: number) => {
                                return (
                                    <IllustrationProductItem
                                        key={idx}
                                        product={product}
                                        clientCase={clientCase}
                                        preselectedProduct={preselectedProduct}
                                    />
                                );
                            }
                        )}
                </ul>
            )}
            {productsWithIllustrationsCount > 0 && (
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
                                            clientCase={clientCase}
                                            preselectedProduct={
                                                preselectedProduct
                                            }
                                        />
                                    );
                                }
                            )}
                </ul>
            )}

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
                        onClick={() => setShowEmptyProducts(!showEmptyProducts)}
                    >
                        <Icon type={IconType.ADD}></Icon>
                        <span>{t('clientCase.productList.seeProducts')}</span>
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
                    {productsWithIllustrationsData
                        .filter((product) => !product.illustrations.length)
                        .map(
                            (product: ProductWithIllustration, idx: number) => {
                                return (
                                    <IllustrationProductItem
                                        key={idx}
                                        product={product}
                                        clientCase={clientCase}
                                        preselectedProduct={preselectedProduct}
                                    />
                                );
                            }
                        )}
                </ul>
            )}

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
