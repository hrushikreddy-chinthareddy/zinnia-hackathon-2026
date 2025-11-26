import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { TableCell, TableRow } from '@zinnia/bloom/components';
export default function ObjectRowFieldTemplate({
    properties,
}: ObjectFieldTemplateProps): JSX.Element {
    return (
        <TableRow>
            {properties.map(({ content }, index) => {
                return (
                    <TableCell
                        key={index}
                        className="typography-content-body-sm"
                    >
                        {content}
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
