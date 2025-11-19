import {
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { IconType } from '@zinnia/bloom/components';
import { useEffect, useMemo } from 'react';

import Radio, {
    RadioItem,
    RadioOrientation,
} from '@deps/components/radio/radio';
import {
    csrApiHelper,
    parseJsonValue,
    stringifyObjectValue,
} from '@deps/helpers/csr-api-helpers';
import { ApiProps, ApiResponseTypes, CardTypes } from '@deps/models/case/task';
import { browserLogError } from '@deps/utils/browser-logging';

import { SingleCard } from '../../templates/card-templates/card-template';
import { HyperLink } from '../hyper-link-widget/hyper-link-widget';

const renderSubElement = (
    option: any,
    properties: any,
    cardType: any,
    icon: any,
    sectionTitle: string
) => {
    switch (cardType) {
        case CardTypes.Hyperlink:
            return (
                <HyperLink
                    title={option.label}
                    label={option.value}
                    value={option.url}
                    type={option.type}
                    disabled={option.disabled}
                    className="border-gray-200 border-1 p-[12px] w-[436px] "
                />
            );
        case CardTypes.Detailed:
            return (
                <SingleCard
                    cardType={cardType as CardTypes}
                    icon={icon as IconType}
                    data={option}
                    properties={properties}
                    sectionTitle={(sectionTitle as string) ?? option.title}
                    className="border-gray-200 border-1 p-[12px] w-[436px] "
                />
            );
    }
};

export type RadioWidgetProps<
    T,
    S extends StrictRJSFSchema,
    F extends FormContextType
> = WidgetProps<T, S, F>;
function RadioWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(widgetProps: RadioWidgetProps<T, S, F>) {
    const {
        options,
        value,
        disabled,
        onChange,
        id,
        uiSchema,
        formContext,
        readonly,
    } = widgetProps;
    const { enumOptions, enumDisabled, inline } = options;
    const {
        customOptions,
        props,
        properties,
        cardType,
        icon,
        sectionTitle,
        allowNullValue,
        showReadOnlyCardView = false,
    } = getUiOptions<T, S, F>(uiSchema);

    useEffect(() => {
        allowNullValue && onChange(value || null);
    }, [allowNullValue]);

    const apiProps =
        typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

    const currentOptions = useMemo(() => {
        const enumOptionsArray = Array.isArray(enumOptions) ? enumOptions : [];

        const merged: RadioItem[] = enumOptionsArray.map((existing) => ({
            ...existing,
        }));

        if (customOptions && Array.isArray(customOptions)) {
            (customOptions as RadioItem[]).forEach((custom) => {
                if (!custom || typeof custom !== 'object') return;

                try {
                    const index = merged.findIndex(
                        (existing) =>
                            stringifyObjectValue(existing?.value) ===
                            stringifyObjectValue(custom?.value)
                    );
                    if (index !== -1) {
                        merged[index] = { ...merged[index], ...custom };
                    } else {
                        merged.push(custom);
                    }
                } catch (error) {
                    merged.push(custom);
                    browserLogError('Error processing radio options:', {
                        error,
                    });
                }
            });
        }

        return merged;
    }, [enumOptions, customOptions]);

    const newOptions = useMemo(() => {
        if (!Array.isArray(currentOptions) || currentOptions.length === 0) {
            return [];
        }

        return currentOptions.map((option: RadioItem) => {
            try {
                return {
                    label: option.label || String(option.value),
                    value: stringifyObjectValue(option.value),
                    disabled: enumDisabled?.includes(option.value) || false,
                    subElement:
                        option.subElement &&
                        renderSubElement(
                            option.subElement,
                            properties,
                            cardType,
                            icon,
                            sectionTitle as string
                        ),
                };
            } catch (error) {
                browserLogError('Error processing radio option:', {
                    option,
                    error,
                });
                return {
                    label: String(option.label || option.value || ''),
                    value: String(option.value || ''),
                    disabled: false,
                };
            }
        });
    }, [
        currentOptions,
        enumDisabled,
        properties,
        cardType,
        icon,
        sectionTitle,
    ]);

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

    const handleOnChange = (event: any) => {
        onChange(parseJsonValue(event.target.value));
        if (apiProps.apiUrl) {
            fetchDetails(event.target.value);
        }
    };

    if (readonly && !showReadOnlyCardView) {
        return (
            <>{enumOptions?.find((option) => option.value === value)?.label}</>
        );
    }

    const selectedValue = newOptions?.find(
        (option) => option.value === stringifyObjectValue(value)
    )?.value;

    return (
        <div>
            <Radio
                id={id}
                items={
                    newOptions.filter(
                        (option) => option.value !== null
                    ) as RadioItem[]
                }
                value={selectedValue as string}
                disabled={disabled}
                readonly={readonly}
                defaultValue={value}
                onChange={handleOnChange}
                className="items-center justify-between text-sm"
                orientation={
                    inline
                        ? RadioOrientation.Horizontal
                        : RadioOrientation.Vertical
                }
            />
        </div>
    );
}

export default RadioWidget;
