import { FormContextType, IconButtonProps, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';

export default function RemoveButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    uiSchema,
    registry,
    title,
    ...props
}: IconButtonProps<T, S, F>) {
    const { translateString } = registry;
    return (
        <Button aria-label="Remove" mode="primary" size="small" {...props}>
            {title?.split('_').findLast(s => s !== 's') || translateString(TranslatableString.RemoveButton)}
        </Button>
    );
}
