import { getUiOptions, IconButtonProps, TranslatableString } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';

export default function AddButton({
    uiSchema,
    registry,
    ...props
}: Omit<IconButtonProps, 'iconType'>) {
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
