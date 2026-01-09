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
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import React, { useState, useMemo } from 'react';

import { isStringWithBrackets } from '@deps/helpers/string.helpers';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';

import style from './array-field.module.css';

export const SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

type SortDirection = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];

function ArrayFieldTemplate<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ArrayFieldTemplateProps<T, S, F>) {
    const {
        canAdd,
        disabled,
        idSchema,
        uiSchema,
        items,
        onAddClick,
        readonly,
        registry,
        required,
        schema,
        title,
    } = props;

    const uiOptions = getUiOptions(uiSchema);
    const { templateType } = getUiOptions(uiSchema?.items);
    const { sorting } = uiOptions;

    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: SortDirection;
    } | null>(null);

    const ArrayFieldDescriptionTemplate = getTemplate<
        'ArrayFieldDescriptionTemplate',
        T,
        S,
        F
    >('ArrayFieldDescriptionTemplate', registry, uiOptions);
    const ArrayFieldItemTemplate = getTemplate<
        'ArrayFieldItemTemplate',
        T,
        S,
        F
    >('ArrayFieldItemTemplate', registry, uiOptions);
    const ArrayFieldTitleTemplate = getTemplate<
        'ArrayFieldTitleTemplate',
        T,
        S,
        F
    >('ArrayFieldTitleTemplate', registry, uiOptions);
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates;

    const sortedItems = useMemo(() => {
        if (!sortConfig || !items) return items;
        const { key, direction } = sortConfig;
        return [...items].sort((a, b) => {
            let aVal = (a.children.props.formData?.[key] ?? '') as string;
            let bVal = (b.children.props.formData?.[key] ?? '') as string;
            if (isStringWithBrackets(aVal)) {
                aVal = replacePlaceholders(aVal, a.children.props.formData);
            }
            if (isStringWithBrackets(bVal)) {
                bVal = replacePlaceholders(bVal, b.children.props.formData);
            }
            if (aVal < bVal) return direction === SORT_DIRECTION.ASC ? -1 : 1;
            if (aVal > bVal) return direction === SORT_DIRECTION.ASC ? 1 : -1;
            return 0;
        });
    }, [items, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return {
                    key,
                    direction:
                        prev.direction === SORT_DIRECTION.ASC
                            ? SORT_DIRECTION.DESC
                            : SORT_DIRECTION.ASC,
                };
            }
            return { key, direction: SORT_DIRECTION.ASC };
        });
    };

    return (
        <>
            {templateType === 'table' && items?.length > 0 ? (
                <div className="my-2 pt-2">
                    <Table>
                        <React.Fragment>
                            <TableHeader>
                                <TableRow>
                                    {Object.keys(
                                        (schema.items as any)?.properties
                                    ).map((key, index) => (
                                        <TableHeaderCell
                                            key={index}
                                            className="typography-content-body-sm-bold cursor-pointer"
                                        >
                                            <button
                                                onClick={() =>
                                                    sorting && handleSort(key)
                                                }
                                            >
                                                {
                                                    (schema.items as any)
                                                        ?.properties[key].title
                                                }
                                                {sorting &&
                                                    sortConfig?.key === key &&
                                                    (sortConfig.direction ===
                                                    SORT_DIRECTION.ASC
                                                        ? ' 🔼'
                                                        : ' 🔽')}
                                            </button>
                                        </TableHeaderCell>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedItems &&
                                    sortedItems.map(
                                        ({
                                            key,
                                            ...itemProps
                                        }: ArrayFieldTemplateItemType<
                                            T,
                                            S,
                                            F
                                        >) => (
                                            <ArrayFieldItemTemplate
                                                key={key}
                                                {...itemProps}
                                            />
                                        )
                                    )}
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
                        description={
                            uiOptions.description || schema.description
                        }
                        schema={schema}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                    <div
                        key={`array-item-list-${idSchema.$id}`}
                        className={style.arrayFieldList}
                    >
                        {items &&
                            items.map(
                                ({
                                    key,
                                    ...itemProps
                                }: ArrayFieldTemplateItemType<T, S, F>) => (
                                    <ArrayFieldItemTemplate
                                        key={key}
                                        {...itemProps}
                                    />
                                )
                            )}
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
