// components/ActiveChip.tsx
import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { getCarrierNamesByClientIds } from '@deps/utils/carriers';

import { customLabelMap, formatLabel } from './utils';

const getValueFromList = (code: string, codesList: string[]) => {
    return (
        getCarrierNamesByClientIds(code.toUpperCase(), codesList) ||
        code.toUpperCase()
    );
};

const ActiveChip = ({
    code,
    allCodes,
    handleRemoveFilter,
    t,
    codeList,
}: {
    code: string;
    allCodes: { [key: string]: string };
    handleRemoveFilter: (arg: { allCodes: { [key: string]: string } }) => void;
    t: TFunction;
    codeList?: string[];
}) => {
    let label: string;

    if (customLabelMap[code]) {
        label = customLabelMap[code];
    } else if (codeList) {
        label = formatLabel(getValueFromList(code, codeList));
    } else {
        label = formatLabel(code);
    }

    const handleDelete = () => {
        const updated = { ...allCodes };
        delete updated[code];
        handleRemoveFilter({ allCodes: updated });
    };

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: label }) as string}
            label={label}
            onDelete={handleDelete}
        />
    );
};

export default ActiveChip;
