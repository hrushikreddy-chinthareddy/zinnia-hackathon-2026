import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { toTitleCase } from '@deps/helpers/string.helpers';

const ProductChip = ({
    productCode,
    products,
    handleRemoveFilter,
    t,
}: {
    productCode: string;
    products: Set<string>;
    handleRemoveFilter: (arg: { products: object }) => void;
    t: TFunction;
}) => {
    const newProducts = new Set(products);
    newProducts.delete(productCode);

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: productCode }) as string}
            label={toTitleCase(productCode)}
            onDelete={() => handleRemoveFilter({ products: newProducts })}
        />
    );
};

export default ProductChip;
