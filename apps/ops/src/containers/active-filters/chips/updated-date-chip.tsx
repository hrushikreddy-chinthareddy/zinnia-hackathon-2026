import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { parseAndFormatDate } from '@deps/helpers/string.helpers';
import { DEFAULT_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';

const UpdatedDateChip = ({
    updatedDateEnd,
    updatedDateStart,
    handleRemoveFilter,
    t,
}: {
    updatedDateEnd?: string;
    updatedDateStart?: string;
    handleRemoveFilter: (arg: { [key: string]: '' }) => void;
    t: TFunction;
}) => {
    const formattedStart = parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, updatedDateStart);
    const formattedEnd = !!updatedDateEnd && parseAndFormatDate(NUMERIC_DATE_FORMAT, DEFAULT_DATE_FORMAT, updatedDateEnd);
    const text = formattedEnd ? `${t('dateUpdated')}: ${formattedStart} - ${formattedEnd}` : `${t('dateUpdated')}: ${formattedStart}`;
    const removeObject: { [key: string]: '' } = formattedEnd ? { updatedDateStart: '', updatedDateEnd: '' } : { updatedDateStart: '' };

    return (
        <ChipX
            ariaLabel={t('ariaLabel.clearFilter', { filter: t('dateUpdated').toLocaleLowerCase() }) as string}
            label={text}
            onDelete={() => handleRemoveFilter(removeObject)}
        />
    );
};

export default UpdatedDateChip;
