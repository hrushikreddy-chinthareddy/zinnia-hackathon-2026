import { ArrayFieldTemplateProps, isObject, UiSchema } from '@rjsf/utils';

import AddressFieldTemplate from '../customization/templates/address-field-template/address-field-template';
import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';
import { CardTemplate } from '../customization/templates/card-templates/card-template';
import { ChangeAddressTemplate } from '../customization/templates/change-address-templete/change-address-template';
import DifferenceTemplate from '../customization/templates/difference-template/difference-template';
import InstructionsTemplate from '../customization/templates/instructions-template/instructions-template';
import FileInfoTemplate from '../customization/templates/object-field-template/file-info-template';
import ObjectRowFieldTemplate from '../customization/templates/object-field-template/object-row-template';
import TextListTemplate from '../customization/templates/text-list-template';

export const UIArrayTemplateMap: Record<string, (props: ArrayFieldTemplateProps) => React.JSX.Element> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
    ['TextListTemplate']: TextListTemplate,
    ['FileInfoTemplate']: FileInfoTemplate,
};

export const UIObjectTemplateMap: Record<string, (props: any) => React.JSX.Element> = {
    ['CardTemplate']: CardTemplate,
    ['InstructionsTemplate']: InstructionsTemplate,
    ['AddressFieldTemplate']: AddressFieldTemplate,
    ['ObjectRowFieldTemplate']: ObjectRowFieldTemplate,
    ['DifferenceTemplate']: DifferenceTemplate,
    ['ChangeAddressTemplate']: ChangeAddressTemplate,
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
