import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { IconType } from '@zinnia/bloom/components';
import { useMemo } from 'react';

import Radio, { RadioItem } from '@deps/components/radio/radio';
import { ApiProps, ApiResponseTypes, CardTypes } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';

import { SingleCard } from '../../templates/card-templates/card-template';
import { HyperLink } from '../hyper-link-widget/hyper-link-widget';
import { csrApiHelper } from '@deps/helpers/csr-api-helper';
const baseUrl = baseAppUrl + '/api/';

const renderSubElement = (option: any, properties: any, cardType: any, icon: any, sectionTitle: string) => {
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

export type RadioWidgetProps<T, S extends StrictRJSFSchema, F extends FormContextType> = WidgetProps<T, S, F>;
function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(widgetProps: RadioWidgetProps<T, S, F>) {
    const { options, value, disabled, onChange, id, uiSchema,formContext } = widgetProps;

    const { enumOptions, enumDisabled } = options;
    const { customOptions, props, properties, cardType, icon, sectionTitle } = getUiOptions<T, S, F>(uiSchema);

    const apiProps = typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

    const currentOptions = useMemo(() => {
        return enumOptions || customOptions || [];
    }, [enumOptions, customOptions]);

    const newOptions = useMemo(() => {
        return Array.isArray(currentOptions)
            ? currentOptions.map((option: RadioItem) => ({
                label: option.label,
                value: option.value,
                disabled: enumDisabled?.includes(option.value) || false,
                subElement: option.subElement && renderSubElement(option.subElement, properties, cardType, icon, sectionTitle as string),
            }))
            : [];
    }, [currentOptions]);

    async function fetchDetails(value: string) {
        csrApiHelper(apiProps, { ...formContext?.customData, value }).then(response => {
            if (apiProps.responseType === ApiResponseTypes.FormData) {
                formContext?.setCustomData && formContext.setCustomData({[apiProps?.dataKey]: response });
            } else {
                formContext?.updateSchema && formContext.updateSchema({[apiProps?.dataKey]: response });
            }
        });
    }

    const handleOnChange = (event: any) => {
        onChange(event.target.value);
        if (apiProps.apiUrl) {
            fetchDetails(event.target.value);
        }
    };

    return (
        <div>
            <Radio
                id={id}
                items={newOptions}
                value={value}
                disabled={disabled}
                defaultValue={value}
                onChange={handleOnChange}
                className="items-center justify-between text-sm"
            />
        </div>
    );
}

export default RadioWidget;
