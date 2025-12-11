import { Button, Divider, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    IllustrationsClientCase,
    IllustrationSummary,
} from '@deps/types/illustrations';
import { Product, ProductTypeLabel } from '@deps/types/product';
import { IllustrationsSegmentTrackedEventName } from '@deps/types/segment-analytics';

import CarrierIcon from './carrier-icon';
import styles from './product-item.module.css';
import { AddIllustrationSidesheet } from '../add-illustration-sidesheet/add-illustration-sidesheet';
import IllustrationItem from '../illustration-item/illustration-item';

interface IllustrationProductItemProps {
    product: Product;
    illustrations?: IllustrationSummary[];
    eAppId?: string;
    clientCase?: IllustrationsClientCase;
    preselectedProduct?: Product | undefined;
}

const IllustrationProductItem = ({
    product,
    illustrations,
    eAppId,
    clientCase,
    preselectedProduct,
}: IllustrationProductItemProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustrationsCount = (illustrations ?? []).length;
    const router = useRouter();
    const { illustrationId } = router.query;
    const { sendIllustrationsClickedEvent } = useIllustrationAnalytics();
    const productName =
        ProductTypeLabel.get(product.productType) ?? DEFAULT_ERROR_STRING;

    return (
        <li className={styles.productWrapper}>
            <div className={styles.product}>
                <CarrierIcon carrierCode={product.carrier} />
                <Badge label={productName} variant={BadgeVariant.Brand} />
                <span
                    className={clsx(
                        !illustrationsCount && 'typography-content-body',
                        !!illustrationsCount && 'typography-titles-subtitle'
                    )}
                >
                    {product.productMarketingName}
                </span>
                <AddIllustrationSidesheet
                    planCode={product.planCode}
                    clientCase={clientCase}
                    overrideOpen={!!preselectedProduct}
                >
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
                        className={styles.addIllustration}
                        onClick={() => {
                            sendIllustrationsClickedEvent(
                                product,
                                IllustrationsSegmentTrackedEventName.newIllustrationClicked
                            );
                        }}
                    >
                        <Icon type={IconType.ADD} />
                    </Button>
                </AddIllustrationSidesheet>
            </div>

            {illustrations && illustrations.length ? (
                <ul className={styles.illustrationsList}>
                    {illustrations.map((illustration, pIdx) => (
                        <IllustrationItem
                            key={illustration.id}
                            product={product}
                            illustration={illustration}
                            isSelected={illustration.id === illustrationId}
                            isSelectableForApplication={!!eAppId}
                        >
                            {pIdx < illustrations.length - 1 && (
                                <Divider
                                    color="default"
                                    direction="horizontal"
                                />
                            )}
                        </IllustrationItem>
                    ))}
                </ul>
            ) : (
                <Divider color="default" direction="horizontal" />
            )}
        </li>
    );
};

export default IllustrationProductItem;
