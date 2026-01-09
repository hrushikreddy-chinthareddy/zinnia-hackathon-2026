import { UiSchema } from '@rjsf/utils';
import React from 'react';

type WithUiSchemaProps = {
    uiSchema?: UiSchema;
};
type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export function injectRowFormDataIntoChildren(
    children: React.ReactNode,
    rowFormData: JsonValue
): React.ReactNode {
    return React.Children.map(children, (child) => {
        if (!React.isValidElement<WithUiSchemaProps>(child)) {
            return child;
        }

        const existingUiSchema = child.props.uiSchema ?? {};
        const existingUiOptions =
            (existingUiSchema['ui:options'] as Record<string, JsonValue>) ?? {};

        return React.cloneElement(child, {
            uiSchema: {
                ...existingUiSchema,
                'ui:options': {
                    ...existingUiOptions,
                    rowFormData,
                },
            },
        });
    });
}
