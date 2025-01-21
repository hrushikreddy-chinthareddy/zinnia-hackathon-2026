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
import { AxiosResponse } from 'axios';

import SelectComponent from '@deps/components/select/select';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';
import { ApiProps } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';

const baseUrl = baseAppUrl + '/api/';

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
    formData,
    setFormData,
    formContext,
}: WidgetProps<T, S, F>) {
    const dataContext = { ...formData, ...formContext };
    const { enumOptions, enumDisabled, emptyValue: optEmptyVal } = options;

    const { props } = getUiOptions<T, S, F>(uiSchema);
    const apiProps = typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

    const _onChange = (value: string, _displaytext: string, isSelected: boolean = false) => {
        if (!isSelected && Array.isArray(selectedIndexes)) {
            selectedIndexes = selectedIndexes?.filter(
                index => index !== enumOptions?.findIndex(option => option.value.toString() === value).toString()
            );
        }
        const newValue = getValue(isSelected, value, enumOptions, selectedIndexes, multiple);
        onChange(enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal));
    };

    const _onChangeSingle = async (value: string) => {
        const newValue = getValue(false, value, enumOptions, selectedIndexes, multiple);

        if (!apiProps.apiUrl) return onChange(enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal));
        await fetchDetails(apiProps.apiUrl, value, newValue);
    };

    async function fetchDetails(apiUrl: string, value: string, newValue?: any) {
        const payload = replacePlaceholders(apiProps.apiPayload, { ...dataContext, value });

        const response = await client[apiProps?.apiMethod ?? 'get']<any, AxiosResponse<any>>(`${baseUrl}${apiUrl}`, payload ?? undefined);

        const data1 = replacePlaceholders(apiProps.responseData, response);

        const data = {
            ...formData,
            [name]: enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal),
            [apiProps?.responseKey]: data1,
        };

        setFormData(data);
    }
    const showPlaceholderOption = !multiple && schema.default === undefined;
    let selectedIndexes = enumOptionsIndexForValue<S>(value, enumOptions, multiple);

    const selectedValues = multiple
        ? enumOptions?.reduce((acc: { [key: string]: string }, option, index) => {
              if (selectedIndexes?.includes(index.toString())) {
                  acc[option.value] = option.label;
              }
              return acc;
          }, {}) ?? {}
        : enumOptions?.find(option => option.value === value)?.value ?? '';

    const selectOptions =
        enumOptions?.map((option: any) => ({
            value: option.value,
            label: option.label,
            displayText: option.label,
        })) ?? [];

    if (readonly) return <>{Object.values(selectedValues).join(', ')}</>;

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
                        className={rawErrors.length > 0 ? 'is-invalid max-w-sm' : 'max-w-sm'}
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
                )}
                {!multiple && (
                    <SelectComponent
                        id={id}
                        title={`label-${id}`}
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
