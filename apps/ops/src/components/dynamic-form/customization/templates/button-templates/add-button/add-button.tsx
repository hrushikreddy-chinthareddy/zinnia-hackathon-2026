import { FormContextType, getUiOptions, IconButtonProps, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';

export default function AddButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    uiSchema,
    registry,
    title,
    ...props
}: IconButtonProps<T, S, F>) {
    const { translateString } = registry;
    const uiOptions = getUiOptions<T, S, F>(uiSchema?.items);

    return (
        <Button aria-label="Add" mode="primary" size="small" {...props}>
            Add {uiOptions.title || translateString(TranslatableString.AddButton)}
        </Button>
    );
}
