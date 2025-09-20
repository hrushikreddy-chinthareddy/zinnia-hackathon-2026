import {
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { IconType } from '@zinnia/bloom/components';
import { useMemo } from 'react';

import InputCheckBox from '@deps/components/checkbox-v2/input-checkbox';
import {
    csrApiHelper,
    stringifyObjectValue,
} from '@deps/helpers/csr-api-helpers';
import { ApiProps, ApiResponseTypes, CardTypes } from '@deps/models/case/task';

import { SingleCard } from '../../templates/card-templates/card-template';

const renderSubElement = (
    option: any,
    properties: any,
    cardType: any,
    icon: any,
    sectionTitle: string
) => {
    switch (cardType) {
        case CardTypes.Detailed:
            return (
                <SingleCard
                    cardType={cardType}
                    icon={icon}
                    data={option}
                    properties={properties}
                    sectionTitle={sectionTitle ?? option.label}
                    className="border-gray-200 border-1 p-[12px] w-[436px]"
                />
            );
        default:
            return null;
    }
};

export type CheckboxesWidgetProps<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> = WidgetProps<T, S, F>;

function CheckboxesWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(widgetProps: CheckboxesWidgetProps<T, S, F>) {
    const {
        options,
        value,
        disabled,
        onChange,
        uiSchema,
        formContext,
        readonly,
    } = widgetProps;
    const { enumOptions, enumDisabled } = options;
    const { customOptions, props, properties, cardType, icon, sectionTitle } =
        getUiOptions<T, S, F>(uiSchema);

    const apiProps =
        typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

    const currentOptions = useMemo(() => {
        const merged: any[] = (enumOptions || []).map((existing) => ({
            ...existing,
        }));

        if (customOptions) {
            (customOptions as any[])?.forEach((custom) => {
                const index = merged.findIndex(
                    (existing) =>
                        stringifyObjectValue(existing.value) ===
                        stringifyObjectValue(custom.value)
                );
                if (index !== -1) {
                    merged[index] = { ...merged[index], ...custom };
                } else {
                    merged.push(custom);
                }
            });
        }
        return merged;
    }, [enumOptions, customOptions]);

    const newOptions = useMemo(() => {
        return Array.isArray(currentOptions)
            ? currentOptions.map((option: any) => ({
                  label: option.label,
                  value: option.value,
                  disabled: enumDisabled?.includes(option.value) || false,
                  subElement:
                      option.metadata &&
                      renderSubElement(
                          option.metadata,
                          properties,
                          cardType as CardTypes,
                          icon as IconType,
                          sectionTitle as string
                      ),
              }))
            : [];
    }, [currentOptions, properties, cardType, icon, sectionTitle]);

    async function fetchDetails(value: any) {
        csrApiHelper(apiProps, { ...formContext?.customData, value }).then(
            (response) => {
                if (apiProps.responseType === ApiResponseTypes.FormData) {
                    formContext?.setCustomData &&
                        formContext.setCustomData({
                            [apiProps?.dataKey]: response,
                        });
                } else {
                    formContext?.updateSchema &&
                        formContext.updateSchema({
                            [apiProps?.dataKey]: response,
                        });
                }
            }
        );
    }

    const handleOnChange = (option: any) => {
        const current = Array.isArray(value) ? value.filter(Boolean) : [];

        // Find if the value is already in the array
        const stringifiedValue = stringifyObjectValue(option.value);
        const isValueIncluded = current.some(
            (v) => stringifyObjectValue(v) === stringifiedValue
        );

        // Create the new value array
        const newValue = isValueIncluded
            ? current.filter(
                  (v) => stringifyObjectValue(v) !== stringifiedValue
              )
            : [...current, option.value];

        onChange(newValue);
        if (apiProps.apiUrl) {
            fetchDetails(stringifiedValue);
        }
    };

    // Convert the current values to strings for comparison

    const selectedValueStrings = new Set(
        (Array.isArray(value) ? value : [])
            .filter(Boolean)
            .map(stringifyObjectValue)
    );

    const isChecked = (option: any) =>
        selectedValueStrings.has(stringifyObjectValue(option.value));

    return (
        <div>
            {newOptions.map((option: any) => (
                <div key={option.label} className="mb-4 flex">
                    <InputCheckBox
                        checked={isChecked(option)}
                        onChange={() => handleOnChange(option)}
                        isDisabled={disabled || readonly || option.disabled}
                        className="mr-2"
                    />
                    {option.subElement ? option.subElement : option.label}
                </div>
            ))}
        </div>
    );
}

export default CheckboxesWidget;
