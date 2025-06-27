import { TFunction } from 'next-i18next';

import ChipX from '@deps/components/chip/chip-x';
import { parseAndFormatDate } from '@deps/helpers/string.helpers';
import {
    DEFAULT_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';

const CreatedDateChip = ({
    createdDateEnd,
    createdDateStart,
    handleRemoveFilter,
    t,
}: {
    createdDateEnd?: string;
    createdDateStart?: string;
    handleRemoveFilter: (arg: { [key: string]: '' }) => void;
    t: TFunction;
}) => {
    const formattedStart = parseAndFormatDate(
        NUMERIC_DATE_FORMAT,
        DEFAULT_DATE_FORMAT,
        createdDateStart
    );
    const formattedEnd =
        !!createdDateEnd &&
        parseAndFormatDate(
            NUMERIC_DATE_FORMAT,
            DEFAULT_DATE_FORMAT,
            createdDateEnd
        );
    const text = formattedEnd
        ? `${t('dateCreated')}: ${formattedStart} - ${formattedEnd}`
        : `${t('dateCreated')}: ${formattedStart}`;
    const removeObject: { [key: string]: '' } = formattedEnd
        ? { createdDateStart: '', createdDateEnd: '' }
        : { createdDateStart: '' };

    return (
        <ChipX
            ariaLabel={
                t('ariaLabel.clearFilter', {
                    filter: t('dateCreated').toLocaleLowerCase(),
                }) as string
            }
            label={text}
            onDelete={() => handleRemoveFilter(removeObject)}
        />
    );
};

export default CreatedDateChip;
