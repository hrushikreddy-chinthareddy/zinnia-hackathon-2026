import {
    FormContextType,
    IconButtonProps,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils';
import { Button, Icon, IconType } from '@zinnia/bloom/components';

export default function RemoveButton<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({
    uiSchema,
    registry,
    title,
    ...props
}: Omit<IconButtonProps<T, S, F>, 'iconType'>) {
    return (
        <Button aria-label="Remove" mode="link" size="small" {...props}>
            <Icon type={IconType.TRASH} />
            {title}
        </Button>
    );
}
