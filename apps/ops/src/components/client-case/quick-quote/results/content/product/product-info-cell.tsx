import { CarrierAvatar } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ComponentProps } from 'react';

import {
    getCarrierMarketingName,
    getProductCarrierName,
} from '@deps/components/illustrations/helpers/get-product-carrier-name';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { Product } from '@deps/types/product';

import styles from '../content.module.css';

export type QuickQuoteResultProductInfoCellProps = {
    product: Product;
} & ComponentProps<'div'>;
export const QuickQuoteResultProductInfoCell = ({
    product,
    className,
    ...rest
}: QuickQuoteResultProductInfoCellProps) => {
    return (
        <div className={clsx(styles.productInfoCell, className)} {...rest}>
            <div style={{ gridRow: '1 / 3' }}>
                <CarrierAvatar
                    carrier={getProductCarrierName(product)}
                    height={48}
                    width={48}
                />
            </div>

            <Typography
                className={styles.productInfoCellCarrier}
                asTag="span"
                variant={TypographyVariant.LabelMd}
            >
                {getCarrierMarketingName(product.carrier)}
            </Typography>
            <h2 className="typography-titles-subtitle">
                {product.productMarketingName}
            </h2>
        </div>
    );
};
