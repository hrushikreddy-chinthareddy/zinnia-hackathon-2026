import { Box, Card, Flex } from '@radix-ui/themes';
import {
    ArrayFieldTemplateItemType,
    ArrayFieldTemplateProps,
    FormContextType,
    getTemplate,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils';

function ArrayFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: ArrayFieldTemplateProps<T, S, F>
) {
    const { canAdd, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, schema, title } = props;

    const uiOptions = getUiOptions<T, S, F>(uiSchema);
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
        <Box className="pl-2">
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
                <Flex direction="column" key={`array-item-list-${idSchema.$id}`} className="border-t px-30 my-4">
                    {items &&
                        items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
                            <ArrayFieldItemTemplate key={key} {...itemProps} />
                        ))}
                    {canAdd && (
                        <Flex direction="column" align="start" className="px-5 pt-5">
                            <AddButton
                                className="array-item-add"
                                title={idSchema.$id}
                                onClick={onAddClick}
                                disabled={disabled || readonly}
                                uiSchema={uiSchema}
                                registry={registry}
                            />
                        </Flex>
                    )}
                </Flex>
            </Card>
        </Box>
    );
}

export default ArrayFieldTemplate;
