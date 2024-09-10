import { useTranslation } from 'next-i18next';

import { mapProductTypeToTranslation } from '@deps/helpers/translation.helper';
import { ProductType } from '@deps/models/policy/sor-policy';

export type FootnoteProps = {
    productMarketingName?: string;
    productType?: ProductType;
};

export default function Footnote({ productMarketingName, productType }: FootnoteProps) {
    const { t } = useTranslation();

    const copy =
        productMarketingName && mapProductTypeToTranslation(productType, t).label
            ? t('footnote.withProduct', {
                  productMarketingName,
                  productType: t(mapProductTypeToTranslation(productType, t).label),
              })
            : t('footnote.default');

    return (
        <p className="body-sm mt-4" role="note" id="footnote">
            {copy}
        </p>
    );
}
