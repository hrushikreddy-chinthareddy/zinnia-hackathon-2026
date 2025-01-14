import ArrayFieldItemTemplate from './array-field-item-template/array-field-item-template';
import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import AddButton from './button-templates/add-button/add-button';
import RemoveButton from './button-templates/remove-button/remove-button';
import { CardTemplate } from './card-templates/card-template';
import { DocumentCardTemplate } from './card-templates/document-card-template';
import { PartyCardTemplate } from './card-templates/party-card-template';
import FieldErrorTemplate from './field-error-template/field-error-template';
import { FieldTemplate } from './field-template/field-template';
import InstructionsTemplate from './instructions-template/instructions-template';
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
        PartyCardTemplate,
        CardTemplate,
        DocumentCardTemplate,
        InstructionsTemplate,
        ButtonTemplates: { AddButton, RemoveButton },
    };
}

export default generateTemplates();
