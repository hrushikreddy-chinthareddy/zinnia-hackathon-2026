import ArrayFieldItemTemplate from './array-field-item-template/ArrayFieldItemTemplate';
import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import AddButton from './button-templates/add-button/AddButton';
import RemoveButton from './button-templates/remove-button/RemoveButton';
import FieldErrorTemplate from './field-error-template/field-error-template';
import { FieldTemplate } from './field-template/field-template';
import { ObjectFieldTemplate } from './object-field-template/object-field-template';
import { TitleFieldTemplate } from './title-field-template/title-field-template';

export function generateTemplates() {
    return {
        TitleFieldTemplate,
        FieldTemplate,
        ArrayFieldTemplate,
        ArrayFieldItemTemplate,
        ObjectFieldTemplate,
        FieldErrorTemplate,
        ArrayFieldTableTemplate,
        ButtonTemplates: { AddButton, RemoveButton },
    };
}

export default generateTemplates();
