import { Card } from '@radix-ui/themes';
import {
    ArrayFieldTemplateItemType,
    ArrayFieldTemplateProps,
    FormContextType,
    getTemplate,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils';
import { Table, TableBody } from '@zinnia/bloom/components';
import React from 'react';
import style from './array-field.module.css';

import { TableHeader, TableHeaderCell, TableRow } from '@zinnia/bloom/components';
function ArrayFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: ArrayFieldTemplateProps<T, S, F>
) {
    const { canAdd, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, schema, title } = props;

    const uiOptions = getUiOptions(uiSchema);
    const { templateType } = getUiOptions(uiSchema?.items);

    const ArrayFieldDescriptionTemplate = getTemplate<'ArrayFieldDescriptionTemplate', T, S, F>(
        'ArrayFieldDescriptionTemplate',
        registry,
        uiOptions
    );
    const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>('ArrayFieldItemTemplate', registry, uiOptions);
    const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>('ArrayFieldTitleTemplate', registry, uiOptions);
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates;

    return (
        <>
            {templateType === 'table' && items?.length > 0 ? (
                <div className="my-2 pt-2">
                    <Table>
                        <React.Fragment>
                            <TableHeader>
                                <TableRow>
                                    {Object.keys((schema.items as any)?.properties).map((key, index) => (
                                        <TableHeaderCell key={index} className="typography-content-body-sm-bold">
                                            {(schema.items as any)?.properties[key].title}
                                        </TableHeaderCell>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items &&
                                    items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
                                        <ArrayFieldItemTemplate key={key} {...itemProps} />
                                    ))}
                            </TableBody>
                        </React.Fragment>
                    </Table>
                </div>
            ) : (
                <Card variant="classic">
                    <ArrayFieldTitleTemplate
                        idSchema={idSchema}
                        title={uiOptions.title || title}
                        schema={schema}
                        uiSchema={uiSchema}
                        required={required}
                        registry={registry}
                    />
                    <ArrayFieldDescriptionTemplate
                        idSchema={idSchema}
                        description={uiOptions.description || schema.description}
                        schema={schema}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                    <div key={`array-item-list-${idSchema.$id}`} className={style.arrayFieldList}>
                        {items &&
                            items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
                                <ArrayFieldItemTemplate key={key} {...itemProps} />
                            ))}
                        {canAdd && !readonly && (
                            <div className="flex">
                                <AddButton
                                    className="array-item-add"
                                    title={idSchema.$id}
                                    onClick={onAddClick}
                                    disabled={disabled || readonly}
                                    uiSchema={uiSchema}
                                    registry={registry}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
}

export default ArrayFieldTemplate;
