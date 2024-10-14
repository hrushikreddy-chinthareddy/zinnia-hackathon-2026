import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';

const ShowCompletedChip = ({
    handleRemoveFilter,
    t,
}: {
    handleRemoveFilter: (arg: { showOnlyCompletedCases: false }) => void;
    t: TFunction;
}) => {
    const formattedString = `${t('completed')}`;

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: t('completed').toLocaleLowerCase() }) as string}
            label={formattedString}
            onDelete={() => handleRemoveFilter({ showOnlyCompletedCases: false })}
        />
    );
};

export default ShowCompletedChip;
