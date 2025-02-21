import {
    descriptionId,
    getTemplate,
    schemaRequiresTrueValue,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

export default function CheckboxWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const { schema, id, value, disabled, label = '', hideLabel, onChange, registry, options, uiSchema } = props;
    const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>('DescriptionFieldTemplate', registry, options);
    const required = schemaRequiresTrueValue<S>(schema);

    const description = options.description ?? schema.description;

    const _onChange = (_: any, checked: boolean) => onChange(checked);

    return (
        <>
            {!hideLabel && !!description && (
                <DescriptionFieldTemplate
                    id={descriptionId<T>(id)}
                    description={description}
                    schema={schema}
                    uiSchema={uiSchema}
                    registry={registry}
                />
            )}

            <CheckboxText
                id={id}
                key={value}
                label={hideLabel ? '' : label}
                onChange={() => _onChange(value, !value)}
                checked={typeof value === 'undefined' ? false : Boolean(value)}
                isDisabled={disabled}
                required={required}
            />
        </>
    );
}