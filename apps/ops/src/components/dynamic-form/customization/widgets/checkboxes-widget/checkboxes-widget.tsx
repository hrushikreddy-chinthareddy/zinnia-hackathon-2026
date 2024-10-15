import { CheckboxGroup, Flex, Text } from '@radix-ui/themes';
import {
    // ariaDescribedByIds,
    enumOptionsDeselectValue,
    // enumOptionsIsSelected,
    enumOptionsSelectValue,
    enumOptionsValueForIndex,
    optionId,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
// import { Label } from '@zinnia/bloom/components';
import { ChangeEvent, FocusEvent } from 'react';

// import styles from '../checkboxes-widget/checkboxex.module.css';

export default function CheckboxesWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    disabled,
    options,
    value,
    autofocus,
    readonly,
    required,
    onChange,
    onBlur,
    onFocus,
}: WidgetProps<T, S, F>) {
    const { enumOptions, enumDisabled, emptyValue } = options;
    // const { enumOptions, enumDisabled, inline, emptyValue } = options;
    const checkboxesValues = Array.isArray(value) ? value : [value];

    const _onChange =
        (index: number) =>
        ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
            if (checked) {
                onChange(enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions));
            } else {
                onChange(enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions));
            }
        };

    const _onBlur = ({ target }: FocusEvent<HTMLInputElement>) =>
        onBlur(id, enumOptionsValueForIndex<S>(target && target.value, enumOptions, emptyValue));
    const _onFocus = ({ target }: FocusEvent<HTMLInputElement>) =>
        onFocus(id, enumOptionsValueForIndex<S>(target && target.value, enumOptions, emptyValue));

    return (
        <CheckboxGroup.Root variant="surface" size="3" className="w-full">
            {Array.isArray(enumOptions) &&
                enumOptions.map((option, index: number) => {
                    // const checked = enumOptionsIsSelected<S>(option.value, checkboxesValues);
                    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;

                    return (
                        // eslint-disable-next-line react/jsx-key, react/jsx-no-undef
                        <Text as="label" size="4">
                            <Flex gap="2">
                                <CheckboxGroup.Item
                                    key={option.value}
                                    // inline={inline}
                                    // custom
                                    required={required}
                                    //checked={checked}
                                    className="border-0 bg-transparent"
                                    // type={'checkbox'}
                                    id={optionId(id, index)}
                                    // name={id}
                                    // label={option.label}
                                    autoFocus={autofocus && index === 0}
                                    // onChange={_onChange(index)}
                                    // onBlur={_onBlur}
                                    // onFocus={_onFocus}
                                    value={option.value}
                                    disabled={disabled || itemDisabled || readonly}
                                    // aria-describedby={ariaDescribedByIds<T>(id)}
                                >
                                    {option.label}
                                    {/* <div className={styles.label}>
                                        <Label>{option.label}</Label>
                                    </div> */}
                                </CheckboxGroup.Item>
                            </Flex>
                        </Text>
                    );
                })}
        </CheckboxGroup.Root>
    );
}
