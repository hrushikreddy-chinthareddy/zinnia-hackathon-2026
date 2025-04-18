import AddressFieldTemplate from './address-field-template/address-field-template';
import ArrayFieldItemTemplate from './array-field-item-template/array-field-item-template';
import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import AddButton from './button-templates/add-button/add-button';
import RemoveButton from './button-templates/remove-button/remove-button';
import SubmitButton from './button-templates/submit-button/submit-button';
import { CardTemplate } from './card-templates/card-template';
import DifferenceTemplate from './difference-template';
import FieldErrorTemplate from './field-error-template/field-error-template';
import { FieldTemplate } from './field-template/field-template';
import InstructionsTemplate from './instructions-template/instructions-template';
import FileInfoTemplate from './object-field-template/file-info-template';
import { ObjectFieldTemplate } from './object-field-template/object-field-template';
import ObjectRowFieldTemplate from './object-field-template/object-row-template';
import TextListTemplate from './text-list-template';
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
        CardTemplate,
        InstructionsTemplate,
        TextListTemplate,
        FileInfoTemplate,
        AddressFieldTemplate,
        ObjectRowFieldTemplate,
        DifferenceTemplate,
        ButtonTemplates: { AddButton, RemoveButton, SubmitButton },
    };
}

export default generateTemplates();
