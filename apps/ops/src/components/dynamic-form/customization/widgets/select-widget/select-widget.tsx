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
    csrApiHelper,
    parseJsonValue,
    isString,
    stringifyValue,
} from '@deps/helpers/csr-api-helpers';
import {
    ApiProps,
    ApiResponseTypes,
    EventType,
    TaskEventProps,
} from '@deps/models/case/task';

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
        const index = enumOptions.findIndex((option) => option.value === value);
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
        return enumOptions
            .findIndex((option) => option.value === value)
            .toString();
    }
}
function SelectWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({
    schema,
    id,
    name,
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
                    enumOptions
                        ?.findIndex(
                            (option) => option.value.toString() === value
                        )
                        .toString()
            );
        }
        const newValue = getValue(
            isSelected,
            value,
            enumOptions,
            selectedIndexes,
            multiple
        );
        onChange(
            enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal)
        );
    };

    const _onChangeSingle = async (value: string) => {
        const newValue = getValue(
            false,
            value,
            enumOptions,
            selectedIndexes,
            multiple
        );

        eventProps?.forEach((eventProp) => {
            if (eventProp?.taskEventType == EventType.onChange) {
                const parsedValue = parseJsonValue(value);
                formData?.setCustomData &&
                    formData.setCustomData({
                        [eventProp?.dataKey]:
                            parsedValue[eventProp?.responseData] ?? parsedValue,
                    });
            }
        });

        if (!apiProps.apiUrl)
            return onChange(
                enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal)
            );
        await fetchDetails(value, newValue);
    };

    async function fetchDetails(value: string, newValue?: any) {
        onChange(
            enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal)
        );

        const parsedValue = parseJsonValue(value);

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
        ? value.map((v) => (isString(v) ? v : stringifyValue(v)))
        : isString(value)
        ? value
        : stringifyValue(value);
    let selectedIndexes = enumOptionsIndexForValue<S>(
        normalizedValue,
        enumOptions,
        multiple
    );

    const selectedValues = multiple
        ? enumOptions?.reduce(
              (acc: { [key: string]: string }, option, index) => {
                  if (selectedIndexes?.includes(index.toString())) {
                      acc[option.value] = option.label;
                  }
                  return acc;
              },
              {}
          ) ?? {}
        : enumOptions?.find((option) => option.value === value)?.value ?? '';

    const selectOptions =
        enumOptions?.map((option: any) => ({
            value: option.value,
            label: option.label,
            displayText: option.label,
        })) ?? [];

    if (options.placeholder) {
        placeholder = options.placeholder || '';
    }

    if (readonly)
        return (
            <>
                {multiple
                    ? Object.values(selectedValues).join(', ')
                    : enumOptions?.find((option) => option.value === value)
                          ?.label}
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
                        options={selectOptions}
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
                        options={selectOptions}
                        placeholder={placeholder}
                        className="max-w-sm"
                    />
                )}
            </label>
        </>
    );
}

export default SelectWidget;
