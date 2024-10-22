import ArrayFieldTableTemplate from './array-field-template/array-field-table-template';
import { TitleFieldTemplate } from './title-field-template/title-field-template';

export function generateTemplates() {
    return { TitleFieldTemplate, ArrayFieldTemplate: ArrayFieldTableTemplate };
}

export default generateTemplates();
