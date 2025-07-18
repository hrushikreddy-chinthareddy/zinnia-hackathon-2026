import { Icon, IconType } from '@zinnia/bloom/components';
import { useRef, useState } from 'react';

import styles from './date-text-input.module.css';

interface DateTextInputProps {
    onChange: (args0: any) => void;
    defaultDate?: string | undefined;
}

const REGEXP_PATTERN_DATE = 'd{2}/d{2}/d{4}';

const DateTextInput = ({ onChange, defaultDate = '' }: DateTextInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(defaultDate);

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
    };

    return (
        <div className={styles.inputContainer} onClick={handleContainerClick}>
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
            />
            <Icon type={IconType.CALENDAR} />
        </div>
    );
};

export default DateTextInput;
