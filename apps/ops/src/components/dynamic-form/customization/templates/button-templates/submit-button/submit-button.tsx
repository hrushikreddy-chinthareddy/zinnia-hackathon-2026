import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, SubmitButtonProps } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { ButtonSize } from '@deps/components/button/button';

export default function SubmitButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    uiSchema,
    registry,

    ...props
}: SubmitButtonProps<T, S, F>) {
    const { submitButtonOptions } = getUiOptions(uiSchema);
    const { t } = useTranslation(undefined, { keyPrefix: 'general' });

    if (submitButtonOptions?.norender) {
        return null;
    }
    return (
        <Button aria-label={t('continue') as string} mode="primary" size={ButtonSize.Small} type={'submit'} {...props}>
            {t('submit')}
        </Button>
    );
}
