import {
    enumOptionsDeselectValue,
    enumOptionsIsSelected,
    enumOptionsSelectValue,
    FormContextType,
    optionId,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { ChangeEvent } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

export default function CheckboxesWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    options,
    value,
    onChange,
}: WidgetProps<T, S, F>) {
    const { enumOptions, enumDisabled } = options;
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

    return (
        <div id={id}>
            {Array.isArray(enumOptions) &&
                enumOptions?.map((option: any, index: number) => {
                    const isChecked = enumOptionsIsSelected<S>(option.value, checkboxesValues);
                    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;

                    return (
                        <CheckboxText
                            id={optionId(id, index)}
                            key={option.value}
                            label={option.label}
                            onChange={checked => _onChange(index)({ target: { checked } } as ChangeEvent<HTMLInputElement>)}
                            checked={isChecked}
                            isDisabled={itemDisabled}
                        />
                    );
                })}
        </div>
    );
}
