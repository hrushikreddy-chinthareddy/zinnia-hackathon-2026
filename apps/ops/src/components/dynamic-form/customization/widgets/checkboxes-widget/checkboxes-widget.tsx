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
import { csrApiHelper } from '@deps/helpers/csr-api-helpers';
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
        return enumOptions || customOptions || [];
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

    async function fetchDetails(value: string) {
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

    const handleOnChange = (optionValue: string) => {
        const current = Array.isArray(value) ? value.filter(Boolean) : [];
        const newValue = current.includes(optionValue)
            ? current.filter((v) => v !== optionValue)
            : [...current, optionValue];
        onChange(newValue);
        if (apiProps.apiUrl) {
            fetchDetails(optionValue);
        }
    };

    if (readonly) {
        const selectedRecordIdSet = new Set(
            (Array.isArray(value) ? value : [value])
                .filter((val) => typeof val === 'object' && val?.recordId)
                .map((val) => val.recordId)
        );

        return (
            <div>
                {newOptions.map((option) => {
                    let optionRecordId: string | null = null;
                    try {
                        const parsed = JSON.parse(option.value);
                        optionRecordId = parsed?.recordId ?? null;
                    } catch {}

                    const isChecked =
                        optionRecordId &&
                        selectedRecordIdSet.has(optionRecordId);

                    return (
                        <div key={option.value} className="mb-4 flex">
                            <InputCheckBox
                                checked={!!isChecked}
                                isDisabled={true}
                                onChange={() => {}}
                                className="mr-2"
                            />
                            {option.subElement
                                ? option.subElement
                                : option.label}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div>
            {newOptions.map((option: any) => (
                <div key={option.value} className="mb-4 flex">
                    <InputCheckBox
                        checked={
                            Array.isArray(value) && value.includes(option.value)
                        }
                        onChange={() => handleOnChange(option.value)}
                        isDisabled={disabled || option.disabled}
                        className="mr-2"
                    />
                    {option.subElement ? option.subElement : option.label}
                </div>
            ))}
        </div>
    );
}

export default CheckboxesWidget;
