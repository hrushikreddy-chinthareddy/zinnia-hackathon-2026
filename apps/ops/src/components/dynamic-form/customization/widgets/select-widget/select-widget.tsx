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
import { csrApiHelper } from '@deps/helpers/csr-api-helper';
import { ApiProps, ApiResponseTypes } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';

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
    formContext,
}: WidgetProps<T, S, F>) {
    const formData = formContext;

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
        onChange(enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyVal));
        csrApiHelper(apiProps, { ...formContext?.customData, value }).then(response => {
            if (apiProps.responseType === ApiResponseTypes.FormData) {
                formData?.setCustomData && formData.setCustomData({ [apiProps?.dataKey]: response });
            } else {
                formData?.updateSchema && formData.updateSchema({ [apiProps?.dataKey]: response });
            }
        });
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
