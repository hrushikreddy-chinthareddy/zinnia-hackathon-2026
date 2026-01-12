import { getUiOptions, ObjectFieldTemplateProps, UiSchema } from '@rjsf/utils';
import { TableCell, TableRow } from '@zinnia/bloom/components';

import { injectRowFormDataIntoChildren } from './inject-row-form-data-into-children';

export default function ObjectRowFieldTemplate({
    properties,
    uiSchema = {},
    formData,
}: ObjectFieldTemplateProps): JSX.Element {
    const uiOptions = getUiOptions(uiSchema as UiSchema);
    const passrow = uiOptions?.passrow;

    return (
        <TableRow>
            {properties.map(({ content }, index) => (
                <TableCell key={index} className="typography-content-body-sm">
                    {passrow
                        ? injectRowFormDataIntoChildren(content, formData)
                        : content}
                </TableCell>
            ))}
        </TableRow>
    );
}
