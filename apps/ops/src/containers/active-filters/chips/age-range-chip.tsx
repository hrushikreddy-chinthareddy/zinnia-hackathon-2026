import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';

const AgeRangeChip = ({
    ageRange,
    handleRemoveFilter,
    t,
}: {
    ageRange: string;
    handleRemoveFilter: (arg: { age: '' }) => void;
    t: TFunction;
}) => {
    const formattedString = `${t('ageRange')} : ${ageRange}`;

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: t('ageRange').toLocaleLowerCase() }) as string}
            label={formattedString}
            onDelete={() => handleRemoveFilter({ age: '' })}
        />
    );
};

export default AgeRangeChip;
