import { Radio } from '@zinnia/bloom/components';
import { FC } from 'react';

import styles from './chip-radio.module.css';
export interface RadioOption {
    label: string;
    ariaLabel: string;
    value: string;
}

export interface ChipRadioProps {
    options: RadioOption[];
    defaultValue: string;
    onValueChange: (value: string) => void;
    id: string;
    value?: string;
}

export const ChipRadio: FC<ChipRadioProps> = ({ options, defaultValue, onValueChange, id, value }) => {
    return (
        <Radio
            id={id}
            options={options}
            defaultValue={defaultValue}
            embedLabel
            hideIndicator
            radioGroupClasses={styles.chipRadioGroup}
            radioItemClasses={styles.chipRadioItem}
            onValueChange={onValueChange}
            value={value}
        />
    );
};
