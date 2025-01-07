import { ArrayFieldTemplateProps, isObject, ObjectFieldTemplateProps, UiSchema } from '@rjsf/utils';

import { AccordionTemplate } from '../customization/templates/accordian-template/accordian-template';
import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';
import { DocumentCardTemplate } from '../customization/templates/card-templates/document-card-template';
import { PartyCardTemplate } from '../customization/templates/card-templates/party-card-template';

export const UIArrayTemplateMap: Record<string, (props: ArrayFieldTemplateProps) => React.JSX.Element> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
};

export const UIObjectTemplateMap: Record<string, (props: ObjectFieldTemplateProps) => React.JSX.Element> = {
    ['PartyCardTemplate']: PartyCardTemplate,
    ['DocumentCardTemplate']: DocumentCardTemplate,
    ['AccordionTemplate']: AccordionTemplate,
};

export const ApplyUITemplates = (uiSchema: UiSchema) => {
    Object.keys(uiSchema).forEach(key => {
        if (isObject(uiSchema[key])) {
            if (key.indexOf('ui:options') !== -1) {
                Object.keys(uiSchema[key]).forEach(optionKey => {
                    if (UIArrayTemplateMap[uiSchema[key][optionKey]] !== undefined) {
                        uiSchema[key][optionKey] = UIArrayTemplateMap[uiSchema[key][optionKey]];
                    }
                    if (UIObjectTemplateMap[uiSchema[key][optionKey]] !== undefined) {
                        uiSchema[key][optionKey] = UIObjectTemplateMap[uiSchema[key][optionKey]];
                    }
                });
            } else if (key.indexOf('ui:') === -1) {
                ApplyUITemplates(uiSchema[key]);
            }
        }
    });
};
