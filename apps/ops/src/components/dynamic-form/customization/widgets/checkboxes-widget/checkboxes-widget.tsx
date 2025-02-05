import {
    enumOptionsDeselectValue,
    enumOptionsIsSelected,
    enumOptionsSelectValue,
    FormContextType,
    getUiOptions,
    optionId,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { ChangeEvent } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

import styles from './checkboxes.module.css';

export default function CheckboxesWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    options,
    value,
    onChange,
    readonly,
    uiSchema,
}: WidgetProps<T, S, F>) {
    const { enumOptions, enumDisabled } = options;
    const checkboxesValues = Array.isArray(value) ? value : [value];
    const { label } = getUiOptions(uiSchema);
    const _onChange =
        (index: number) =>
        ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
            if (checked) {
                onChange(enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions));
            } else {
                onChange(enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions));
            }
        };

    if (readonly) return <>{checkboxesValues.map(value => enumOptions?.find(option => option.value === value)?.label).join(', ')}</>;

    return (
        <div id={id} className={styles.checkboxGroupRoot} aria-label="Checkbox Group">
            <div></div>
            {Array.isArray(enumOptions) &&
                enumOptions?.map((option: any, index: number) => {
                    const isChecked = enumOptionsIsSelected<S>(option.value, checkboxesValues);
                    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;

                    return (
                        <div key={option.value}>
                            <CheckboxText
                                id={optionId(id, index)}
                                key={option.value}
                                label={label ? option.label : ''}
                                onChange={checked => _onChange(index)({ target: { checked } } as ChangeEvent<HTMLInputElement>)}
                                checked={isChecked}
                                isDisabled={itemDisabled}
                            />
                        </div>
                    );
                })}
        </div>
    );
}
