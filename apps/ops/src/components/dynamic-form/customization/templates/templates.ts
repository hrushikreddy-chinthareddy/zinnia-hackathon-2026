import { FieldTemplate } from './field-template/field-template';
import { TitleFieldTemplate } from './title-field-template/title-field-template';

export function generateTemplates() {
    return { TitleFieldTemplate, FieldTemplate };
}

export default generateTemplates();
