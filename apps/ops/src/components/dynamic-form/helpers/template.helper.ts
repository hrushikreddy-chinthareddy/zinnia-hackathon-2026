import { ArrayFieldTemplateProps, UiSchema } from '@rjsf/utils';

import ArrayFieldTableTemplate from '../customization/templates/array-field-template/array-field-table-template';
import ArrayFieldTemplate from '../customization/templates/array-field-template/array-field-template';

export const UITempleteMap: Record<string, (props: ArrayFieldTemplateProps) => React.JSX.Element> = {
    ['ArrayFieldTemplate']: ArrayFieldTemplate,
    ['ArrayFieldTableTemplate']: ArrayFieldTableTemplate,
};

export const ApplyUITemplates = (uiSchema: UiSchema) => {
    Object.keys(uiSchema).forEach((key: string) => {
        if (uiSchema[key] && key !== '$schema' && uiSchema[key]['ui:ArrayFieldTemplate']) {
            if (typeof uiSchema[key]['ui:ArrayFieldTemplate'] === 'string')
                uiSchema[key]['ui:ArrayFieldTemplate'] = UITempleteMap[uiSchema[key]['ui:ArrayFieldTemplate']];
        }
    });
};
