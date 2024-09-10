import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';

const ShowCanceledChip = ({
    handleRemoveFilter,
    t,
}: {
    handleRemoveFilter: (arg: { showOnlyCanceledCases: false }) => void;
    t: TFunction;
}) => {
    const formattedString = `${t('canceled')}`;

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: t('canceled').toLocaleLowerCase() }) as string}
            label={formattedString}
            onDelete={() => handleRemoveFilter({ showOnlyCanceledCases: false })}
        />
    );
};

export default ShowCanceledChip;
