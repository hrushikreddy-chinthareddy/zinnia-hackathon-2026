import clsx from 'clsx';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { ChangeEvent, useMemo, useRef, useState } from 'react';

import { parseAndFormatDate } from '@deps/helpers/string.helpers';
import { isValidDate, toNoonUtc } from '@deps/utils/dates';

import { DateInputPopover } from './date-input-popover';
import styles from './date-input.module.css';

export interface DateInputProps {
    onChange: (date: Date | undefined) => void;
    onBlur?: () => void;
    defaultDate?: Date | undefined;
    disabled?: boolean;
    errorMessage?: string | null;
    popOverTitle: string;
}

const isValidDateString = (dateString: string) => {
    const day = dayjs(dateString, 'M/D/YYYY');

    if (!day.isValid()) {
        return false;
    }

    const values = dateString.split('/').map((s) => parseInt(s));

    // Date parsing can still be wrong if the format is right but values are
    // wrong (i.e. 13/30/100)
    return isEqual(values, [day.month() + 1, day.date(), day.year()]);
};

const stringifyDate = (date: Date) => {
    return dayjs(date).utc().format('MM/DD/YYYY');
};

const sanitizeDateString = (rawInput: string) => {
    let cleanedInput = rawInput.replace(/[^0-9/-]/g, '');
    cleanedInput = cleanedInput.replace(/-+/g, '').replace(/\//g, '');

    let formattedDate = '';
    for (let i = 0; i < cleanedInput.length && i < 8; i++) {
        if (i === 2 || i === 4) {
            formattedDate += '/';
        }
        formattedDate += cleanedInput[i];
    }

    return formattedDate;
};

const parseDateString = (dateString: string) => {
    const formatedDate = parseAndFormatDate(
        'M/D/YYYY',
        'YYYY-MM-DD',
        dateString
    );

    if (!formatedDate) {
        return;
    }

    return toNoonUtc(formatedDate);
};

const DateInput = ({
    onChange,
    onBlur,
    defaultDate,
    disabled = false,
    errorMessage,
    popOverTitle,
}: DateInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(() => {
        if (defaultDate == null || isNaN(defaultDate.getTime())) {
            return '';
        }

        return dayjs(defaultDate).utc().format('MM/DD/YYYY');
    });

    const isValidDateFormat = useMemo(() => {
        if (!value) {
            return false;
        }
        return isValidDateString(value);
    }, [value]);

    const dateValue = useMemo(() => parseDateString(value), [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value: dateString } = e.target;
        const newValue = sanitizeDateString(dateString);

        setValue(newValue);

        const { nativeEvent } = e;

        if ('inputType' in nativeEvent) {
            return;
        }

        // This is not an `InputEvent`. Probably autofill, notify the parent
        // component of the value change
        if (isValidDate(newValue)) {
            onChange(parseDateString(newValue));
        }
    };

    const handleSelect = (date: Date) => {
        const normalizedDate = toNoonUtc(date);
        if (!normalizedDate) {
            return;
        }
        setValue(stringifyDate(normalizedDate));
        onChange(normalizedDate);
    };

    const handleBlur = () => {
        if (!isValidDateFormat) {
            return onChange(undefined);
        }

        onChange(dateValue);
        onBlur?.();
    };

    return (
        <>
            <div
                className={clsx(styles.inputContainer, {
                    [styles.error]: value && !isValidDateFormat,
                })}
                data-testid="date-input-container-id"
            >
                <input
                    ref={inputRef}
                    className={styles.input}
                    id="date"
                    type="text"
                    value={value}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="mm/dd/yyyy"
                    disabled={disabled}
                    onBlur={handleBlur}
                    data-testid="date-input-id"
                />
                <DateInputPopover
                    title={popOverTitle}
                    value={dateValue}
                    onSelect={handleSelect}
                />
            </div>
            {value && !isValidDateFormat && (
                <label className={clsx(styles.errorMessage)}>
                    <small>{errorMessage}</small>
                </label>
            )}
        </>
    );
};

export default DateInput;
