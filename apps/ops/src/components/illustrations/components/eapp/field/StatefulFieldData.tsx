import { FieldDataProps, FieldData } from '@zinnia/bloom/components';
import { ChangeEventHandler, useState, useEffect, useCallback } from 'react';

type StatefulFieldDataProps = Omit<FieldDataProps, 'onChange' | 'onBlur'> & {
    onChange: (value: any) => void;
};

export function StatefulFieldData(props: StatefulFieldDataProps) {
    const { onChange: onAnswerChange, value: propsValue, ...restProps } = props;
    const [localValue, setLocalValue] = useState<any>(propsValue);
    const [lastSentValue, setLastSentValue] = useState<any>(propsValue);

    // Sync local state with parent's value when it changes
    // This handles both: normal prop changes AND rejected changes
    useEffect(() => {
        // Only update if parent value changed from what we last sent
        // This detects when parent rejected our change (kept same value)
        if (propsValue !== lastSentValue) {
            setLocalValue(propsValue);
            setLastSentValue(propsValue);
        }
    }, [propsValue, lastSentValue]);

    const handleBlur = useCallback((): void => {
        // Only notify parent if value actually changed
        if (localValue !== propsValue) {
            onAnswerChange(localValue); // Run the whole questionnaireEngine.update in sync (might update the default value).
            setLastSentValue(localValue); // (Very important, this has to run after the onAnswerChange ^)
        }
    }, [localValue, propsValue, onAnswerChange]);

    const handleChange: ChangeEventHandler<any> = useCallback((e): void => {
        // Convert empty string to undefined for consistency
        const newValue = e.target.value === '' ? undefined : e.target.value;
        setLocalValue(newValue);
    }, []);

    return (
        <FieldData
            {...restProps}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
}
