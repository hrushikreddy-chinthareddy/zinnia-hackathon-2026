import {
    enumOptionsIndexForValue,
    EnumOptionsType,
    enumOptionsValueForIndex,
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';

import SelectComponent from '@deps/components/select/select';
import {
    MultiselectOption,
    SimpleOption,
} from '@deps/components/select/select.helpers';
import { csrApiHelper } from '@deps/helpers/csr-api-helpers';
import {
    ApiProps,
    ApiResponseTypes,
    EventType,
    TaskEventProps,
} from '@deps/models/case/task';

function normalizeValue(value: any): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'string' && !isNaN(Number(value)))
        return Number(value);
    return value;
}

function getValue(
    isSelected: boolean,
    value: any,
    enumOptions: EnumOptionsType[] | undefined,
    selectedIndexes?: string[] | string,
    multiple?: boolean
): string | string[] {
    if (!enumOptions) return multiple ? [] : '';

    const index = enumOptions.findIndex(
        (option) => normalizeValue(option.value) === normalizeValue(value)
    );

    if (multiple) {
        if (index !== -1 && Array.isArray(selectedIndexes)) {
            if (isSelected) {
                return Array.from(
                    new Set([...selectedIndexes, index.toString()])
                );
            } else {
                return selectedIndexes.filter((i) => i !== index.toString());
            }
        } else {
            return [index.toString()];
        }
    } else {
        return index.toString();
    }
}

function SelectWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({
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
    rawErrors = [],
    uiSchema,
    formContext,
}: WidgetProps<T, S, F>) {
    const formData = formContext;

    const { enumDisabled, emptyValue: optEmptyVal } = options;
    const enumOptions: EnumOptionsType<S>[] | undefined = Array.isArray(
        uiSchema?.['ui:options']?.enumOptions
    )
        ? uiSchema['ui:options'].enumOptions
        : options.enumOptions;

    const selectOptions =
        enumOptions?.map((option: any) => ({
            value: normalizeValue(option.value),
            label: option.label,
            displayText: option.label,
            description: option.description,
        })) ?? [];

    const { props, events } = getUiOptions<T, S, F>(uiSchema);
    const apiProps =
        typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);
    const eventProps =
        typeof events === 'object'
            ? (events as TaskEventProps[])
            : ([] as TaskEventProps[]);

    const _onChange = (
        value: string,
        _displaytext: string,
        isSelected: boolean = false
    ) => {
        if (!isSelected && Array.isArray(selectedIndexes)) {
            selectedIndexes = selectedIndexes?.filter(
                (index) =>
                    index !==
                    selectOptions
                        ?.findIndex(
                            (option) =>
                                normalizeValue(option.value) ===
                                normalizeValue(value)
                        )
                        .toString()
            );
        }
        const newValue = getValue(
            isSelected,
            value,
            selectOptions,
            selectedIndexes,
            multiple
        );

        const finalValue = enumOptionsValueForIndex<S>(
            newValue,
            selectOptions,
            optEmptyVal
        );

        if (finalValue) {
            const parsedValue = finalValue.map((val: any) =>
                normalizeValue(val)
            );
            onChange(parsedValue);
        }
    };

    const _onChangeSingle = async (value: string) => {
        const newValue = getValue(
            false,
            value,
            selectOptions,
            selectedIndexes,
            multiple
        );
        eventProps?.forEach((eventProp) => {
            if (eventProp?.taskEventType === EventType.onChange) {
                const parsedValue = normalizeValue(value);
                formData?.setCustomData &&
                    formData.setCustomData({
                        [eventProp?.dataKey]:
                            parsedValue[eventProp?.responseData] ?? parsedValue,
                    });
            }
        });
        const finalValue = enumOptionsValueForIndex<S>(
            newValue,
            selectOptions,
            optEmptyVal
        );

        if (!apiProps.apiUrl) return onChange(normalizeValue(finalValue));
        await fetchDetails(value, newValue);
    };

    async function fetchDetails(value: string, newValue?: any) {
        const finalValue = enumOptionsValueForIndex<S>(
            newValue,
            selectOptions,
            optEmptyVal
        );
        onChange(normalizeValue(finalValue));

        const parsedValue = normalizeValue(value);

        csrApiHelper(
            apiProps,
            { ...formContext?.customData, value: parsedValue },
            true
        ).then((response) => {
            if (apiProps.responseType === ApiResponseTypes.FormData) {
                formData?.setCustomData &&
                    formData.setCustomData({ [apiProps?.dataKey]: response });
            } else {
                formData?.updateSchema &&
                    formData.updateSchema({ [apiProps?.dataKey]: response });
            }
        });
    }

    const showPlaceholderOption = !multiple && schema.default === undefined;
    const normalizedValue = Array.isArray(value)
        ? value.map((v) => normalizeValue(v))
        : normalizeValue(value);

    let selectedIndexes = enumOptionsIndexForValue<S>(
        normalizedValue,
        selectOptions,
        multiple
    );

    const selectedValues = multiple
        ? selectOptions?.reduce(
              (acc: { [key: string]: string }, option, index) => {
                  if (selectedIndexes?.includes(index.toString())) {
                      acc[String(option.value)] = option.label;
                  }
                  return acc;
              },
              {}
          ) ?? {}
        : selectOptions?.find(
              (option) => normalizeValue(option.value) === normalizeValue(value)
          )?.value ?? '';

    if (options.placeholder) {
        placeholder = options.placeholder || '';
    }

    if (readonly)
        return (
            <>
                {multiple
                    ? Object.values(selectedValues).join(', ')
                    : enumOptions?.find(
                          (option) =>
                              normalizeValue(option.value) ===
                              normalizeValue(value)
                      )?.label}
            </>
        );

    return (
        <>
            <label htmlFor={id}>
                {multiple && (
                    <SelectComponent
                        id={id}
                        title={label}
                        isMultiselect={true}
                        value={selectedValues as { [key: string]: string }}
                        required={required}
                        disabled={disabled || readonly}
                        onChange={_onChange}
                        options={selectOptions as MultiselectOption[]}
                        placeholder={placeholder}
                        className={
                            rawErrors.length > 0
                                ? 'is-invalid max-w-sm'
                                : 'max-w-sm'
                        }
                    >
                        {showPlaceholderOption && (
                            <option value="">{placeholder}</option>
                        )}
                        {Array.isArray(enumOptions) &&
                            enumOptions.map(({ value, label }, i) => {
                                const disabled =
                                    enumDisabled &&
                                    enumDisabled.indexOf(value) !== -1;
                                return (
                                    <option
                                        key={i}
                                        value={String(i)}
                                        disabled={disabled}
                                    >
                                        {label}
                                    </option>
                                );
                            })}
                    </SelectComponent>
                )}
                {!multiple && (
                    <SelectComponent
                        id={id}
                        title={label}
                        value={selectedValues as string}
                        required={required}
                        disabled={disabled || readonly}
                        onChange={_onChangeSingle}
                        options={selectOptions as SimpleOption[]}
                        placeholder={placeholder}
                        className="max-w-sm"
                        allowEmptyValue={uiSchema?.['ui:allowEmptyValue']}
                    />
                )}
            </label>
        </>
    );
}

export default SelectWidget;
