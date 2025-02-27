import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, SubmitButtonProps } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { ButtonSize } from '@deps/components/button/button';

export default function SubmitButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: SubmitButtonProps<T, S, F>
) {
    const { uiSchema, registry, ...buttonProps } = props;
    const { submitButtonOptions } = getUiOptions(uiSchema);
    const { t } = useTranslation(undefined, { keyPrefix: 'general' });

    if (submitButtonOptions?.norender) {
        return null;
    }
    return (
        <div className="flex gap-2">
            <Button aria-label={t('continue') as string} mode="primary" size={ButtonSize.Small} type={'submit'} {...buttonProps}>
                {submitButtonOptions?.submitText ?? t('submit')}
            </Button>

            <Button aria-label={t('cancel') as string} mode="secondary" size={ButtonSize.Small} onClick={registry.formContext.onCancel}>
                {t('cancel')}
            </Button>
        </div>
    );
}
