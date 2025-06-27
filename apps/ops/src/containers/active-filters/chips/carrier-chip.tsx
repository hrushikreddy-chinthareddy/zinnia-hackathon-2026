import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { getCarrierNamesByClientIds } from '@deps/utils/carriers';

const CarrierChip = ({
    carrierCode,
    carriers,
    handleRemoveFilter,
    t,
    authorizedCarriers,
}: {
    carrierCode: string;
    carriers: { [key: string]: string };
    handleRemoveFilter: (arg: { carriers: object; products: object }) => void;
    t: TFunction;
    authorizedCarriers: string[];
}) => {
    const carrierName =
        getCarrierNamesByClientIds(
            carrierCode.toUpperCase(),
            authorizedCarriers
        ) || carrierCode.toUpperCase();

    return (
        <ChipX
            ariaLabel={
                t('ariaLabel.clearFilter', { filter: carrierName }) as string
            }
            label={carrierName}
            onDelete={() => {
                delete carriers[carrierCode];
                handleRemoveFilter({ carriers, products: new Set() });
            }}
        />
    );
};

export default CarrierChip;
