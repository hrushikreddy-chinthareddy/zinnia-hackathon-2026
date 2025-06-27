import {
    FormContextType,
    getUiOptions,
    IconButtonProps,
    RJSFSchema,
    StrictRJSFSchema,
    TranslatableString,
} from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';

export default function AddButton<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({ uiSchema, registry, ...props }: IconButtonProps) {
    const { translateString } = registry;
    const { title, defaultItemLabel } = getUiOptions(uiSchema?.items);

    return (
        <Button aria-label="Add" mode="link" size="small" {...props}>
            + Add{' '}
            {(defaultItemLabel as string) ||
                title ||
                translateString(TranslatableString.AddButton)}
        </Button>
    );
}
