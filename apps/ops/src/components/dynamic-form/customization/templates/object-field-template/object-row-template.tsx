import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { TableCell, TableRow } from '@zinnia/bloom/components';
export default function ObjectRowFieldTemplate({ properties, uiSchema = {} }: ObjectFieldTemplateProps): JSX.Element {
    return (
        <TableRow>
            {properties.map(({ content, name }, index) => {
                return (
                    <TableCell key={index} className="typography-content-body-sm">
                        {content}
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
