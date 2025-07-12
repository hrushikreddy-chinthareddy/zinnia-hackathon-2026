import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Button, Icon, IconType } from '@zinnia/bloom/components';

import style from './cardRadioGroup.module.css';

type CardRadioGroupProps = {
    value?: string;
    onValueChange: (value: string) => void;
    options: {
        value: string;
        iconType?: IconType;
        label: string;
        cta?: {
            onClick: () => void;
            label: string;
        };
    }[];
};

export function CardRadioGroup({
    value,
    options,
    onValueChange,
}: CardRadioGroupProps) {
    return (
        <div className={style.radioGroupWrapper}>
            <RadioGroup
                value={value}
                className={style.radixRadioGroup}
                onValueChange={onValueChange}
            >
                {options.map((option) => (
                    <RadioGroupItem
                        key={option.value}
                        value={option.value || ''}
                        className={style.radixRadioGroupItem}
                    >
                        {option.iconType && (
                            <div className={style.iconWrapper}>
                                <Icon
                                    type={option.iconType}
                                    width={50}
                                    height={50}
                                />
                            </div>
                        )}
                        <span className="typography-content-body">
                            {option.label}
                        </span>
                        {option.cta && (
                            <div className={style.cta}>
                                <Button
                                    mode="link"
                                    onClick={option.cta.onClick}
                                >
                                    {option.cta.label}
                                </Button>
                            </div>
                        )}
                    </RadioGroupItem>
                ))}
            </RadioGroup>
        </div>
    );
}
