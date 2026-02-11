import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useRef, useState } from 'react';

import { isValidDate } from '@deps/utils/dates';

import styles from './date-text-input.module.css';

interface DateTextInputProps {
    onChange: (date: string) => void;
    defaultDate?: string | undefined;
    disabled?: boolean;
    errorMessage?: string | null;
}

const REGEXP_PATTERN_DATE = 'd{2}/d{2}/d{4}';

const DateTextInput = ({
    onChange,
    defaultDate = '',
    disabled = false,
    errorMessage,
}: DateTextInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(defaultDate);
    const [isValidDateFormat, setIsValidDateFormat] = useState(true);

    const handleContainerClick = () => {
        inputRef?.current?.focus();
    };

    const formatDateInput = (rawInput: string) => {
        let cleanedInput = rawInput.replace(/[^0-9/-]/g, '');
        cleanedInput = cleanedInput.replace(/-/g, '/');

        if (
            (cleanedInput.length === 2 || cleanedInput.length === 5) &&
            value.length < cleanedInput.length
        ) {
            if (!cleanedInput.endsWith('/')) {
                cleanedInput += '/';
            }
        }

        return cleanedInput;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        onChange(input);
        const formatted = formatDateInput(input);
        setValue(formatted);

        if (errorMessage && formatted.length >= 10) {
            setIsValidDateFormat(isValidDate(formatted));
        } else if (errorMessage && !formatted) {
            setIsValidDateFormat(true);
        }
    };

    const validateDate = (date: string) => {
        if (errorMessage && date) {
            setIsValidDateFormat(isValidDate(date));
        } else if (errorMessage && !date) {
            setIsValidDateFormat(true);
        }
    };

    return (
        <>
            <div
                className={clsx(styles.inputContainer, {
                    [styles.error]: !isValidDateFormat,
                })}
                onClick={handleContainerClick}
            >
                <input
                    ref={inputRef}
                    className={styles.input}
                    id="date"
                    type="text"
                    value={value}
                    onChange={handleChange}
                    maxLength={10}
                    pattern={REGEXP_PATTERN_DATE}
                    placeholder="mm/dd/yyyy"
                    disabled={disabled}
                    onBlur={() => validateDate(value)}
                />
                <Icon type={IconType.CALENDAR} />
            </div>
            {!isValidDateFormat && (
                <label className={clsx(styles.errorMessage)}>
                    <small>{errorMessage}</small>
                </label>
            )}
        </>
    );
};

export default DateTextInput;
