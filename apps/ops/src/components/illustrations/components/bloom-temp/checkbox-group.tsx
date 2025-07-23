import { Checkbox, CheckboxIndicator } from '@radix-ui/react-checkbox';
import { useCallback, useMemo } from 'react';

import style from './checkbox-group.module.css';

type CheckboxGroupProps = {
    options: Array<{ value: string; label: string; ariaLabel: string }>;
    value: string[];
    onValueChange: (value: string[]) => void;
};

export function CheckboxGroup({
    options,
    value,
    onValueChange,
}: CheckboxGroupProps) {
    const mapOfCheckedStatuses = useMemo(() => {
        const map: Record<string, boolean> = {};
        for (const option of options) {
            map[option.value] = value.some((o) => o === option.value);
        }
        return map;
    }, [value, options]);

    const updateChecked = useCallback(
        (val: string, checked?: boolean) => {
            if (!checked && !(val in value)) {
                const newValue = [];
                for (const v of value) {
                    if (v !== val) {
                        newValue.push(v);
                    }
                }
                onValueChange(newValue);
            } else {
                onValueChange(value.concat([val]));
            }
        },
        [onValueChange, value]
    );

    return (
        <div className={style.checkboxGroupRoot}>
            {options.map((option, i) => (
                <div key={option.value} className={style.checkboxWrapper}>
                    <Checkbox
                        aria-describedby={`${option.value}-label`}
                        checked={mapOfCheckedStatuses[option.value] || false}
                        id={option.value}
                        key={`checkbox-${i}-${option.value}`}
                        onCheckedChange={(
                            checked: boolean | 'indeterminate'
                        ) => {
                            updateChecked(
                                option.value,
                                typeof checked === 'boolean' ? checked : false
                            );
                        }}
                        value={option.value}
                        className={style.checkbox}
                    >
                        <CheckboxIndicator className={style.indicator} />
                    </Checkbox>
                    <div id={`${option.value}-label`}>
                        <label>{option.label}</label>
                    </div>
                </div>
            ))}
        </div>
    );
}
