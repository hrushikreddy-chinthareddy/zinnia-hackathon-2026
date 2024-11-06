import ArrayFieldItemTemplate from './array-field-item-template/ArrayFieldItemTemplate';
import ArrayFieldTemplate from './array-field-template/array-field-template';
import AddButton from './button-templates/add-button/AddButton';
import RemoveButton from './button-templates/remove-button/RemoveButton';
import { FieldTemplate } from './field-template/field-template';
import { TitleFieldTemplate } from './title-field-template/title-field-template';

export function generateTemplates() {
    return { TitleFieldTemplate, FieldTemplate, ArrayFieldTemplate, ArrayFieldItemTemplate, ButtonTemplates: { AddButton, RemoveButton } };
}

export default generateTemplates();
