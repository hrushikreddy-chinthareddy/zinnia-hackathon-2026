import * as RadioGroup from '@radix-ui/react-radio-group';
import styles from './radio.module.css';

import { RadioProps } from './utils';
import { Label } from '..';
import { v4 as uuidv4 } from 'uuid';

export const Radio = ({ groupLabel, isDisabled, options, defaultValue, id = uuidv4() }: RadioProps) => (
    <RadioGroup.Root className={styles.RadioGroupRoot} defaultValue={defaultValue} aria-label="Radio Group">
        <Label>{groupLabel}</Label>

        {options.map((option, index) => (
            <div className={styles.RadioGroupContainer}>
                <RadioGroup.Item className={styles.RadioGroupItem} value={option.value} id={`r-${id}-${index}`} disabled={isDisabled} aria-label={option.ariaLabel}>
                    <RadioGroup.Indicator className={styles.RadioGroupIndicator}  />
                </RadioGroup.Item>
                <label className="typography-content-body-sm" htmlFor={`r-${id}-${index}`}>
                    {option.label}
                </label>
            </div>
        ))}
    </RadioGroup.Root>
);
