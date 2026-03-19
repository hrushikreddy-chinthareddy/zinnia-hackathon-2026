import clsx from 'clsx';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { ChangeEvent, useMemo, useRef, useState } from 'react';

import { parseAndFormatDate } from '@deps/helpers/string.helpers';
import { isValidDate } from '@deps/utils/dates';

import { DateInputPopover } from './date-input-popover';
import styles from './date-input.module.css';

interface DateInputProps {
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
    return dayjs(date).tz('UTC').format('MM/DD/YYYY');
};

const sanitizeDateString = (rawInput: string, currentValue: string) => {
    let cleanedInput = rawInput.replace(/[^0-9/-]/g, '');
    cleanedInput = cleanedInput.replace(/-+/g, '/');

    if (currentValue.length > cleanedInput.length) {
        cleanedInput = cleanedInput.replace(/\/$/, '');
        return cleanedInput;
    }

    if (
        (cleanedInput.length === 2 || cleanedInput.length === 5) &&
        rawInput.length <= cleanedInput.length &&
        !cleanedInput.endsWith('/')
    ) {
        cleanedInput += '/';
    } else if (cleanedInput.length === 8 && !cleanedInput.includes('/')) {
        cleanedInput =
            cleanedInput.slice(0, 2) +
            '/' +
            cleanedInput.slice(2, 4) +
            '/' +
            cleanedInput.slice(4);
    }

    return cleanedInput;
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
    // We manually build a custom ISO date string to ensure that the
    // local timezone offset is ignored
    const date = new Date(`${formatedDate}T00:00:00Z`);

    if (!isNaN(date.getTime())) {
        return date;
    }
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
        const newValue = sanitizeDateString(dateString, value);

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
        const isValid = !isNaN(date.getTime());

        if (!isValid) {
            return;
        }
        const newValue = stringifyDate(date);

        setValue(newValue);

        onChange(date);
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
