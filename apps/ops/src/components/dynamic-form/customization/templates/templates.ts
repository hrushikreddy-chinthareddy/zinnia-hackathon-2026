import ArrayFieldItemTemplate from './array-field-item-template/array-field-item-template';
import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import AddButton from './button-templates/add-button/add-button';
import RemoveButton from './button-templates/remove-button/remove-button';
import FieldErrorTemplate from './field-error-template/field-error-template';
import { FieldTemplate } from './field-template/field-template';
import { ObjectFieldTemplate } from './object-field-template/object-field-template';
import { PartyCardTemplate } from './party-card-template/party-card-template';
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
        PartyCardTemplate,
        ButtonTemplates: { AddButton, RemoveButton },
    };
}

export default generateTemplates();
