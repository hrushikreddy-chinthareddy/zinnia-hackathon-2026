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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useIllustrationHeader } from '@deps/components/illustrations/helpers/hooks/use-illustration-header';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';
import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
import { Product } from '@deps/types/product';

import IllustrationProductItem from './product-item';
import styles from './product-list.module.css';
import EappContainer from '../../eapp/eapp-container';

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
    const sideSheet = useSideSheetContext();
    const { buildIllustrationHeader } = useIllustrationHeader();
    const router = useRouter();
    const { illustrationId } = router.query;

    const handleNewIllustration = useCallback(
        (planCode: string) => {
            if (!planCode || !clientCase) {
                console.log('PlanCode is missing.');
                return;
            }
            const actionTitle = t(
                'clientCase.productList.addIllustration'
            ) as string;
            const eappHeader = buildIllustrationHeader(
                planCode,
                clientCase,
                actionTitle
            );
            sideSheet.changeSideSheetContent(
                eappHeader,
                <EappContainer planCode={planCode} clientCase={clientCase} />
            );
            sideSheet.handleOpen(true, '50%');
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sideSheet changes on mutation
        [clientCase]
    );

    // if a carrierProductId is passed to the component, open the new illustraion panel for that product
    useEffect(() => {
        if (!isError && products.length > 0 && carrierProductId) {
            const preselectedProduct = products.find(
                (product) => product.planCode === carrierProductId
            );
            if (preselectedProduct) {
                handleNewIllustration(preselectedProduct.planCode);
            }
        }
    }, [products, carrierProductId, isError, handleNewIllustration]);

    // TODO:Move this to the SelectedIllustrationProvider if possible
    useEffect(() => {
        if (
            !illustrations.length ||
            illustrationId === selectedIllustration?.illustration.id
        ) {
            return;
        }

        const firstAvailableIllustration = illustrationId
            ? illustrations.find(
                  (illustration) => illustration.id === illustrationId
              )
            : illustrations[0];

        const associatedProduct = products.find(
            (product) =>
                product.carrierProductId ===
                firstAvailableIllustration?.productId
        );

        // Adding this check to prevent re-selecting the same
        const isAlreadySelected =
            selectedIllustration?.illustration?.id ===
                firstAvailableIllustration?.id &&
            selectedIllustration?.product?.carrierProductId ===
                associatedProduct?.carrierProductId;

        if (
            associatedProduct &&
            firstAvailableIllustration &&
            !isAlreadySelected
        ) {
            handleSelectIllustration(
                associatedProduct,
                firstAvailableIllustration
            );
        }
    }, [
        handleSelectIllustration,
        illustrationId,
        illustrations,
        products,
        selectedIllustration?.illustration?.id,
        selectedIllustration?.product?.carrierProductId,
    ]);

    const availableProducts = useMemo(() => {
        return findAvailableProducts(
            products,
            String(clientCase.insuredDetails?.dateOfBirth || '')
        );
    }, [products, clientCase.insuredDetails?.dateOfBirth]);

    const [filteredProducts, setFilteredProducts] =
        useState<Product[]>(availableProducts);

    useEffect(() => {
        let cancelled = false;
        const filter = async () => {
            let filtered = availableProducts;
            if (clientCase.eAppId) {
                filtered = await filterProductsByPlanCodeFromEapp(
                    availableProducts,
                    clientCase.eAppId
                );
            }
            if (!cancelled) setFilteredProducts(filtered);
        };
        filter();
        return () => {
            cancelled = true;
        };
    }, [availableProducts, clientCase.eAppId]);

    const productsWithIllustrations: ProductWithIllustration[] =
        filteredProducts.map((product) => {
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
            {productsWithIllustrationsCount === 0 && (
                <ul className={styles.productList}>
                    {!isError &&
                        filteredProducts.map(
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
                            (product: ProductWithIllustration, idx: number) => {
                                return (
                                    <IllustrationProductItem
                                        key={idx}
                                        product={product}
                                        illustrations={product.illustrations}
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
                    {productsWithIllustrations
                        .filter((product) => !product.illustrations.length)
                        .map(
                            (product: ProductWithIllustration, idx: number) => {
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
            {/* </Skeleton> */}
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
