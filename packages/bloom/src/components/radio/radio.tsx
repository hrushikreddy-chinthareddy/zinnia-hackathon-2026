import * as RadioGroup from '@radix-ui/react-radio-group';
import styles from './radio.module.css';

import { RadioProps } from './utils';

export const Radio = ({ isDisabled, label, ariaLabel }: RadioProps) => (
        <RadioGroup.Root className={styles.RadioGroupRoot} defaultValue="option1" aria-label="Radio Group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup.Item className={styles.RadioGroupItem} value="option1" id="r1" disabled={isDisabled} aria-label={ariaLabel}>
                    <RadioGroup.Indicator className={styles.RadioGroupIndicator}  />
                </RadioGroup.Item>
                <label className="typography-content-body-sm" htmlFor="r1">
                    {label}
                </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup.Item className={styles.RadioGroupItem} value="option2" id="r2" disabled={isDisabled} aria-label={ariaLabel}>
                    <RadioGroup.Indicator className={styles.RadioGroupIndicator} />
                </RadioGroup.Item>
                <label className="typography-content-body-sm" htmlFor="r2">
                    {label}
                </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup.Item className={styles.RadioGroupItem} value="option3" id="r3" disabled={isDisabled} aria-label={ariaLabel}>
                    <RadioGroup.Indicator className={styles.RadioGroupIndicator} />
                </RadioGroup.Item>
                <label className="typography-content-body-sm" htmlFor="r3">
                    {label}
                </label>
            </div>
        </RadioGroup.Root>
);
