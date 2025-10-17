import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Product } from '@deps/types/product';

import { QuickQuoteResultProductInfoCell } from './product-info-cell';
import styles from '../content.module.css';

type QuickQuoteProductHeaderRowProps = {
    products: Product[];
};

export const QuickQuoteProductHeaderRow = ({
    products,
}: QuickQuoteProductHeaderRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <div className={styles.contentTableRow}>
            <Typography
                className={styles.productHeaderTitle}
                variant={TypographyVariant.LabelLg}
            >
                {t('clientCase.quickQuoteResults.product.title')}
            </Typography>

            {products.map((product) => (
                <QuickQuoteResultProductInfoCell
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
};
