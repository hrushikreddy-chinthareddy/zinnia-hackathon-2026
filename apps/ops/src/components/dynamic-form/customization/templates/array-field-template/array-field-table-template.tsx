import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@zinnia/bloom/components';
import React, { useEffect, useState } from 'react';

export function ArrayFieldTableTemplate(props: ArrayFieldTemplateProps) {
    const { items, schema, formData } = props;
    const [columns, setColumns] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const cols: { [key: string]: string } = {};
        if (items.length > 0) {
            const properties = items[0].schema.properties;
            for (const property in properties) {
                cols[property] = (properties[property] as any).title;
            }
        }
        setColumns(cols);
    }, [items]);

    return (
        <>
            {schema.type === 'array' && (
                <Table>
                    <React.Fragment>
                        <TableHeader>
                            <TableRow>
                                {Object.values(columns).map((value, index) => (
                                    <TableHeaderCell key={index} className="typography-content-body-sm-bold">
                                        {value}
                                    </TableHeaderCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.map((element: any) => (
                                <TableRow key={element.key}>
                                    {Object.keys(element).map((property, index) => (
                                        <TableCell key={index} className="typography-content-body-sm">
                                            {element[property]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </React.Fragment>
                </Table>
            )}
        </>
    );
}

export default ArrayFieldTableTemplate;
