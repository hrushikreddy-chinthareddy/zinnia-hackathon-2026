import * as RadioGroup from '@radix-ui/react-radio-group';
import styles from './radio.module.css';

import { RadioProps } from './utils';
import { Label } from '..';

export const Radio = ({ groupLabel, isDisabled, options, defaultValue }: RadioProps) => (
    <RadioGroup.Root className={styles.RadioGroupRoot} defaultValue={defaultValue} aria-label="Radio Group">
        <Label>{groupLabel}</Label>

        {options.map((option, index) => {
            return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup.Item className={styles.RadioGroupItem} value={option.value} id={`r${index}`} disabled={isDisabled} aria-label={option.ariaLabel}>
                    <RadioGroup.Indicator className={styles.RadioGroupIndicator}  />
                </RadioGroup.Item>
                <label className="typography-content-body-sm" htmlFor={`r${index}`}>
                    {option.label}
                </label>
            </div>
        )})}
    </RadioGroup.Root>
);
