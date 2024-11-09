import { ArrayFieldTemplateProps, isObject, UiSchema } from '@rjsf/utils';

import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';

export const UITempleteMap: Record<string, (props: ArrayFieldTemplateProps) => React.JSX.Element> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
};

export const ApplyUITemplates = (uiSchema: UiSchema) => {
    Object.keys(uiSchema).forEach(key => {
        if (isObject(uiSchema[key])) {
            if (key.indexOf('ui:options') !== -1) {
                Object.keys(uiSchema[key]).forEach(optionKey => {
                    if (UITempleteMap[uiSchema[key][optionKey]] !== undefined) {
                        uiSchema[key][optionKey] = UITempleteMap[uiSchema[key][optionKey]];
                    }
                });
            } else if (key.indexOf('ui:') === -1) {
                ApplyUITemplates(uiSchema[key]);
            }
        }
    });
};
