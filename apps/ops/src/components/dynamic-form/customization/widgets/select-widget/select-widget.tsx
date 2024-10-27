import {
    enumOptionsIndexForValue,
    EnumOptionsType,
    enumOptionsValueForIndex,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';

import SelectComponent from '@deps/components/select/select';

function getValue(
    isSelected: boolean,
    value: string,
    enumOptions: EnumOptionsType[] | undefined,
    selectedIndexes?: string | string[],
    multiple?: boolean
): string | string[] {
    if (!enumOptions) {
        return multiple ? [] : '';
    }
    if (multiple) {
        const index = enumOptions.findIndex(option => option.value === value);
        if (index !== -1 && Array.isArray(selectedIndexes)) {
            if (isSelected) {
                return selectedIndexes.concat(index.toString());
            } else {
                return selectedIndexes;
            }
        } else {
            return [index.toString()];
        }
    } else {
        return enumOptions.findIndex(option => option.value === value).toString();
    }
}
function SelectWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    schema,
    id,
    options,
    value,
    required,
    disabled,
    readonly,
    multiple = false,
    onChange,
    placeholder,
    label,
}: WidgetProps<T, S, F>) {
    multiple = true;
    const { enumOptions, enumDisabled, emptyValue: optEmptyVal } = options;

    const _onChange = (isSelected: boolean, value: string) => {
        if (!isSelected && Array.isArray(selectedIndexes)) {
            selectedIndexes = selectedIndexes?.filter(
                index => index !== enumOptions?.findIndex(option => option.value.toString() === value).toString()
            );
        }

        const newValue = getValue(isSelected, value, enumOptions, selectedIndexes, multiple);
        onChange(enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal));
    };
    const showPlaceholderOption = !multiple && schema.default === undefined;
    let selectedIndexes = enumOptionsIndexForValue<S>(value, enumOptions, multiple);
    const selectedValues =
        enumOptions?.reduce((acc: { [key: string]: string }, option, index) => {
            if (selectedIndexes?.includes(index.toString())) {
                acc[option.value] = option.label;
            }
            return acc;
        }, {}) ?? {};

    const selectOptions =
        enumOptions?.map((option: any) => ({
            value: option.value,
            label: option.label,
            displayText: option.label,
        })) ?? [];

    return (
        <SelectComponent
            id={id}
            isMultiselect={true}
            label={label}
            value={selectedValues}
            required={required}
            disabled={disabled || readonly}
            onChange={_onChange}
            options={selectOptions}
            placeholder={placeholder}
            className="max-w-sm"
        >
            {showPlaceholderOption && <option value="">{placeholder}</option>}
            {Array.isArray(enumOptions) &&
                enumOptions.map(({ value, label }, i) => {
                    const disabled = enumDisabled && enumDisabled.indexOf(value) !== -1;
                    return (
                        <option key={i} value={String(i)} disabled={disabled}>
                            {label}
                        </option>
                    );
                })}
        </SelectComponent>
    );
}

export default SelectWidget;
