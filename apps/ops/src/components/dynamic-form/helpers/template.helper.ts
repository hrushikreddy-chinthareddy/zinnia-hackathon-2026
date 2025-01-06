import { isObject, UiSchema } from '@rjsf/utils';

import { AccordionTemplate } from '../customization/templates/accordian-template/accordian-template';
import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';
import { PartyCardTemplate } from '../customization/templates/party-card-template/party-card-template';

export const UITempleteMap: Record<string, (props: any) => React.JSX.Element> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['PartyCardTemplate']: PartyCardTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
    ['AccordionTemplate']: AccordionTemplate,
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
