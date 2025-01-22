import { Radio } from '@zinnia/bloom/components';
import { FC } from 'react';

import styles from './chip-radio.module.css';
interface RadioOption {
    label: string;
    ariaLabel: string;
    value: string;
}

interface ChipRadioProps {
    options: RadioOption[];
    defaultValue: string;
    onValueChange: (value: string) => void;
    id: string;
}

export const ChipRadio: FC<ChipRadioProps> = ({ options, defaultValue, onValueChange, id }) => {
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
        />
    );
};
