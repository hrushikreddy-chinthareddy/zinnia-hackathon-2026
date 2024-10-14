import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { Processes } from '@deps/models/case/case';

const ProcessTypeChip = ({
    process,
    processTypes,
    handleRemoveFilter,
    t,
}: {
    process: string;
    processTypes: Set<string>;
    handleRemoveFilter: (arg: { processTypes: Set<string>; requestSubType: object }) => void;
    t: TFunction;
}) => {
    const newProcessFilters = new Set(processTypes);
    newProcessFilters.delete(process as Processes);

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: process }) as string}
            label={process}
            onDelete={() => handleRemoveFilter({ processTypes: newProcessFilters, requestSubType: new Set() })}
        />
    );
};

export default ProcessTypeChip;
