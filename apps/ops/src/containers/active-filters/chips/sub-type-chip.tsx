import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { toTitleCase } from '@deps/helpers/string.helpers';

const SubTypeChip = ({
    subTypeCode,
    requestSubType,
    handleRemoveFilter,
    t,
}: {
    subTypeCode: string;
    requestSubType: Set<string>;
    handleRemoveFilter: (arg: { requestSubType: object }) => void;
    t: TFunction;
}) => {
    const newRequestSubTypes = new Set(requestSubType);
    newRequestSubTypes.delete(subTypeCode);

    return (
        <ChipX
            ariaLabel={
                t('ariaLabel.clearFilter', { filter: subTypeCode }) as string
            }
            label={toTitleCase(subTypeCode)}
            onDelete={() =>
                handleRemoveFilter({ requestSubType: newRequestSubTypes })
            }
        />
    );
};

export default SubTypeChip;
